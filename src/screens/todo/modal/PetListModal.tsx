import { useRecoilState } from "recoil";
import React, { useEffect, useState } from "react";
import { PetListAtom } from "../../../recoil/PetAtom";
import { IPetType } from "../../../../types/PetTypes";
import { PetService } from "../../../service/PetService";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import BottomModal from "../../../components/modal/BottomModal";
import { ScrollView } from "react-native-gesture-handler";
import { Colors } from "../../../styles/Colors";
import { IconCheck } from "../../../assets/icons";

const PetListModal = (props: any) => {
    const { setUsePetListWindow, queryIdList, setClickedPetIds } = props;
    const [petList, setPetList] = useRecoilState<IPetType[]>(PetListAtom);
    useEffect(() => { 
      if(petList.length === 0) {
        PetService.pet.list().then((response) => {
          setPetList(response.data.data);
        });
      }
    }, []);

    const [pressedPetsId, setPressedPetsId] = useState<number[]>(queryIdList);
    const togglePetsIdsFunction = (id: number) => {
      if(pressedPetsId.includes(id)) {
        setPressedPetsId(pressedPetsId.filter((petId) => petId !== id));
      } else {
        setPressedPetsId([...pressedPetsId, id].sort()); 
      }
    };

    const baseURL = "https://animores-image.s3.ap-northeast-2.amazonaws.com";
    const petListFooter = () => {
      return (
        <View style={styles.container}>
          <View style={styles.footerTopLine} />
          <ScrollView>
            {petList.map((pet) => (
              <Pressable key={pet.id} onPress={() => togglePetsIdsFunction(pet.id)}>
                <View style={styles.petRowContainer}>
                  <View style={{flexDirection: 'row'}}>
                    <Image source={{uri: baseURL+pet.image}} style={{width: 50, height: 50, marginRight: 20}}/>
                    <Text style={{color: pressedPetsId.includes(pet.id) ? Colors.Black : Colors.Gray717171}}>{pet.name}</Text>
                  </View>
                  <View style={{backgroundColor: pressedPetsId.includes(pet.id) ? Colors.FB3F7E : Colors.Gray717171, ...styles.checkBox}}>
                    <IconCheck/>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <View style={{flexDirection: "row", justifyContent: "space-between", marginHorizontal: 10}}>
            <Pressable onPress={() => {
                setUsePetListWindow(false);
              }} style={styles.confirmButton}>
              <Text style={{color: Colors.White}}>닫기</Text>
            </Pressable>
            <Pressable onPress={() => {
                setUsePetListWindow(false);
                setClickedPetIds(pressedPetsId);
              }} style={styles.confirmButton}>
              <Text style={{color: Colors.White}}>확인</Text>
            </Pressable>
          </View>
        </View>
      )
    };


  return (
    <BottomModal isVisible={true} footer={petListFooter} />
  );
};

export default PetListModal;

const styles = StyleSheet.create({
    container: {
      marginTop: 15,
      justifyContent: 'center',
      marginHorizontal: 30,
      height: 400,
    },
    footerTopLine: {
      backgroundColor: '#838383',
      height: 1.5,
      width: 50,
      alignSelf: "center",
      marginBottom: 10,
    },
    petRowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10,
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 20,
        elevation: 5,
    },
    text: {
        color: 'black',
    },
    buttonText: {
        color: 'white',
    },
    checkBox: {
        width: 24,
        height: 24,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.Gray717171,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    confirmButton: {
        backgroundColor: Colors.FB3F7E,
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    }
});