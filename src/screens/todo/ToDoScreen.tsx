import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { RootStackParamList } from "../../navigation/type";
import { ScreenName } from "../../statics/constants/ScreenName";
import { useQuery } from "@tanstack/react-query";
import { ToDoService } from "../../service/ToDoService";
import { QueryKey } from "../../statics/constants/Querykey";
import { IListToDoParam } from "../../../types/AddToDo";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderNavigation from "../../navigation/HeaderNavigation";
import { PetService } from "../../service/PetService";
import { useRecoilState } from "recoil";

import { ScrollView } from "react-native-gesture-handler";
import { IToDo } from "../../../types/ToDo";
import { IPetType } from "../../../types/PetTypes";
import { PetListAtom } from "../../recoil/PetAtom";
import PetListModal from "./modal/PetListModal";
import ToDoCard from "./ToDoCard";

const AllTodoScreen = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamList, ScreenName.ToDoList>
    >();
  const [queryParam, setQueryParam] = useState<IListToDoParam>({
    done: null,
    pets: null,
    page: 1,
    size: 15,
  });

  const [petList, setPetList] = useRecoilState<IPetType[]>(PetListAtom);
  useEffect(() => {
    if (petList.length === 0) {
      PetService.pet.list().then((response) => {
        setPetList(response.data.data);
      });
    }
  }, []);

  const [usePetListWindow, setUsePetListWindow] = useState<boolean>(false);
  const [clickedPetIds, setClickedPetIds] = useState<number[]>([]);
  useEffect(() => {
    setQueryParam({
      ...queryParam,
      pets: clickedPetIds.length === 0 ? null : clickedPetIds,
    });
  }, [clickedPetIds]);

  const PetListButton = () => {
    var petListString =
      queryParam.pets == undefined
        ? "전체"
        : queryParam.pets
            .map((pet) => petList.find((petType) => petType.id === pet)?.name)
            .join(", ");

    if (petListString.length > 10 && queryParam.pets !== null && queryParam.pets.length > 1) {
      const firstPet = petList.find((pet) => queryParam.pets && pet.id === queryParam.pets[0]);
      if (firstPet) {
        petListString = firstPet.name + " 외 " + (queryParam.pets.length - 1);
      }
    }

    return (
      <Pressable onPress={() => setUsePetListWindow(true)}>
        <Text
          style={{ fontSize: 18, alignItems: "center", textAlign: "center" }}
        >
          {petListString} V
        </Text>
      </Pressable>
    );
  };

  interface IToDoListResponse {
    curPage: number;
    size: number;
    totalPage: number;
    totalCount: number;
    toDoList: IToDo[];
  }

  const { isLoading, data: toDoData } = useQuery({
    queryKey: [QueryKey.TODO_LIST, queryParam],
    queryFn: () => ToDoService.todo.list(queryParam),
  });

  const pageResonse: IToDoListResponse = toDoData?.data;
  const [toDoList, setToDoList] = useState<IToDo[]>([]);
  useEffect(() => {
    setToDoList(pageResonse?.toDoList || []);
  }, [toDoData]);

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }
  , []);

  return (
    <SafeAreaView>
      <HeaderNavigation  middletitle={<PetListButton />} hasBackButton={true} />
      <ScrollView>
        <View style={{display: 'flex', alignItems: 'center'}}>
        {isLoading ? <Text>Loading...</Text> : toDoList.length === 0 && <Text>할 일이 없습니다.</Text>}
        {toDoList.map((toDo) => (
          <ToDoCard todo={toDo} curTime={time}/>
        ))}
        </View>
      </ScrollView>
      {usePetListWindow && (
        <PetListModal
          queryIdList={queryParam.pets || []}
          setClickedPetIds={setClickedPetIds}
          setUsePetListWindow={setUsePetListWindow}
        />
      )}
    </SafeAreaView>
  );
};

export default AllTodoScreen;
