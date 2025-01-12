import React, { useState } from 'react';
import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Image, 
  TextInput,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Toast from "react-native-toast-message";
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { DiaryService } from "../../service/DiaryService";
import { QueryKey } from "../../statics/constants/Querykey";
import { Colors } from "../../styles/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useController, Controller, Control, useForm } from "react-hook-form";
import InputBox from "../../components/Input/InputBox";
import Title from "../../components/text/Title";
import BottomModal from "../../components/modal/BottomModal";
import AddComment from "./AddComment";

// icon
import { User } from "../../assets/svg";
import { IconTrash } from "../../assets/icons";

export interface CommentProps {
  visible: boolean;
  onClose: () => void;
  commentDiaryId: string;
  isComment: boolean;
  commentProfileId: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CommentList = (props: CommentProps) => {
  const { visible, onClose, commentDiaryId, isComment, commentProfileId } = props;
  const baseUrl = "https://animores-image.s3.ap-northeast-2.amazonaws.com";

  //(댓글 클릭 시) 댓글 불러오기
  const { data: commentList, refetch } = useQuery({
    queryKey: [QueryKey.COMMENT_LIST, commentDiaryId],
    queryFn: () => DiaryService.diary.commentList(commentDiaryId, commentProfileId, 1, 15),
    option: {
      enabled: !!commentDiaryId,
    }
  });

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

    const handleGestureEvent = (id) => Animated.event(
      [{ nativeEvent: { translationX: gestures[id] } }],
      { useNativeDriver: true }
    );

    const handleGestureStateChange = (id) => (event) => {
      if (event.nativeEvent.state === State.END) {
        const { translationX } = event.nativeEvent;

        if (Math.abs(translationX) > 20) {
          // One of the content has been swiped - reset others
          resetAllGestures(id);
        }

        if (translationX > 50) {
          // Swipe Right - Move modal content right
          animateSwipe(id, 0);
        } else if (translationX < -50) {
          // Swipe Left - Move modal content left
          animateSwipe(id, -65);
        } else {
          resetPosition(id);
        }
      }
    }

    const animateSwipe = (id, toValue) => {
      const others = comments.filter((el, index) => { 
          el.id !== visibleItem
      });
      console.log(others.map((el) => el.id));
      Animated.spring(gestures[id], {
        toValue,
        useNativeDriver: true,
      }).start(() => {
        // Reset the swipe animation after the effect
        //resetPosition(id);
      });
    };

    const resetPosition = (id) => {
      Animated.spring(gestures[id], {
        toValue: 0,
        useNativeDriver: true,
      }).start();
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
            {isComment ? (
              comments.map(item => (
                <View style={styles.cardContainer}>
                  <PanGestureHandler
                  key={item.commentId}
                  onGestureEvent={handleGestureEvent(item.commentId)}
                  onHandlerStateChange={handleGestureStateChange(item.commentId)}
                  >
                    <Animated.View
                      style={[
                      styles.itemContainer,
                      { transform: [{ translateX: gestures[item.commentId] }] }, // Apply the swipe effect
                      ]}
                    >
                      <View style={styles.commentContainer}>
                          {item.imageUrl !== null ? (
                            <Image
                                source={{ uri: `${baseUrl}/${item.imageUrl}` }}
                                style={styles.profileImage}
                            />
                          ) : (
                            <User />
                          )}
                          <View style={styles.itemContent}>
                            <View style={{ flexDirection: "row" }}>
                              <Title
                                text={item.name}
                                fontSize={14}
                                fontWeight="bold"
                                color="#000000"
                              />
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
                          <Pressable 
                            onPress={() => console.log('11')}
                            style={{ marginLeft: 12, alignSelf: "flex-end" }}
                          >
                            <Title
                              text={"답글 달기"}
                              fontSize={14}
                              color={Colors.AEAEAE}
                            />
                          </Pressable>
                      </View>
                    </Animated.View>
                  </PanGestureHandler>

                  <View style={styles.hidden_card}>
                    {/* <Pressable onPress={() => console.log('11')}>
                      <Text style={styles.hiddenMenuText}>수정</Text>
                    </Pressable>
                    <Separator /> */}
                    <Pressable onPress={() => console.log('22')} style={styles.hiddenButton}>
                      <IconTrash />
                    </Pressable>
                  </View>
                </View>
              ))
            ) : null}
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
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay} onPress={onClose}>
          <TouchableOpacity onPress={onClose} style={{ flex: 1 }} />
          <CommentListInner />
        </View>
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