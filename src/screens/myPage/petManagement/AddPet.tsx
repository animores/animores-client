import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import React, {useEffect} from "react";
import {useForm} from "react-hook-form";
import {StyleProp, StyleSheet, Text, View, ViewStyle} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import HeaderNavigation from "../../../navigation/HeaderNavigation";
import {RootStackParamList} from "../../../navigation/type";
import {ScreenName} from "../../../statics/constants/ScreenName";
import {Colors} from "../../../styles/Colors";
import PetImagePicker from "./PetImagePicker";
import {CustomForm} from "../../../components/form/Form";
import {ReviseIcon} from "../../../assets/svg";
import Title from "../../../components/text/Title";
import {PetService} from "../../../service/PetService";
import {IPetRequest} from "../../../../types/PetTypes";
import {useMutation} from "@tanstack/react-query";
import {useBreedList} from "./hooks/useBreed";
import {formatToYYYYMMDD} from "../../../components/Calendar/utils";

const GENDER_TYPE = ["남아", "여아"];

const Rules = {
    name: {
        required: "\"이름\"을 입력해 주세요",
        minLength: {value: 2, message: "너무 짧습니다. 최소 2글자 이상으로 입력해주세요"}
    },
    date: {
        required: "\"생년 월일\"을 입력해 주세요.",
        pattern: {value: /^(\d{4})년\s(\d{1,2})월\s(\d{1,2})일$/, message: "날짜 형식이 맞지 않습니다."},
    },
    weight: {
        required: "\"몸무게\"를 입력해주세요.",
        pattern: {
            value: /^[0-9]*$/,
            message: "숫자만 입력 가능합니다."
        }
    },
}

const AddPet = () => {
    const navigation =
        useNavigation<StackNavigationProp<RootStackParamList, ScreenName.AddPet>>();
    const route = useRoute<RouteProp<RootStackParamList, ScreenName.AddPet>>(),
        {breed, petType} = route.params;

    const methods = useForm();

    const handleClearTrailing = (filedName : string) => {
        methods.setValue(filedName , "")
    }

    const breedList = useBreedList(petType);

    const {mutate} = useMutation({
        mutationFn: async (data: IPetRequest) => {
            console.log(data);
            return PetService.pet.create(data);
        },
        onSuccess: (data) => {
            if (data.data.status === 200) {
                navigation.navigate(ScreenName.PatManagement);
            }
        },
        onError: (error, variables) => {
            console.error(error, variables)
        }
    })

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
                <View style={{gap: 20, paddingVertical : 20}}>
                    <CustomForm methods={methods}>
                        <CustomForm.Input name="name"
                                          label={"반려동물 이름"}
                                          placeholder={"반려동물의 이름을 입력해주세요"}
                                          trailingIcon={<ReviseIcon/>}
                                          onPressTrailingIcon={() => handleClearTrailing("name")}
                                          rules={Rules.name}
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
                                                      defaultValue={0}/>
                        <CustomForm.DatePicker name="birthday" label={"생년월일"} rules={Rules.date}/>
                        <CustomForm.Input name="weight" label={"몸무게"} placeholder={"몸무게를 입력해주세요"}
                                          trailingIcon={<Text>Kg</Text>} rules={Rules.weight}
                        />
                        <CustomForm.SubmitButton text={"제출"} onPress={() => {
                            mutate({
                                breedId: breedList.filter(breedInfo => breedInfo.name === breed)[0].id,
                                imageId: 1,
                                name: methods.getValues("name") || "뽀삐",
                                gender: methods.getValues("gender"),
                                birthday: formatToYYYYMMDD(methods.getValues("birthday")),
                                weight: Number(methods.getValues("weight"))
                            });
                        }}/>
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
