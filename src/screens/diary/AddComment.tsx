import {
  useMutation,
} from "@tanstack/react-query";
import React, { useState } from "react";
import { Pressable, StyleSheet, View, TextInput } from "react-native";
import Toast from "react-native-toast-message";
import { DeleteIcon } from "../../assets/svg";
import Title from "../../components/text/Title";
import { DiaryService } from "../../service/DiaryService";
import { QueryKey } from "../../statics/constants/Querykey";
import { Colors } from "../../styles/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useController, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

export interface CommentProps {
  diaryId?: number | null;
  diaryCommentId?: number | null;
  diaryCommentName: string;
  setSelectedCommentId: (id: number | null) => void;
}

const AddComment = (props: CommentProps) => {
  const queryClient = useQueryClient();
  const { diaryId, diaryCommentId, diaryCommentName, setSelectedCommentId } = props;
  const [isInputText, setIsInputText] = useState<boolean>(false);

  const methods = useForm({
    defaultValues: {
      comment: '',
    },
  });

  const { control, getValues, reset } = methods;
  const { field } = useController({
    control,
    name: 'comment',
    rules: { required: true },
  });

  // 댓글 등록
  const { mutate: addCommentMutate } = useMutation(
    ({profileId, diaryId, content}: {profileId: number, diaryId: number, content: string}) =>
      DiaryService.diary.addComment(profileId, diaryId, content),
    {
      onSuccess: async (data) => {
        if (data && data.status === 200) {
          Toast.show({
            type: 'success',
            text1: '댓글이 등록되었습니다.',
          });
          reset({ comment: '' });
          setIsInputText(false);

          // 댓글 목록 다시 불러오기
          queryClient.invalidateQueries({
            queryKey: [QueryKey.COMMENT_LIST, diaryId],
          });
        }
      },
      onError: (error) => {
        console.error('Comment error:', error);
      },
    }
  )
  // 대댓글 등록
  const { mutate: addReplyMutate } = useMutation(
    ({profileId, diaryCommentId, content}: {profileId: number, diaryCommentId: number, content: string}) =>
      DiaryService.diary.addReply(profileId, diaryCommentId, content),
    {
      onSuccess: async (data) => {
        if (data && data.status === 200) {
          Toast.show({
            type: 'success',
            text1: '대댓글이 등록되었습니다.',
          });
          reset({ comment: '' });
          setIsInputText(false);
          closeReply();

          // 대댓글 목록 다시 불러오기
          queryClient.invalidateQueries({
            queryKey: [QueryKey.REPLY_LIST, diaryCommentId],
          });
        }
      },
      onError: (error) => {
        console.error('Reply error:', error);
      },
    }
  )

  // 댓글 입력버튼 클릭 시
  const addComment = async() => {
    const profile = await AsyncStorage.getItem("userInfo");
    if (!profile) {
      console.error("userInfo not found");
      return;
    }
    
    const parsedProfile = JSON.parse(profile);
    const profileId = parsedProfile.id

    const content = getValues("comment").trim();
    if (!content) return;

    if (diaryCommentId) { // 대댓글일 경우
      console.log('reply...', profileId, diaryCommentId, content);
      addReplyMutate({
        profileId,
        diaryCommentId,
        content,
      });
      return;
    }

    if (!diaryId) {
      console.error("diaryId is missing");
      return;
    }

    console.log('comment...', profileId, diaryId, content);
    addCommentMutate({ // 댓글일 경우
      profileId,
      diaryId,
      content,
    });
  }

  // 댓글 입력 시
  const handleOnChangeComment = (inputText:string) => {
    setIsInputText(inputText.trim().length > 0);
  }

  const closeReply = () => {
    setSelectedCommentId(null);
  }

  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
      {/* 대댓글일 경우에만 보임 */}             
      {diaryCommentId && 
        <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#ccc", borderRadius: 15, padding: 8, marginBottom: 10 }}> 
          <Title text={`${diaryCommentName}님에게 답글 남기는 중`} />
          <Pressable onPress={() => closeReply()}>
            <DeleteIcon />
          </Pressable>
        </View>
      }

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          //multiline
          //numberOfLines={20}
          value={field.value}
          onChangeText={(value) => {
            field.onChange(value);
            handleOnChangeComment(value);
          }}
          placeholder={
            diaryCommentId ? '대댓글을 입력하세요' : '댓글을 입력하세요'
          }
          style={[styles.inputBox, { width: "77%", marginRight: "3%" }]}
        />
        <Pressable
          onPress={addComment} // 파라미터를 함수에 전달, comment일 경우 댓글작성 / reply일 경우 대댓글 작성
          style={[isInputText ? styles.submitButton : styles.submitButtonDisabled, { width: "20%" }]}
          disabled={!isInputText}
        >
          <Title 
            text="입력" 
            color={Colors.White} 
          />
        </Pressable>
      </View>
    </View>
  )
}
export default AddComment;

const styles = StyleSheet.create({
  submitButton: {
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: Colors.FB3F7E,
  },
  submitButtonDisabled: {
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: Colors.AEAEAE,
  },
  inputBox: {
    height: 45,
    paddingHorizontal: 20,
    backgroundColor: Colors.F4F4F4,
    borderRadius: 15,
    width: "100%",
  },
});