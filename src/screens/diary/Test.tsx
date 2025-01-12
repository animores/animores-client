import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Title from "../../components/text/Title";
import BottomModal from "../../components/modal/BottomModal";
import AddComment from "./AddComment";

export interface CommentProps {
  visible: boolean;
  onClose: () => void;
  commentDiaryId: string;
  isComment: boolean;
  commentProfileId: number;
}

const items = [
  { id: 1, title: "Content 1" },
  { id: 2, title: "Content 2" },
  { id: 3, title: "Content 3" },
];

const Test = (props: CommentProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isVisibleComment, setIsVisibleComment] = useState<boolean>(false); //댓글 모달

  const gestures = items.reduce((acc, item) => {
    acc[item.id] = new Animated.Value(0);
    return acc;
  }, {});

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const CommentList = () => {
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
          animateSwipe(id, -80);
        } else {
          resetPosition(id);
        }
      }
    }

    const animateSwipe = (id, toValue) => {
      const others = items.filter((el, index) => { 
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

    const Separator = () => {
      return (
          <View style={{width: 24, height: 1, backgroundColor: '#fff', marginVertical: 15}}/>
      );
    }
    
    return (
      <View style={{flex: 1, justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", height: 500, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
              <View style={styles.footerTopLine} />

              <Title
                  text={"댓글"}
                  fontSize={16}
                  style={{ textAlign: "center", marginTop: 10, marginBottom: 10 }}
              />

              {items.map(item => (
                <View style={styles.cardContainer}>
                  <PanGestureHandler
                  key={item.id}
                  onGestureEvent={handleGestureEvent(item.id)}
                  onHandlerStateChange={handleGestureStateChange(item.id)}
                  >
                    <Animated.View
                      style={[
                      styles.itemContainer,
                      { transform: [{ translateX: gestures[item.id] }] }, // Apply the swipe effect
                      ]}
                    >
                      <View style={styles.itemContent}>
                        <Text style={styles.modalText}>{item.title}</Text>
                        {/* <AddComment 
                          //visible={isVisibleComment} 
                          //onClose={() => setIsVisibleComment(false)}
                          commentDiaryId={props.commentDiaryId}
                          isComment={props.isComment}
                          commentProfileId={props.commentProfileId}
                        /> */}
                      </View>
                    </Animated.View>
                  </PanGestureHandler>

                  <View style={styles.hidden_card}>
                    <Pressable onPress={() => console.log('11')}>
                      <Text style={styles.hiddenMenuText}>삭제</Text>
                    </Pressable>
                    <Separator />
                    <Pressable onPress={() => console.log('22')}>
                      <Text style={styles.hiddenMenuText}>수정</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
              <Text
                  onPress={closeModal}
                  style={styles.closeButton}
              >
                  Close Modal
              </Text>
          </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text onPress={openModal} style={styles.openButton}>
        Open Modal
      </Text>
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onBackdropPress={closeModal}
        isVisible={modalVisible}
        propagateSwipe={true}
        swipeDirection="down"
        backdropOpacity={0.6}
      >
        <CommentList />
      </Modal>

      {/* <BottomModal
        isVisible={modalVisible}
        onClose={closeModal}
        footer={CommentList}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f0f0f0",
  },
  bottomModalContainer: {
    marginTop: 15,
  },
  footerTopLine: {
    marginTop: 15,
    backgroundColor: '#838383',
    height: 1.5,
    width: 50,
    alignSelf: "center",
  },
  openButton: {
    fontSize: 20,
    color: 'blue',
    padding: 10,
  },
  itemContainer: {
    zIndex: 2,
  },
  itemContent: {
    width: 350,
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    fontSize: 16,
    color: 'red',
    marginTop: 10,
    width: "100%",
    textAlign: "center",
  },
  cardContainer: {
    width: "100%",
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // 카드와 메뉴의 상대 위치 설정
    marginVertical: 5,
  },
  hidden_card: {
    alignItems: 'flex-end',
    paddingRight: 20,
    justifyContent: 'center',
    position: 'absolute',
    width: 350,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#000',
    zIndex: 1,
  },
  hiddenMenuText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Test;