import { IMAGE_BASE_URL } from "@env";
import React, { useState, useEffect } from "react";
import { Image, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useRecoilValue } from "recoil";
import { IToDoList } from "../../../types/ToDo";
import { ClockIcon } from "../../assets/svg";
import SwipeableCard from "../../components/SwipeableCard";
import { minuteTickSelector } from "../../recoil/MinuteTickAtom";
import { ToDoService } from "../../service/ToDoService";
import { Colors } from "../../styles/Colors";
import BasicCheckbox from "../../components/BasicCheckbox";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/types"; 
import { ScreenName } from "../../statics/constants/ScreenName";
import { IAddTodo } from "../../../types/AddTodo";

interface ToDoCardProps {
  todo: IToDoList;
  onDelete: () => void;
  isChecked: boolean;
  onCheckChange: (id: string, isChecked: boolean) => void;
  onClickUpdateTodo: () => void;
  style?: StyleProp<ViewStyle>;
}

const HIDDEN_MENU_WIDTH = 70;
const TIMING_DURATION = 500;

// TODO 색상 처리 utils로 나중에 옮겨야 함
// RGB to HSL 변환 함수
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
};

// TODO 색상 처리 utils로 나중에 옮겨야 함
// HSL to RGB 변환 함수
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};


// 색상을 더 진하게 만드는 함수
const getDarkerColor = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const [h, s, l] = rgbToHsl(r, g, b);
    // 명도(l)를 40% 감소시키되, 최소 20%는 유지
    const newL = Math.max(20, l - 40);
    const [newR, newG, newB] = hslToRgb(h, s, newL);

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};


const formatTime = (time: string) => {
    const timeArr = time.split(':');
    const hour = timeArr[0];
    if (parseInt(hour) > 12) {
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
    if (curHour > hour) {
        return true;
    } else if (curHour === hour) {
        if (curMin > min) {
            return true;
        }
    }
    return false;
}

// PetBadge 컴포넌트
const PetBadge = ({ pet }: { pet: { id: number; name: string } }) => {
    const PET_COLORS = ["#f9f4c5", "#edebff", "#e1f0ff", "#e0f5e0", "#f7f3d7", "#e6e1ff", "#d9ecff", "#d8f0d8", "#f5f0c8", "#e3e0ff", "#cfe8ff", "#cfeacf"];

    const backgroundColor = PET_COLORS[pet.id % PET_COLORS.length] || '#E8F4FD';
    const textColor = getDarkerColor(backgroundColor);

    return (
        <View style={[styles.petBadge, { backgroundColor }]}>
            <Text style={[styles.petBadgeText, { color: textColor }]}>{pet.name}</Text>
        </View>
    );
};

const ToDoCard = ({ todo, onDelete, isChecked, onCheckChange, onClickUpdateTodo, style }: ToDoCardProps) => {
  // 현재 시간 획득 및 매 분(00초) 마다 리렌더링
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const curTime = useRecoilValue(minuteTickSelector);
  const todoTime = todo.time || "18:00";
  const isPastDue = isPast(curTime, todoTime);
  //const todoUnit = todo.unit || "월, 수, 금";

  const todoUnit = (unit: string) => {
      switch (unit) {
          case 'HOUR': return '매시간'; // 매시간은 없애기로
          case 'WEEK': return '매주';
          case 'DAY': return '매일';
          case 'MONTH': return '매달';
          default: return '';
      }
  }

  const onUpdate = async (item: IAddTodo) => {
    //console.log("item :", item);
    navigation.navigate(ScreenName.UpdateTodo, { item });
  };

  const hiddenContent = (
    <View style={styles.hiddenContent}>
      <Pressable onPress={() => onDelete()}>
        <Text style={styles.hiddenMenuText}>삭제</Text>
      </Pressable>
      <View style={{ width: 24, height: 1, backgroundColor: Colors.White, marginVertical: 15 }} />
      <Pressable onPress={() => onUpdate(todo)}>
        <Text style={styles.hiddenMenuText}>수정</Text>
      </Pressable>
    </View>
  );

  return (
    <SwipeableCard
      containerStyle={[styles.container, style]}
      cardStyle={styles.card}
      hiddenCardStyle={styles.hidden_card}
      hiddenMenuWidth={HIDDEN_MENU_WIDTH}
      timingDuration={TIMING_DURATION}
      hiddenContent={hiddenContent}
    >
      <View style={[styles.cardContent, { opacity: isChecked ? "0.5" : "1" }]}>
        <View style={[styles.leftSide, { borderLeftColor: todo.color }]}>
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              {todo.content ? todo.content : todo.tag}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row' }}>
              {todo.pets.map((pet, index) => (
                <PetBadge key={`pet-${pet.id}-${index}`} pet={pet} />
              ))}
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: 'center', marginTop: 5 }}>
            <ClockIcon width={24} height={24} color={isPast(curTime, todoTime) ? Colors.FF9999 : Colors.Black} />
            {/* TODO 폰트 font-family: Pretendard-Bold */}
            <Text style={{ fontSize: 16, textDecorationLine: isPastDue ? "line-through" : "none", color: isPastDue ? Colors.FF9999 : Colors.Black, fontWeight: "600", marginLeft: 8, lineHeight: 36 }}>{formatTime(todoTime)}</Text>
            <Text style={{ fontSize: 14, color: Colors.Gray838383, marginLeft: 8, lineHeight: 36 }}>{todoUnit(todo.unit)}</Text>
          </View>
        </View>
        <View style={styles.rightSide}>
          <View style={{ }}>
            <BasicCheckbox
              id={String(todo.id)}
              label=''
              isChecked={isChecked}
              onValueChangeHandler={onCheckChange}
            />
          </View>
          {todo.completeProfileImage ?
            <View style={styles.profile}>
              <Image source={require("../../assets/images/2a820159-1f51-473a-a11c-764539054ca0.jpg")} style={{ position: 'absolute', height: 30, width: 30, zIndex: 3 }} />
              <Image source={{ uri: `${IMAGE_BASE_URL}/${todo.completeProfileImage}` }} style={{ height: 30, width: 30 }} />
            </View>
            :
            <Pressable onPress={() => ToDoService.todo.check(String(todo.id))} style={{ ...styles.profile, ...styles.check_box }} />
          }
        </View>
      </View>
    </SwipeableCard>
  );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      overflow: 'hidden',
      paddingRight: 20,
      width: '100%',
      minHeight: 80,
      borderRadius: 10,
      backgroundColor: Colors.White,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
    },
    leftSide: {
      paddingLeft: 20,
      paddingVertical: 16,
      borderLeftStyle: 'solid',
      borderLeftWidth: 4,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'start',
        justifyContent: 'space-between',
        width: '100%',
    },
    hiddenContent: {
        alignItems: 'flex-end',
        paddingRight: 20,
        justifyContent: 'center',
        minHeight: 80,
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
    petBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    petBadgeText: {
        // fontFamily: 'Pretendard-Regular',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 18,
    },

    rightSide: {
      paddingLeft: 20,
      paddingVertical: 16, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '100%',
    },
    profile: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    check_box: {
        backgroundColor: Colors.White,
        borderWidth: 1,
        borderColor: Colors.Gray838383
    },
    hidden_card: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: '100%',
        minHeight: 80,
        paddingVertical: 16,
        borderRadius: 10,
        backgroundColor: Colors.Black,
    },
    hiddenMenuText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ToDoCard;