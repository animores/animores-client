import React from "react";
import {StyleSheet} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Animated, {useSharedValue, withSpring} from "react-native-reanimated"

const MAX_POSITION = -180;

export function GestureTest({children}: { children: React.ReactNode }) {
    const position = useSharedValue(0);
    const lastPosition = useSharedValue(0);

    const pan = Gesture.Pan()
        .onUpdate((e) => {
            const movX = lastPosition.value + e.translationX;
            if (movX > -100 && movX < 80) {
                position.value = movX;
            }
        })
        .onEnd((e) => {
            if (Math.abs(e.translationX) < 100) {
                position.value = withSpring(0);
                lastPosition.value = 0;
            } else if (e.translationX > 0) {
                position.value = withSpring(0);
                lastPosition.value = 0;
            } else {
                position.value = withSpring(MAX_POSITION);
                lastPosition.value = MAX_POSITION;
            }
        });

    const tap = Gesture.Tap().onStart((e) => {
        if (position.value <= MAX_POSITION + 5) {
            position.value = withSpring(0);
            lastPosition.value = 0;
        }
    })

    return <GestureDetector gesture={tap}>
        <GestureDetector gesture={pan}>
            <Animated.View style={[styles.itemContainer, {translateX: position}]}>
                {children}
            </Animated.View>
        </GestureDetector>
    </GestureDetector>
}

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
    box: {
        display: "flex",
        alignItems: "center"
    },
    itemContainer: {
        zIndex: 2,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
    },
    text: {
        backgroundColor: "red",
        width: "50%"
    }
})