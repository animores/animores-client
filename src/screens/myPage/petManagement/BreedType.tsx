import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import InputSearch from '../../../components/Input/InputSearch';
import SingleButton from '../../../components/button/SingleButton';
import Title from '../../../components/text/Title';
import HeaderNavigation from '../../../navigation/HeaderNavigation';
import {RootStackParamList} from '../../../navigation/type';
import {ScreenName} from '../../../statics/constants/ScreenName';
import {Colors} from '../../../styles/Colors';
import {useQuery} from "@tanstack/react-query";
import {QueryKey} from "../../../statics/constants/Querykey";
import {PetService} from "../../../service/PetService";
import {IBreedType} from "../../../../types/PetTypes";
import AutoComplete from "./AutoComplete";

const BreedType = () => {
    const navigation =
        useNavigation<StackNavigationProp<RootStackParamList, ScreenName.BreedType>>();
    const [keyword, setKeyword] = useState<string>('');
    const route = useRoute<RouteProp<RootStackParamList, ScreenName.BreedType>>(),
        {petType, isEdit} = route.params;

    const {data : breedTypeList} = useQuery<IBreedType[]>([QueryKey.BREED_LIST], () => PetService.pet.breedList(petType), {
        enabled: !!petType,
        initialData : [],
    });

    return (
        <View style={styles.container}>
            <HeaderNavigation
                middletitle="펫 추가"
                hasBackButton={true}
                onPressBackButton={() => {
                    navigation.goBack();
                }}
            />
            <View style={styles.horizontalContainer}>
                <View style={{flex: 2.5}}>
                    <Title
                        text={"품종이 무엇인가요?"}
                        fontSize={16}
                        fontWeight="bold"
                        style={{marginTop: 52, marginBottom: 31}}
                    />
                    <InputSearch
                        value={keyword}
                        setValue={setKeyword}
                        name={'_'}
                        placeholder={'직접 입력하세요'}
                    />
                    <AutoComplete searchText={keyword} suggestionList={breedTypeList.map(item => item.name)}
                                  onPress={setKeyword}/>
                </View>
                <View style={styles.buttonContainer}>
                    {isEdit ? <SingleButton title={"완료"} onPress={() => {
                        navigation.navigate(ScreenName.AddPet, {breed : keyword});
                    }} disabled={false}/> : <SingleButton
                        title="다음"
                        disabled={!keyword}
                        onPress={() => {
                            if (keyword) {
                                navigation.navigate(ScreenName.AddPet, {breed: keyword});
                            }
                        }}
                        style={{marginTop: 70}}
                    />}
                </View>
            </View>
        </View>
    );
};

export default BreedType;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.White,
    },
    horizontalContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
})