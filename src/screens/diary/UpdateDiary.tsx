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

type UpdateDiaryRouteProp = RouteProp<RootStackParamList, ScreenName.UpdateDiary>;
type UpdateDiaryNav = StackNavigationProp<RootStackParamList, ScreenName.UpdateDiary>;

const UpdateDiary = () => {
  const route = useRoute<UpdateDiaryRouteProp>();
  const navigation = useNavigation<UpdateDiaryNav>();
  const queryClient = useQueryClient();
  const { item } = route.params;

  // 일지 수정
  const { mutate } = useMutation({
    mutationFn: async (data: { diaryId: number; payload: { profileId: number; content: string; images?: string[] } }) => {
      return DiaryService.diary.update(data.diaryId, data.payload);
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "일지가 수정되었습니다.",
      });

      queryClient.invalidateQueries({ queryKey: ["DIARY_LIST"] });
      navigation.goBack();
    },
    onError: (error) => {
      console.error("Update error:", error);
      Toast.show({
        type: "error",
        text1: "일지 수정에 실패했습니다.",
      });
    }
  });

  const handleSubmit= async (content: string, imageUrls: string[]) => {
    try {
      const profile = await AsyncStorage.getItem("userInfo");
      const parsedProfile = profile ? JSON.parse(profile) : null;
      const profileId = parsedProfile?.id;

      if (!profileId || !content.trim()) {
        Toast.show({ type: "error", text1: "내용을 입력해주세요." });
        return;
      }

      mutate({
        diaryId: item.diaryId,
        payload: { profileId, content, images: imageUrls },
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
      initialImageUrls={item.media || []}
      onSubmit={handleSubmit}
      onBack={() => navigation.goBack()}
    />
  );
};

export default UpdateDiary;
