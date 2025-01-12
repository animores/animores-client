import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { Image, Platform, Pressable, StyleSheet, View } from "react-native";
import { IPetType } from "../../../../types/PetTypes";
import SingleButton from "../../../components/button/SingleButton";
import Title from "../../../components/text/Title";
import { petTypes } from "../../../data/PetTypes";
import HeaderNavigation from "../../../navigation/HeaderNavigation";
import { RootStackParamList } from "../../../navigation/type";
import { ScreenName } from "../../../statics/constants/ScreenName";
import { Colors } from "../../../styles/Colors";
import {useQuery} from "@tanstack/react-query";
import { QueryKey } from "../../../statics/constants/Querykey";
import {PetService} from "../../../service/PetService";
import {AxiosError} from "axios";
import PngImage from "../../../assets/png";


const PetType = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamList, ScreenName.PetType>
    >();

  const [userSelectPetType, setUserSelectPetType] = useState<string>("");
  const {data: petSpeciesList, error, isLoading, isSuccess} = useQuery<IPetType[], AxiosError, IPetType[], string[]>([QueryKey.PET_SPECIES], PetService.pet.speciesList);
  // 펫 리스트 로딩 전 중 & 로딩 실패 시에 대한 화면 필요
  if(isLoading || !isSuccess) return;

  return (
    <View style={styles.container}>
      <HeaderNavigation
        middletitle="펫 추가"
        hasBackButton={true}
        onPressBackButton={() => {
          navigation.goBack();
        }}
      />
      <View style={styles.paddingContainer}>
        <View style={{ flex: 1 }}>
          <Title
            text={"종류가 무엇인가요?"}
            fontSize={16}
            fontWeight="bold"
            style={{ marginTop: 52, marginBottom: 31 }}
          />
          {petSpeciesList.map((petSpeciesItem: IPetType) => {
            return (
              <Pressable
                key={petSpeciesItem.id}
                onPress={() => {
                  setUserSelectPetType(petSpeciesItem.name);
                }}
                style={[
                  styles.pressableType,
                  userSelectPetType === ""
                    ? styles.pressableType
                    : userSelectPetType === petSpeciesItem.name
                    ? styles.selectedType
                    : styles.unselectedType,
                ]}
              >
                <Image source={PngImage.petType[`${PngImage.getPetType(petSpeciesItem.name)}`] || PngImage.petType.dog}/>
                <Title
                  text={petSpeciesItem.name}
                  fontWeight={userSelectPetType ? "bold" : "normal"}
                  style={{ marginLeft: 16, alignSelf: "center" }}
                />
              </Pressable>
            );
          })}
        </View>
        <View style={styles.buttonContainer}>
          <SingleButton
            title={"다음"}
            disabled={!userSelectPetType}
            onPress={() => {
              if (userSelectPetType) {
                navigation.navigate(ScreenName.BreedType , { petType : 1 });
              }
            }}
            style={{ marginTop: 70 }}
          />
        </View>
      </View>
    </View>
  );
};

export default PetType;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  paddingContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pressableType: {
    flexDirection: "row",
    backgroundColor: Colors.F9F9FB,
    paddingVertical: 8,
    marginBottom: 16,
    paddingLeft: 20,
    borderRadius: 10,
  },
  selectedType: {
    borderWidth: 1,
    borderColor: Colors.F9F9FB,
    ...Platform.select({
      ios: {
        shadowColor: "gray",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
        shadowColor: "gray",
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
  },
  unselectedType: {
    opacity: 0.4,
    backgroundColor: Colors.F9F9FB,
  },
  buttonContainer: {
    justifyContent: "flex-end",
  },
});
