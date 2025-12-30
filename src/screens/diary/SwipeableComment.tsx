import React from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Animated as RNAnimated,
} from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import Title from "../../components/text/Title";

// icon
import { IconTrash } from "../../assets/icons";
import { User } from "../../assets/svg";
import { Easing } from "react-native-reanimated";

export interface CommentProps {
  onDelete: () => void;
  isReply: boolean;
  onClickReply?: (commentId: number, name: string) => void;
}

const baseUrl = process.env.IMAGE_BASE_URL;

function timeAgo(isoDate: string) {
  const now = new Date().getTime();
  const past = new Date(isoDate);
  
  past.setHours(past.getHours() + 9);
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

const SwipeableComment = (props: CommentProps) => {
  const { item, onDelete, isReply = false, onClickReply } = props;
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX); // 왼쪽으로만 스와이프
    })
    .onEnd(() => {
      if (translateX.value < -80) {
        translateX.value = withSpring(-100);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.cardContainer}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.itemContainer, animatedStyle]}>
          <View style={[styles.commentContainer, isReply && { marginLeft: 50 }]}>
            {item.imageUrl ? (
              <Image
                source={{ uri: `${baseUrl}/${item.imageUrl}` }}
                style={styles.profileImage}
            />
            ) : (
              <View style={styles.userImage}>
                <User />
              </View>
            )}
            <View style={styles.itemContent}>
              <View style={{ flexDirection: 'row' }}>
                <Title text={item.name} fontSize={14} fontWeight="bold" color="#000000" />
                <Title text={timeAgo(item.createdAt)} fontSize={12} color="#AEAEAE" style={{ marginLeft: 12 }} />
              </View>
              <Title text={item.content} fontSize={14} style={{ marginTop: 8 }} />
            </View>
            {!isReply && onClickReply && (
              <Pressable
                onPress={() => onClickReply(item.commentId, item.name)}
                style={{ marginLeft: 12, alignSelf: 'flex-end' }}
              >
                <Title text="답글 달기" fontSize={14} color="#AEAEAE" />
              </Pressable>
            )}
          </View>
        </Animated.View>
      </GestureDetector>

      <View style={styles.hidden_card}>
        <Pressable
          onPress={() => onDelete(isReply ? item.replyId : item.commentId)}
          style={styles.hiddenButton}
        >
          <IconTrash />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative', // 카드와 메뉴의 상대 위치 설정
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
    width: "100%",
    height: 70,
  },
  itemContainer: {
    zIndex: 2,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  commentContainer: {
    paddingVertical: 10,
    marginHorizontal: 10,
    flexDirection: "row",
  },
  userImage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    marginRight: 12,
  },
  profileImage: {
    alignSelf: "center",
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 50,
  },
  itemContent: {
    justifyContent: 'space-between',
    padding: 10,
    width: "50%",
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  hidden_card: {
    position: 'absolute',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    height: '100%',
  },
  hiddenButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 65,
    height: '100%',
    backgroundColor: '#FF4040',
  },
});

export default SwipeableComment;