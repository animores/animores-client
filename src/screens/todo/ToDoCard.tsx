import { View, Text, Pressable, Image, StyleSheet, Dimensions  } from "react-native";
import { IToDo } from "../../../types/ToDo";
import React from "react";
import { Colors } from "../../styles/Colors";
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withTiming  
  } from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ToDoService } from "../../service/ToDoService";
import { useNavigation } from "@react-navigation/native";
import { ScreenName } from "../../statics/constants/ScreenName";

const { width } = Dimensions.get('window');
const HIDDEN_MENU_WIDTH = 70;
const TIMING_DURATION = 500;

const completeStampImage = require(`../../assets/images/2a820159-1f51-473a-a11c-764539054ca0.jpg`);

interface IToDoCardProps {
    todo: IToDo;
    curTime: Date;
    onDelete: () => void;
    index: number;
    setScrolledToDoIndex: (index: number) => void;
}
const ToDoCard = ({ todo, curTime, onDelete, index, setScrolledToDoIndex }: IToDoCardProps) => {
    //TODO: pet_colors를 어떻게 처리할지 고민해보기
    // Shorten the pet_colors array
    const pet_colors = ["#FFD700", "#FF69B4", "#00FF00", "#1E90FF", "#FF4500", "#FF6347", "#8A2BE2", "#FF1493", "#FF8C00", "#FF00FF", "#00FFFF", "#00FF7F", "#FF0000", "#0000FF"];
    const formatTime = (time: string) => {
        const timeArr = time.split(':');
        const hour = timeArr[0];
        if(parseInt(hour) > 12) {
            return `오후 ${parseInt(hour) - 12}:${timeArr[1]}`;
        } else {
            return `오전 ${hour}:${timeArr[1]}`;
        }
    }

    const isPast = (currentTime: Date, time: string) => {
        const curHour = currentTime.getHours();
        const curMin = currentTime.getMinutes();
        const timeArr = time.split(':');
        const hour = parseInt(timeArr[0]);
        const min = parseInt(timeArr[1]);
        if(curHour > hour) {
            return true;
        } else if(curHour === hour) {
            if(curMin > min) {
                return true;
            }
        }
        return false;
    }

    const checkToDo = (id: number) => {
        ToDoService.todo.check(id);
    }

  // xOffset은 카드의 X 좌표 위치
    const xOffset = useSharedValue(0);

    // 슬라이드 제스처 핸들러
    const pan = Gesture.Pan()
        .onUpdate(e => {
            xOffset.value =Math.max(-HIDDEN_MENU_WIDTH, Math.min(0, e.translationX)); 
        })
        .onEnd(() => {
            if (xOffset.value < -HIDDEN_MENU_WIDTH / 2) {
                xOffset.value = withTiming(-HIDDEN_MENU_WIDTH, { duration: TIMING_DURATION });
                setScrolledToDoIndex(index);
                console.log(index)
            } else {
                xOffset.value = withTiming(0, { duration: TIMING_DURATION })  // 원래 상태로 복귀
            }}
        );

    // 애니메이션 스타일
    const animatedStyle = useAnimatedStyle(() => {
        return {
        transform: [{ translateX: xOffset.value }],
        };
    });


    const Separator = () => {
        return (
            <View style={{width: 24, height: 1, backgroundColor: Colors.White, marginVertical: 15}}/>
        );
    }

    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.card, animatedStyle]}>
                    <View>
                        <View style={{flexDirection: "row"}}>
                            <FontAwesome name="clock-o" size={24} color="black" />
                            <Text style={{fontSize: 25, color: isPast(curTime, todo.time) ? "red" : "black", marginHorizontal: 10}}>{formatTime(todo.time)}</Text>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <View style={{flexDirection:'row', marginVertical: 10}}>
                                {todo.pets.map((pet) => {
                                    return <View style={{...styles.pet_cell, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',backgroundColor: pet_colors.at(pet.id % pet_colors.length)}}>
                                                <Text>{pet.name}</Text>
                                            </View>
                                })}
                            </View>
                            <View style={{height: 20, marginVertical: 10}}>
                                <Text style={{fontSize: 15}}>{todo.title}</Text>
                            </View>
                        </View>
                    </View>
                    <View>
                        {todo.completeProfileImage ? 
                        <View style={styles.profile}>
                            <Image source={completeStampImage} style={{position:'absolute' ,height: 30, width: 30, zIndex: 3}}/>
                            <Image source={{uri:  `${process.env.IMAGE_BASE_URL}/${todo.completeProfileImage}`}} style={{height: 30, width: 30}}/>
                        </View>
                        :
                        <Pressable onPress={() => checkToDo(todo.id)} style={{...styles.profile, ...styles.check_box}}/>
                        }
                    </View>
                </Animated.View>
            </GestureDetector>
            <View style={styles.hidden_card}>
                <Pressable onPress = {() => 
                    onDelete()
                }>
                    <Text style={styles.hiddenMenuText}>삭제</Text>
                </Pressable>
                <Separator/>  
                <Pressable onPress={() => navigation.navigate(ScreenName.AddTodo, { todo: todo.id })}>
                    <Text style={styles.hiddenMenuText}>수정</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative', // 카드와 메뉴의 상대 위치 설정
        marginVertical: 5,
      },
      card: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
        
        width: 350,
        height: 120,
        borderRadius: 10,
        backgroundColor: Colors.White,
        paddingHorizontal: 20,

        
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,

      },
    color_circle: {
        width: 20, height: 20, borderRadius: 10,
    },
    pet_cell: {
        width: 45, 
        height: 20, 
        borderRadius: 10, 
        marginRight: 10, 
    },
    profile: {
        width: 30, 
        height: 30, 
        borderRadius: 15,
        position: 'relative',
    },
    check_box: {
        backgroundColor: Colors.White,
        borderWidth: 1,
        borderColor: Colors.Gray838383
    },
    hidden_card: {
        alignItems: 'flex-end',
        paddingRight: 20,
        justifyContent: 'center',
        position: 'absolute',
        width: 350,
        height: 120,
        borderRadius: 10,
        backgroundColor: Colors.Black,
        zIndex: 1,
      },
      hiddenMenuText: {
        color: 'white',
        fontWeight: 'bold',
      },
});

export default ToDoCard;