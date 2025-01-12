import React, {useEffect, useState} from 'react';
import {Controller, FormProvider, useFormContext, UseFormReturn} from "react-hook-form";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle
} from "react-native";
import {PlainButton} from "../button/Button";
import Title from "../text/Title";
import {Colors} from "../../styles/Colors";
import {CalanderIcon} from "../../assets/svg";
import CustomCalender from "../Calendar/CustomCalender";
import BottomModal from "../modal/BottomModal";
import {DateData} from "react-native-calendars/src/types";
import {convertCalendarDateToKorean} from "../Calendar/utils";
import {RegisterOptions} from "react-hook-form/dist/types/validator";

interface IFormProps {
    methods: UseFormReturn<FormFiled>;
    children: React.ReactNode;
}

interface IFormControl {
    name: string;
    label: string;
    rules?: RegisterOptions;
}

interface IInput extends IFormControl {
    placeholder?: string;
    editable?: boolean;
    defaultValue?: string;
    trailingIcon?: React.ReactNode;
    onPressTrailingIcon?: () => void;
    style?: StyleProp<ViewStyle>;
}

interface IToggleButton extends IFormControl {
    buttonNames: Array<string>;
    defaultValue?: number;
}

interface IDatePickerProps extends IFormControl {
}

type FormFiled = {
    [key: string]: string;
}

/**
 * @desc Custom Form Provider 컴포넌트
 * @example {
 *     ...
 *     const methods = useForm();
 *
 *     return (
 *     <CustomForm methods={methods}>
 *              <CustomForm.Input/>
 *              <CustomForm.Input/>
 *         </CustomForm>
 *         )
 * }
 */
const BaseForm: React.FC<IFormProps> = ({methods, children}) => {
    return <FormProvider {...methods}>
        {children}
    </FormProvider>
}

const FiledWrapper: React.FC<IFormControl & { children: React.ReactNode }> = ({name, label, children}) => {
    return <View style={styles.inputBox}>
        {label && <Title text={label} fontWeight="bold"/>}
        {children}
    </View>
}

/**
 * @desc TrailingIcon : Form Filed 끝에 x 표시 같은 UI.
 */
const TrailingIcon = ({children, onPress}: { children: React.ReactNode, onPress: () => void }) => {
    return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
}

const Input: React.FC<IInput> = ({
                                     name,
                                     label,
                                     placeholder,
                                     trailingIcon,
                                     onPressTrailingIcon,
                                     editable,
                                     defaultValue = "",
                                     style,
                                     rules,
                                 }) => {
    const {control, watch} = useFormContext();

    const filedValue = watch(name);

    return <Controller name={name} control={control} defaultValue={defaultValue}
                       rules={rules}
                       render={({field: {onChange, onBlur, value}, fieldState: {error}}) => {
                           return <FiledWrapper name={name} label={label}>
                               <View style={styles.textFiled}>
                                   <TextInput style={[styles.input, style]} onBlur={onBlur} onChangeText={onChange}
                                              value={value}
                                              placeholder={placeholder} editable={editable}
                                   />
                                   {(trailingIcon && (filedValue && filedValue.length > 0)) &&
                                       <TouchableOpacity
                                           onPress={onPressTrailingIcon}>{trailingIcon}</TouchableOpacity>}
                               </View>
                               {error && error.message && <ValidationMessage message={error.message}/>}
                           </FiledWrapper>
                       }}
    />
}

const ToggleButtonGroup: React.FC<IToggleButton> = ({name, label, buttonNames, defaultValue}) => {
    const {control, watch, setValue} = useFormContext();

    const selectedCase = watch(name);

    useEffect(() => {
        setValue(name, defaultValue);
    }, [defaultValue]);

    return <Controller name={name} control={control}
        render={() => {
            return <FiledWrapper name={name} label={label}>
                <View style={styles.twoToggleButtonContainer}>
                    {buttonNames.map((buttonName, idx) => {
                        return <PlainButton
                            key={idx}
                            style={[styles.toggleButton, selectedCase === idx ? styles.selectedButton : {}]}
                            text={buttonName}
                            onPress={() => setValue(name, idx)}/>
                    })}
                </View>
            </FiledWrapper>
        }}
    />
}

const DatePicker: React.FC<IDatePickerProps> = ({name, label, rules}) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const {control, setValue} = useFormContext();
    return <Controller name={name} control={control}
                       rules={rules}
                       render={({field: {value}, fieldState: {error}}) => {
                           return <FiledWrapper name={name} label={label}>
                               {/* 생년월일 필드 */}
                               <View style={styles.textFiled}>
                                   <TextInput style={[styles.input, {color: Colors.Black}]} value={value}
                                              placeholder={"생년 월일을 입력해주세요"} editable={false}/>
                                   <TrailingIcon onPress={() => setIsVisible(true)}><CalanderIcon/></TrailingIcon>
                               </View>
                               {error && error.message && <ValidationMessage message={error.message}/>}
                               {/* 캘린더 오픈 */}
                               <BottomModal onClose={() => setIsVisible(false)} isVisible={isVisible}>
                                   <CustomCalender onDayPress={(day?: DateData) => {
                                       day && setValue(name, convertCalendarDateToKorean(day), {shouldValidate: true});
                                       setIsVisible(false);
                                   }}/>
                               </BottomModal>
                           </FiledWrapper>
                       }}/>
}

const SubmitButton: React.FC<{ text:string, onPress: (data : any) => void }> = ({text, onPress}) => {
    const {handleSubmit} = useFormContext();

    return <PlainButton text={text} onPress={handleSubmit((data) => {
        onPress(data);
    })}/>
}

const ValidationMessage: React.FC<{ message: string }> = ({message}) => {
    return <View style={styles.validationContainer}>
        <Text style={styles.validationMessage}>{message}</Text>
    </View>
}

// Style -------
const styles = StyleSheet.create({
    inputBox: {
        marginVertical: 5,
    },
    textFiled: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    input: {
        flex: 1,
        fontSize: 12,
        paddingTop: 5,
        paddingHorizontal: 2,
        borderColor: Colors.C1C1C1,
        borderBottomWidth: .5,
    },
    twoToggleButtonContainer: {
        flexDirection: "row",
        gap: 10,
        paddingVertical: 10
    },
    toggleButton: {
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: Colors.DBDBDB,

    },
    selectedButton: {
        backgroundColor: Colors.FB3F7E
    },
    validationContainer: {
        borderRadius: 4,
        backgroundColor: Colors.SoftCoral,
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginTop: 5
    },
    validationMessage: {
        color: Colors.FF4040,
        fontSize: 12,
        lineHeight: 16,
    }
})

export const CustomForm = Object.assign(BaseForm, {
    Input: Input,
    SubmitButton: SubmitButton,
    ToggleButtonGroup,
    DatePicker
});