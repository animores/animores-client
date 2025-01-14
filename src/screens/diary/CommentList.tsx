import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient,} from "@tanstack/react-query";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {DiaryService} from "../../service/DiaryService";
import {QueryKey} from "../../statics/constants/Querykey";
import {Colors} from "../../styles/Colors";
import Title from "../../components/text/Title";
import AddComment from "./AddComment";
import {GestureTest} from "../myPage/petManagement/GestureTest";

// icon
import {User} from "../../assets/svg";
import {IconTrash} from "../../assets/icons";
import Toast from "react-native-toast-message";

export interface CommentProps {
  visible: boolean;
  setIsVisibleComment: () => void;
  commentDiaryId: string;
  isComment: boolean;
  commentProfileId: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CommentList = (props: CommentProps) => {
  const { visible, setIsVisibleComment, commentDiaryId, isComment, commentProfileId } = props;
  const baseUrl = "https://animores-image.s3.ap-northeast-2.amazonaws.com";
  const queryClient = useQueryClient();

  const [deletedDiaryId, setDeletedDiaryId] = useState<number | null>(null);  //삭제 diary Id

  //(댓글 클릭 시) 댓글 불러오기
  const { data: commentList, refetch } = useQuery({
    queryKey: [QueryKey.COMMENT_LIST, commentDiaryId],
    queryFn: () => DiaryService.diary.commentList(commentDiaryId, commentProfileId, 1, 15),
    option: {
      enabled: !!commentDiaryId,
    }
  });

  //댓글 삭제
  const { mutate } = useMutation(
    ({ commentId }: { commentId: number }) =>
      DiaryService.diary.commentDelete(commentId),
    {
      onSuccess: async (data) => {
        if (data && data.status === 200) {
          Toast.show({
            type: "success",
            text1: "삭제되었습니다.",
          });

          setIsVisibleComment(false);
          await queryClient.invalidateQueries([QueryKey.COMMENT_LIST]);
          //일지 목록 쿼리를 무효화함
        }
      },
      onError: (error) => {
        console.error("Delete error:", error);
      },
    }
  );

  const comments = commentList?.data?.comments || [];
  
  const gestures = comments.reduce((acc, item) => {
    acc[item.commentId] = new Animated.Value(0);
    return acc;
  }, {});

  const CommentListInner = () => {
    const [visibleItem, setVisibleItem] = useState(null);

    const resetAllGestures = (exceptId) => {
      Object.keys(gestures).forEach((key) => {
        if (parseInt(key) !== exceptId) {
          Animated.spring(gestures[key], {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      });
    };

    // 댓글 작성된 시간
    function timeAgo(isoDate) {
      const now = new Date();
      const past = new Date(isoDate);

      past.setHours(past.getHours() + 9);// 9시간 빼기
      const diff = now - past; // 밀리초 차이

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) return `${seconds}초 전`;
      if (minutes < 60) return `${minutes}분 전`;
      if (hours < 24) return `${hours}시간 전`;
      return `${days}일 전`;
    }

    // 댓글 삭제
    const handleDelete = async (commentId: number) => {
      if (commentId !== null) {
        mutate({ commentId: commentId });
      } else {
        console.log('diary deleted error')
      }
    };

    // 댓글 상단 라인
    const Separator = () => {
      return (
          <View style={{width: 24, height: 1, backgroundColor: '#fff', marginVertical: 15}}/>
      );
    }
    
    return (
      <View>
        <View 
          style={{ backgroundColor: "#fff", height: 530, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30, }}
        >
          <View style={styles.footerTopLine} />

          <Title
              text={"댓글"}
              fontSize={16}
              style={{ textAlign: "center", marginTop: 10, marginBottom: 10 }}
          />

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <GestureHandlerRootView>
            {isComment ? (
                comments.map((item) => (
                  <View style={styles.cardContainer}>
                  <GestureTest
                      key={item.commentId}
                  >
                      <View style={styles.commentContainer}>
                        {item.imageUrl !== null ? (
                            <Image
                                source={{uri: `${baseUrl}/${item.imageUrl}`}}
                                style={styles.profileImage}
                            />
                        ) : (
                            <User/>
                        )}
                        <View style={styles.itemContent}>
                          <View style={{flexDirection: "row"}}>
                            <Title
                                text={item.name}
                                fontSize={14}
                                fontWeight="bold"
                                color="#000000"
                              />
                              <Title
                                text={timeAgo(item.createdAt)}
                                fontSize={12}
                                color={Colors.AEAEAE}
                                style={{marginLeft: 12}}
                            />
                          </View>
                          <Title
                              text={item.content}
                              fontSize={14}
                              style={{marginTop: 8}}
                          />
                        </View>
                        <Pressable
                            onPress={() => console.log('11')}
                            style={{marginLeft: 12, alignSelf: "flex-end"}}
                        >
                          <Title
                              text={"답글 달기"}
                              fontSize={14}
                              color={Colors.AEAEAE}
                          />
                        </Pressable>
                      </View>
                    {/*</Animated.View>*/}
                  </GestureTest>

                  <View style={styles.hidden_card}>
                    {/* <Pressable onPress={() => console.log('11')}>
                      <Text style={styles.hiddenMenuText}>수정</Text>
                    </Pressable>
                    <Separator /> */}
                    <Pressable onPress={() => handleDelete(item.commentId)} style={styles.hiddenButton}>
                      <IconTrash />
                    </Pressable>
                  </View>
                </View>
                ))
            ) : null}
            </GestureHandlerRootView>
          </ScrollView>

          {/* 댓글 입력창 */}
          <AddComment commentDiaryId={commentDiaryId} refetch={refetch} />
        </View>
      </View>
    )
  }

  return (
    <View>
      <Modal        
        transparent={true}
        visible={visible}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity onPress={() => setIsVisibleComment(false)} style={{ flex: 1 }} />
          <CommentListInner />
        </View>
        <Toast />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    justifyContent: 'flex-end',
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    alignItems: 'center',
    padding: 20,
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  profileImage: {
    alignSelf: "center",
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 50,
  },
  cardContainer: {
    position: 'relative', // 카드와 메뉴의 상대 위치 설정
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
    width: "100%",
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
  hiddenMenuText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CommentList;