import ToDoType from "../src/statics/constants/ToDoType";

type RepeatUnitType = {
    [key: string]: {
        name: string;
        display: string;
        intervalText: string;
    };
};


export const RepeatUnit: RepeatUnitType = {
    HOURS: {name: 'HOURS', display: "매시간", intervalText: "시간마다"},
    DAY: {name: 'DAY', display: "매일", intervalText: "일마다"},
    WEEK: {name:'WEEK', display: "매주", intervalText: "주마다"},
}

export enum WeekDay {
    MONDAY = '월',
    TUESDAY = '화',
    WEDNESDAY = '수',
    THURSDAY = '목',
    FRIDAY = '금',
    SATURDAY = '토',
    SUNDAY = '일',
}

export interface IRepeat {
    unit: string;
    interval: number;
    weekDays: WeekDay[];
}

interface IAddTodo {
    clickedPetsId: number[];
    content: string | null;
    tag: ToDoType | null;
    date: string;
    time: string;
    isAllDay: boolean;
    color: string;
    isUsingAlarm: boolean;
    repeat: IRepeat | null;
}

export default IAddTodo;
