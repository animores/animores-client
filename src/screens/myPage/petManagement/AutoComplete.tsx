import React from 'react';
import {ScrollView, StyleSheet, Text, View} from "react-native";

interface AutoCompleteDropdownProps {
    searchText: string;
    suggestionList: Array<string>;
    onPress?: (param: string) => void;
}

const AutoComplete = ({searchText, suggestionList, onPress}: AutoCompleteDropdownProps) => {
    const baseText = searchText.replaceAll(" ", "");

    if (searchText.length === 0) return;

    return <ScrollView>
        {suggestionList.filter(base => {
            // 초성, 음절 입력 구분
            if (CONSONANT.includes(baseText)) {
                return _getFirstConsonant(base) === baseText;
            } else {
                return base.replaceAll(" ", "").startsWith(baseText);
            }
        }).map((base, idx) => {
            const [pre, rest] = _getMatchedPrefix(baseText, base);
            return <Text key={base} style={styles.item} onPress={() => {
                onPress && onPress(base)
            }}>
                <Text style={{fontWeight: "500"}}>{pre}</Text>
                <Text>{rest}</Text>
            </Text>

        })}
    </ScrollView>
};

// 한글 초성 19자
const CONSONANT = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

function _getMatchedPrefix(str1: string, str2: string) {
    const minLength = Math.min(str1.length, str2.length);
    let matchingPrefix = '';

    for (let i = 0; i < minLength; i++) {
        if (str1[i] === str2[i]) {
            matchingPrefix += str1[i];
        } else {
            break; // 불일치 발견 시 루프 종료
        }
    }

    return [matchingPrefix, str2.slice(matchingPrefix.length)]; // 일치하는 접두사 반환
}

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
    item: {
        paddingHorizontal: 20,
        paddingVertical: 7,
        fontSize: 16
    }
})


export default AutoComplete;

