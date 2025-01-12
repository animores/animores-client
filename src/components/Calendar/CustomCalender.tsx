import React from 'react';
import {Calendar} from "react-native-calendars";
import {DayProps} from "react-native-calendars/src/calendar/day";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {DateData} from "react-native-calendars/src/types";
import {Colors} from "../../styles/Colors";
import {MarkingProps} from "react-native-calendars/src/calendar/day/marking";
import {getDayOfWeek} from "./utils";
import {LeftArrow, RightArrow} from "../../assets/svg";

interface CustomMarkingProps extends MarkingProps {
    customMessage?: string;
}

type Direction = "right" | "left";

type CustomDayProps = DayProps &
    { date?: DateData; } &
    // markDates 에 전달되는 data 값
    { marking?: CustomMarkingProps };

interface IProps {
    onDayPress?: (day?: DateData) => void;
}

// 날짜 정보를 바탕으로 해당 날짜에 맞는 스타일 리턴
const getDayStyle = ({state, date}: CustomDayProps) => {
    const styleList = [];
    styleList.push(dayStyle.default);
    if (state === "today") {
        styleList.push(dayStyle.select);
    }
    if (state === "disabled") {
        styleList.push(dayStyle.disabled);
    }
    if (getDayOfWeek(date?.dateString || "1900-01-01") === 0) {
        styleList.push(dayStyle.sunday);
    }
    return styleList;
}

// 달려 커스텀 컴포넌트
const CustomDay: React.ComponentType<CustomDayProps> = ({date, state, marking, onPress}) => {
    const dayStyleList = getDayStyle({date, state});

    return <TouchableOpacity onPress={() => onPress?.(date)}>
        {marking?.customMessage ? <Text>{marking.customMessage}</Text> :
            <Text style={dayStyleList}>{date && date.day}</Text>}
    </TouchableOpacity>
}

const CustomArrow: React.FC<{ direction: Direction }> = ({direction}) => {
    if (direction === "right") {
        return <View><RightArrow/></View>
    } else {
        return <View><LeftArrow/></View>
    }
}

const CustomHeader : React.FC<{date : Date}> = ({date}) => {
    return <View >
        <Text>{date.getFullYear()}년 {date.getMonth() + 1}월</Text>
    </View>
}

function CustomCalender({onDayPress}: IProps) {
    return (
        <Calendar onDayPress={onDayPress}
                  dayComponent={(props: CustomDayProps) => <CustomDay {...props} onPress={onDayPress}/>}
                  renderArrow={(direction: Direction) => <CustomArrow direction={direction}/>}
                  renderHeader={(date : Date) => <CustomHeader date={date}/>}
        />
    );
}


const dayStyle = StyleSheet.create({
    select: {
        backgroundColor: "black",
        color: Colors.White,
        borderRadius: 50,
        paddingHorizontal: 6
    },
    default: {
        padding: 5,
    },
    disabled: {
        color: Colors.Gray717171
    },
    sunday: {
        color: Colors.FF4040
    }
})

export default CustomCalender;