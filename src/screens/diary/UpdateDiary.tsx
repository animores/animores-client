import React from "react";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from "../../navigation/type";
import {ScreenName} from "../../statics/constants/ScreenName";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {DiaryService} from "../../service/DiaryService";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DiaryFormEditor from "../../components/diary/DiaryFormEditor";

const UpdateDiary = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof ScreenName.UpdateDiary>>();
  const queryClient = useQueryClient();
  const { item } = route.params;

  const navigation = useNavigation<StackNavigationProp<RootStackParamList, ScreenName.UpdateDiary>>();

  // 일지 수정
  const { mutate } = useMutation({
    mutationFn: async (data: { diaryId: number; payload: { profileId: number; content: string } }) => {
      return DiaryService.diary.update(Number(data.diaryId), data.payload);
    }
  });

  const handleSubmit= async (content: string, imageUrls: string[]) => {
    try {
      const profile = await AsyncStorage.getItem("userInfo");
      const parsedProfile = profile ? JSON.parse(profile) : null;
      const profileId = parsedProfile?.id;

      if (!profileId || !content) {
        Toast.show({ type: "error", text1: "내용을 입력해주세요." });
        return;
      }

      const payload = { profileId, content };

      mutate({ diaryId: item.diaryId, payload }, {
        onSuccess: (response) => {
            Toast.show({
              type: 'success',
              text1: '일지가 수정되었습니다.',
            });
            queryClient.invalidateQueries({ queryKey: ['DIARY_LIST'] });
            navigation.goBack();
        },
        onError: (error) => {
          console.error('Update error:', error);
            Toast.show({
                type: 'error',
                text1: '일지 수정이 실패했습니다.'
            });
        }
      });
    } catch (error) {
      console.error("handleSubmit error:", error);
    }
  }

  return (
    <DiaryFormEditor
      headerTitle="일지 수정하기"
      submitButtonText="완료"
      initialContent={item.content}
      //initialImageUrls={item.images}
      onSubmit={handleSubmit}
      onBack={() => navigation.goBack()}
    />
  );
};

export default UpdateDiary;
