import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import React, { useState } from "react";
import { Pressable, StyleSheet, View, Image, TextInput } from "react-native";
import Toast from "react-native-toast-message";
import { User } from "../../assets/svg";
import BottomModal from "../../components/modal/BottomModal";
import Title from "../../components/text/Title";
import { DiaryService } from "../../service/DiaryService";
import { QueryKey } from "../../statics/constants/Querykey";
import { Colors } from "../../styles/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useController, Controller, Control, useForm } from "react-hook-form";
import InputBox from "../../components/Input/InputBox";

export interface CommentProps {
  visible: boolean;
  onClose: () => void;
  commentDiaryId: string;
  isComment: boolean;
  commentProfileId: number;
}

const AddComment = (props: CommentProps) => {
  const baseUrl = "https://animores-image.s3.ap-northeast-2.amazonaws.com";
  
  const { visible, onClose, commentDiaryId, isComment, commentProfileId } = props;
  const [isInputText, setIsInputText] = useState<boolean>(false);

  const methods = useForm({
    defaultValues: {
      comment: '',
    },
  });

  const { control, addComment: formSubmit } = methods;
  const { field } = useController({
    control,
    name: 'comment',
    rules: { required: true },
  });

  //(댓글 클릭 시) 댓글 불러오기
  const { data: commentList } = useQuery({
    queryKey: [QueryKey.COMMENT_LIST, commentDiaryId],
    queryFn: () => DiaryService.diary.commentList(commentDiaryId, commentProfileId, 1, 15),
    option: {
      enabled: !!commentDiaryId,
    }
    
  });

  const comments = commentList?.data?.comments || [];

  // 댓글 등록
  const { mutate } = useMutation(
    ({profileId, diaryId, content}: {profileId: number, diaryId: number, content: string}) =>
      DiaryService.diary.addComment(1, diaryId, content),
    {
      onSuccess: async (data) => {
        if (data && data.status === 200) {
          Toast.show({
            type: 'success',
            text1: '댓글이 등록되었습니다.',
          });
        }
      },
      onError: (error) => {
        console.error('Comment error:', error);
      },
      //onSettled: () => { console.log('결과에 관계 없이 무언가 실행됨') }
    }
  )

  // 댓글 입력버튼 클릭 시
  const addComment = async(data) => {
    const profile = await AsyncStorage.getItem("userInfo");

    if (profile) {
      const parsedProfile = JSON.parse(profile);
      const profileId = parsedProfile.id
      const content = methods.getValues('comment');

      mutate({profileId: profileId, diaryId: commentDiaryId, content: content});
      //console.log('data:', profileId, commentDiaryId, content);
    } else {
      console.error("comment error!");
    }
  }

  // 댓글 입력 시
  const handleOnChangeComment = (inputText:string) => {
    if(inputText !== ''){
      setIsInputText(true);
    } else {
      setIsInputText(false);
    }
  }

  const onPressHandeler = (visible: boolean) => {
    if (commentVisibleHandeler) {
      commentVisibleHandeler(visible);
    }
  }

  const FooterComment = () => {
    return (
      <View style={styles.bottomModalContainer}>
        {/* <View style={styles.footerTopLine} />

        <Title
          text={"댓글"}
          fontSize={16}
          style={{ textAlign: "center", marginTop: 10 }}
        /> */}

        {isComment}
        {isComment ? (
          comments.map((item) => {
            return (
              <View style={styles.commentContainer}>
                {item.imageUrl !== null ? (
                  <Image
                      source={{ uri: `${baseUrl}/${item.imageUrl}` }}
                      style={styles.profileImage}
                  />
                ) : (
                  <User />
                )}
                <View style={styles.comment}>
                  <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                    <Title
                      text={"3분 전"}
                      fontSize={12}
                      color={Colors.AEAEAE}
                      style={{ marginLeft: 12 }}
                    />
                  </View>
                  <Title
                    text={item.content}
                    fontSize={14}
                    style={{ marginTop: 8 }}
                  />
                </View>
                <Title
                  text={"답글 달기"}
                  fontSize={14}
                  color={Colors.AEAEAE}
                  style={{ marginLeft: 12, alignSelf: "flex-end" }}
                />
              </View>
            )
          })
        ) : (          
          <View style={styles.commentContainer}>
            <Title
              text={"댓글이 없습니다."}
              fontSize={14}
              style={{ paddingVertical: 10 }}
            />
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 10 }}>
          <TextInput
            //multiline
            //numberOfLines={20}
            value={field.value}
            onChangeText={(value) => field.onChange(value) && handleOnChangeComment(value)}
            placeholder="내용을 작성해주세요"
            style={[styles.inputBox, { width: "77%", marginRight: "3%" }]}
          />
          <Pressable
            onPress={addComment}
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

  return (
    // <BottomModal
    //   isVisible={visible}
    //   onClose={onClose}
    //   footer={footerComment}
    // />
    <FooterComment />
  )
}
export default AddComment;

const styles = StyleSheet.create({
  bottomModalContainer: {
    marginTop: 15,
  },
  footerTopLine: {
    backgroundColor: Colors.Gray838383,
    height: 1.5,
    width: 50,
    alignSelf: "center",
  },
  commentContainer: {
    marginHorizontal: 20,
    flexDirection: "row",
    marginTop: 20,
  },
  comment: {
    backgroundColor: Colors.F4F4F4,
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
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
  profileImage: {
      alignSelf: "center",
      width: 50,
      height: 50,
      borderRadius: 50
  },
  inputBox: {
    //paddingVertical: 14,
    height: 45,
    paddingHorizontal: 20,
    backgroundColor: Colors.F4F4F4,
    borderRadius: 15,
    width: "100%",
  },
});