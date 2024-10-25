import React from 'react';
import {StyleSheet, Text, View} from "react-native";

interface AutoCompleteDropdownProps {
    searchText: string;
    suggestionList: Array<string>;
    onClick?: () => void;
    showCount?: number;
}

const AutoCompleteDropdown = ({searchText, suggestionList, onClick, showCount = 10}: AutoCompleteDropdownProps) => {
    const baseText = searchText.replaceAll(" ", "");

    if (searchText.length === 0) return;
    
    return suggestionList.filter(base => {
        // 초성, 음절 입력 구분
        if (CONSONANT.includes(baseText)) {
            return _getFirstConsonant(base) === baseText;
        } else {
            return base.replaceAll(" ", "").startsWith(baseText);
        }
    }).map((base, idx) => {
        if (idx < showCount) return (
            <View style={styles.wrapper}>
                <Text style={styles.item} key={base}>{base}</Text>
            </View>
        )
    })
};

// 한글 초성 19자
const CONSONANT = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

// 초성 계산 함수
function _getFirstConsonant(char: string) {
    // 한글 유니코드 시작 값
    const initialOffset = 0xAC00;
    // 음절 범위`
    const consonantCount = 588;

    const charCode = char.charCodeAt(0) - initialOffset;
    if (charCode < 0 || charCode > 11171) {
        return char; // 한글 범위를 벗어난 경우 그대로 반환
    }

    const consonantIndex = Math.floor(charCode / consonantCount);
    return CONSONANT[consonantIndex];
}

const styles = StyleSheet.create({
    wrapper: {

    },
    item : {
        paddingHorizontal : 20,
        paddingVertical : 10,
    }
})


export default AutoCompleteDropdown;

