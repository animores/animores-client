import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import React, {useEffect} from "react";
import {useForm} from "react-hook-form";
import {StyleProp, StyleSheet, View, ViewStyle} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import HeaderNavigation from "../../../navigation/HeaderNavigation";
import {RootStackParamList} from "../../../navigation/type";
import {ScreenName} from "../../../statics/constants/ScreenName";
import {Colors} from "../../../styles/Colors";
import PetImagePicker from "./PetImagePicker";
import {CustomForm} from "../../../components/form/Form";
import {ReviseIcon} from "../../../assets/svg";
import Title from "../../../components/text/Title";

const GENDER_TYPE = ["남아", "여아"];

const AddPet = () => {
    const navigation =
        useNavigation<StackNavigationProp<RootStackParamList, ScreenName.AddPet>>();
    const route = useRoute<RouteProp<RootStackParamList, ScreenName.AddPet>>(),
        {breed} = route.params;

    const methods = useForm();

    const handleClearTrailing = (filedName : string) => {
        methods.setValue(filedName , "")
    }

    useEffect(() => {
        methods.setValue("breed", route.params?.breed);
    }, [route.params?.breed]);

    return (
        <View style={styles.container}>
            <HeaderNavigation
                middletitle="펫 추가"
                hasBackButton={true}
                onPressBackButton={() => {
                    navigation.navigate(ScreenName.PatManagement);
                }}
            />
            <ScrollView style={styles.horizontalContainer}>
                <PetImagePicker/>
                {/* 합성 컴포넌트 패턴 */}
                <View style={{gap: 20}}>
                    <CustomForm methods={methods}>
                        <CustomForm.Input name="name"
                                          label={"반려동물 이름"}
                                          placeholder={"반려동물의 이름을 입력해주세요"}
                                          trailingIcon={<ReviseIcon/>}
                                          onPressTrailingIcon={() => handleClearTrailing("name")}
                        />
                        <CustomForm.Input name="breed"
                                          label={"품종"}
                                          editable={false}
                                          defaultValue={breed}
                                          style={{color: Colors.Black} as StyleProp<ViewStyle>}
                                          trailingIcon={<Title text={"수정"} />}
                                          onPressTrailingIcon={() => navigation.push(ScreenName.BreedType, {petType : 0, isEdit : true})}
                        />
                        <CustomForm.ToggleButtonGroup name={"gender"} label={"성별"} buttonNames={GENDER_TYPE}
                                                      defaultValue={GENDER_TYPE[0]}/>
                        <CustomForm.Input name="birthday" label={"생년월일"}/>
                        <CustomForm.Input name="weight" label={"몸무게"} placeholder="kg"/>
                        <CustomForm.SubmitButton text={"제출"}/>
                    </CustomForm>
                </View>
            </ScrollView>
        </View>
    );
};


export default AddPet;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.White,
    },
    horizontalContainer: {
        paddingHorizontal: 20,
    },
});
