import React, {useEffect} from 'react';
import {Controller, FormProvider, useFormContext, UseFormReturn} from "react-hook-form";
import {StyleProp, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle} from "react-native";
import {PlainButton} from "../button/Button";
import Title from "../text/Title";
import {Colors} from "../../styles/Colors";
import {ReviseIcon} from "../../assets/svg";

interface IFormProps {
    methods: UseFormReturn<FormFiled>;
    children: React.ReactNode;
}

interface IInput {
    name: string;
    label: string;
    placeholder?: string;
    editable?: boolean;
    defaultValue?: string;
    trailingIcon?: React.ReactNode;
    onPressTrailingIcon? : () => void;
    style?: StyleProp<ViewStyle>;
}

interface ITrailingIcon {
    name: string;
    icon?: React.ReactNode;
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

/**
 * @desc TrailingIcon : Form Filed 끝에 x 표시 같은 UI.
 */
const TrailingIcon = ({children, onPress}: { children: React.ReactNode, onPress: () => void }) => {
    return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
}


// TODO useForm() 호출을 합성 컴포넌트 사용처 측으로 빼버렸으니 아이콘도 하나의 컴포넌트로 통일시킬 수 있을 것 같다.
const ClearTrailingIcon: React.FC<ITrailingIcon> = ({name, icon}) => {
    const {setValue, watch} = useFormContext();

    const filedValue = watch(name);

    if (!filedValue) return null;

    return <TrailingIcon onPress={() => setValue(name, "")}>
        {icon ? icon : <ReviseIcon/>}
    </TrailingIcon>
}

const EditTrailingIcon: React.FC<ITrailingIcon> = ({name, icon}) => {
    const {setValue} = useFormContext();

    return <TrailingIcon onPress={() => {
        setValue(name, "newValue")
    }}>{icon ? icon : <Title text={"수정"}/>}</TrailingIcon>
}

const Input: React.FC<IInput> = ({name, label, placeholder, trailingIcon, onPressTrailingIcon, editable, defaultValue = "", style}) => {
    const {control, watch} = useFormContext();

    const filedValue = watch(name);

    return <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({field: {onChange, onBlur, value}}) => {
            return <View style={styles.inputBox}>
                {label && <Title text={label} fontWeight="bold"/>}
                <View style={styles.textFiled}>
                    <TextInput style={[styles.input, style]} onBlur={onBlur} onChangeText={onChange} value={value}
                               placeholder={placeholder} editable={editable}/>
                    {(trailingIcon && (filedValue && filedValue.length > 0)) && <TouchableOpacity onPress={onPressTrailingIcon}>{trailingIcon}</TouchableOpacity>}
                </View>
            </View>
        }}/>
}

interface IToggleButton {
    name: string;
    label: string;
    buttonNames: Array<string>;
    defaultValue?: string;
}

const ToggleButtonGroup: React.FC<IToggleButton> = ({name, label, buttonNames, defaultValue}) => {
    const {control, watch, setValue} = useFormContext();

    const selectedCase = watch(name);

    useEffect(() => {
        setValue(name, defaultValue);
    }, [defaultValue]);

    return <Controller
        name={name}
        control={control}
        render={() => {
            return <View>
                {label && <Title text={label} fontWeight="bold"/>}
                <View style={styles.twoToggleButtonContainer}>
                    {buttonNames.map(buttonName => {
                        return <PlainButton
                            style={[styles.toggleButton, selectedCase === buttonName ? styles.selectedButton : {}]}
                            text={buttonName}
                            onPress={() => setValue(name, buttonName)}/>
                    })}
                </View>
            </View>
        }}
    />
}

const SubmitButton: React.FC<any> = ({text}) => {
    const {handleSubmit} = useFormContext();

    return <PlainButton text={text} onPress={handleSubmit((data) => {
        console.log(data)
    })}/>
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
        paddingVertical: 5,
        paddingHorizontal: 0,
        borderColor: Colors.C1C1C1,
        borderBottomWidth: .5,
    },
    twoToggleButtonContainer: {
        flexDirection: "row",
        gap: 5,
        paddingVertical: 10
    },
    toggleButton: {
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: Colors.DBDBDB,

    },
    selectedButton: {
        backgroundColor: Colors.FB3F7E
    }
})

export const CustomForm = Object.assign(BaseForm, {
    Input: Input,
    SubmitButton: SubmitButton,
    ClearTrailingIcon,
    EditTrailingIcon,
    ToggleButtonGroup
});