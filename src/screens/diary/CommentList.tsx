import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from "react-native-toast-message";
import { useRecoilValue } from "recoil";
import Title from "../../components/text/Title";
import { DiaryModel } from "../../model/DiaryModel";
import { CurrentProfileAtom } from "../../recoil/AuthAtom";
import { DiaryService } from "../../service/DiaryService";
import { QueryKey } from "../../statics/constants/Querykey";
import { Colors } from "../../styles/Colors";
import AddComment from "./AddComment";
import SwipeableComment from "./SwipeableComment";
import dayjs from 'dayjs';

// icon
import { IconTrash } from "../../assets/icons";
import { User } from "../../assets/svg";
import { Easing } from "react-native-reanimated";

export interface CommentProps {
  visible: boolean;
  setIsVisibleComment: (isVisibleComment: boolean) => void;
  diaryId: number;
  isComment: boolean;
  profileId: number;
  setSelectedCommentId: () => void;
}

export interface CommentBarProps {
  item: DiaryModel.IDiaryCommentModel;
  profileId: number;
  diaryId: number;
  setIsVisibleComment: (v: boolean) => void;
  setSelectedCommentId: (id: number) => void;
  setSelectedCommentName: (name: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HIDDEN_MENU_WIDTH = 65;
const TIMING_DURATION = 500;
const baseUrl = process.env.IMAGE_BASE_URL;

const CommentList = ({ visible, setIsVisibleComment, diaryId, isComment, profileId }: CommentProps) => {
  // 선택된 댓글이 있으면 대댓글 모드, 없으면 댓글 모드
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [selectedCommentName, setSelectedCommentName] = useState<string | null>(null);

  //(댓글 클릭 시) 댓글 불러오기
  const { data: commentList, refetch } = useQuery({
    queryKey: [QueryKey.COMMENT_LIST, diaryId],
    queryFn: () => DiaryService.diary.commentList(diaryId, profileId, 1, 15),
    enabled: !!diaryId,
  });

  const comments: DiaryModel.IDiaryCommentModel[] = commentList?.data?.comments ?? [];

  useEffect(() => {
    if (!visible) {
      setSelectedCommentId(null);
      setSelectedCommentName(null);
    }
  }, [visible])

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity onPress={() => setIsVisibleComment(false)} style={{ flex: 1 }} />
            <View style={styles.modalContainer}>
              <View style={styles.footerTopLine} />

              <Title
                text={"댓글"}
                fontSize={16}
                style={{ textAlign: "center", marginTop: 10, marginBottom: 10 }}
              />

              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {isComment &&
                  comments.map((item) => (
                    <CommentBar
                      key={item.commentId}
                      item={item}
                      diaryId={diaryId}
                      profileId={profileId}
                      setIsVisibleComment={setIsVisibleComment}
                      setSelectedCommentId={setSelectedCommentId}
                      setSelectedCommentName={setSelectedCommentName}
                    />
                  )
                )}
              </ScrollView>

              {/* 댓글/대댓글 입력창
                댓글달기, 대댓글달기(답글달기) 함수 호출 시
                AddComment 컴포넌트에 해당 파라미터 전달
                - 댓글일 경우 파라미터에 게시글 작성자 id를 전달
                - 대댓글일 경우 파라미터에 댓글 작성자 id를 전달
              */}
              {selectedCommentId !== null ? (
                <AddComment
                  diaryCommentId={selectedCommentId}
                  diaryCommentName={selectedCommentName ?? ""}
                  setSelectedCommentId={setSelectedCommentId}
                /> // * 대댓글일 경우
              ) : (
                <AddComment
                  diaryId={diaryId}
                  diaryCommentName={selectedCommentName}
                  setSelectedCommentId={setSelectedCommentId}
                /> // * 댓글일 경우
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    justifyContent: 'flex-end',
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    height: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 20,
    fontSize: 18,
  },
  closeButton: {
    color: '#007BFF',
    fontSize: 16,
  },
  footerTopLine: {
    alignSelf: "center",
    marginTop: 15,
    height: 1.5,
    width: 50,
    backgroundColor: '#838383',
  },
  openButton: {
    fontSize: 20,
    color: 'blue',
    padding: 10,
  },
  itemContainer: {
    zIndex: 2,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  itemContent: {
    justifyContent: 'space-between',
    padding: 10,
    width: "50%",
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  commentContainer: {
    paddingVertical: 10,
    marginHorizontal: 10,
    flexDirection: "row",
  },
  cardContainer: {
    position: 'relative', // 카드와 메뉴의 상대 위치 설정
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
    width: "100%",
    //minHeight: 70,
    height: 70,
  },
  hidden_card: {
    position: 'absolute',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    height: '100%',
    //backgroundColor: '#000',
  },
  hiddenButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 65,
    height: '100%',
    backgroundColor: '#FF4040',
  },
});

// 댓글 상단 라인
const Separator = () => {
  return (
    <View style={{ width: 24, height: 1, backgroundColor: '#fff', marginVertical: 15 }} />
  );
}

function timeAgo(isoDate: string) {
  const now = new Date().getTime();
  const past = new Date(isoDate);
  
  dayjs(isoDate).fromNow();
  const diff = now - past.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}초 전`;
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
}


/** Comment Bar */
const CommentBar = (props: CommentBarProps) => {
  const { item, setIsVisibleComment, setSelectedCommentId, setSelectedCommentName, profileId, diaryId } = props;
  const queryClient = useQueryClient();
  const currentProfile = useRecoilValue(CurrentProfileAtom);

  //댓글 삭제
  const { mutate: deleteCommentMutate } = useMutation(
    ({ commentId, profileId }: { commentId: number, profileId: number }) =>
      DiaryService.diary.commentDelete(commentId, profileId),
    {
      onSuccess: async (data) => {
        if (data && data.status === 200) {
          Toast.show({
            type: "success",
            text1: "댓글이 삭제되었습니다.",
          });

          // 댓글 목록 다시 불러오기
          queryClient.invalidateQueries({
            queryKey: [QueryKey.COMMENT_LIST, diaryId],
          });
          // 대댓글 목록 다시 불러오기
          queryClient.invalidateQueries({
            queryKey: [QueryKey.REPLY_LIST, item.commentId],
          });
        }
      },
      onError: (error) => {
        console.error("Delete Comment error:", error);
      },
    }
  );

  // 댓글 삭제
  const handleDelete = async (commentId: number, profileId: number) => {
    console.log(commentId, profileId);
    if (commentId !== null && profileId !== null) {
      deleteCommentMutate({ commentId: commentId, profileId: profileId });
    } else {
      console.log('Comment deleted error')
    }
  };

  //(댓글 클릭 시) 대댓글 불러오기
  const { data: replyList } = useQuery({
    queryKey: [QueryKey.REPLY_LIST, item.commentId],
    queryFn: () => DiaryService.diary.replyList(item.commentId, profileId, 1, 15),
  });

  const replies: DiaryModel.IDiaryReplyModel[] = replyList?.data || [];

  // 답글쓰기 클릭 시
  const onClickReply = (diaryCommentId: Number, diaryCommentName: string) => {
    // 대댓글 모드
    console.log('{diaryCommentId}:', diaryCommentId);
    setSelectedCommentId(diaryCommentId);
    setSelectedCommentName(diaryCommentName);
  }

  //대댓글 삭제
  const { mutate: deleteReplyMutate } = useMutation(
    ({ replyId }: { replyId: number }) =>
      DiaryService.diary.replyDelete(replyId),
    {
      onSuccess: async (data) => {
        if (data && data.status === 200) {
          Toast.show({
            type: "success",
            text1: "대댓글이 삭제되었습니다.",
          });

          // 댓글 목록 다시 불러오기
          queryClient.invalidateQueries({
            queryKey: [QueryKey.COMMENT_LIST, diaryId],
          });
          // 대댓글 목록 다시 불러오기
          queryClient.invalidateQueries({
            queryKey: [QueryKey.REPLY_LIST, item.commentId],
          });
        }
      },
      onError: (error) => {
        console.error("Delete reply error:", error);
      },
    }
  );

  // 대댓글 삭제
  const handleDeleteReply = async (replyId: number) => {
    console.log('profileId', profileId);
    if (replyId !== null) {
      deleteReplyMutate({ replyId: replyId });
    } else {
      console.log('reply deleted error')
    }
  };

  return (
    <View>
      <View style={styles.cardContainer}>
        <SwipeableComment
          item={item}
          onDelete={(id) => handleDelete(id, currentProfile?.id ?? -1)}
          isReply={false}
          onClickReply={onClickReply}
        />
      </View>

      <View>
        {replies.totalCount > 0 ?
          replies.replies.map((reply, index) => (
            <SwipeableComment
              key={reply.replyId}
              item={reply}
              onDelete={() => handleDeleteReply(reply.replyId)}
              isReply={true}
            />
          )
        ) : null}
      </View>
    </View>
  )
};

export default CommentList;