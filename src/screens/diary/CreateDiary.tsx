import React from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../../navigation/type";
import { ScreenName } from "../../statics/constants/ScreenName";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DiaryService } from "../../service/DiaryService";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DiaryFormEditor from "../../components/diary/DiaryFormEditor";
import { QueryKey } from "../../statics/constants/Querykey";

const CreatDiary = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, ScreenName.CreateDiary>>();
  const queryClient = useQueryClient();

  // 일지 등록
  const { mutate } = useMutation({
    mutationFn: async (formData: FormData) => {
       const {data} = await DiaryService.diary.create(formData);
       return data;
    }
  });

  const handleSubmit = async (content: string, imageUrls: string[]) => {
    try {
      const profile = await AsyncStorage.getItem("userInfo");

      if (!profile) {
        console.error("Profile not found");
        return;
      }

      const parsedProfile = JSON.parse(profile);
      const profileId = parsedProfile?.id;

      if (!content) {
        console.error("Content is empty");
        return;
      }

      const formData = new FormData();

      // request 필드에 JSON 문자열로 추가
      const requestData = {
        profileId,
        content
      };
      formData.append("request", JSON.stringify(requestData));

      // 이미지 파일 추가
      imageUrls.forEach((imageUrl, index) => {
        const fileExtension = imageUrl.split('.').pop()?.toLowerCase();
        let mimeType = 'image/jpeg';

        if (fileExtension === 'png') {
          mimeType = 'image/png';
        } else if (fileExtension === 'gif') {
          mimeType = 'image/gif';
        } else if (fileExtension === 'webp') {
          mimeType = 'image/webp';
        }

        formData.append('files', {
          uri: imageUrl,
          type: mimeType,
          name: `image_${index}.${fileExtension || 'jpg'}`
        } as any);
      });

      console.log("profileId:", profileId, "content:", content, "images:", imageUrls.length);

      mutate(formData, {
        onSuccess: async (response) => {
          console.log('서버응답', response);
          if (response?.success){
            Toast.show({
              type: 'success',
              text1: '일지가 등록되었습니다.',
            });
            // 일지 목록 쿼리 무효화하여 갱신
            await queryClient.invalidateQueries([QueryKey.DIARY_LIST]);
            navigation.goBack();
          } else {
            console.warn("일지 등록 실패");
          }
        },
        onError: (error: any) => {
          console.error('Create error:', error?.response?.data || error?.message || error);
        }
      });
    } catch (error) {
      console.error("handleSubmit error:", error);
    }
  }

  return (
    <DiaryFormEditor
      headerTitle="일지 작성하기"
      submitButtonText="완료"
      onSubmit={handleSubmit}
      onBack={() => navigation.goBack()}
    />
  );
};

export default CreatDiary;
