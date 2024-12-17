import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { RootStackParamList } from "../../navigation/type";
import { ScreenName } from "../../statics/constants/ScreenName";
import { useQuery } from "@tanstack/react-query";
import { ToDoService } from "../../service/ToDoService";
import { QueryKey } from "../../statics/constants/Querykey";
import { IListToDoParam } from "../../../types/AddToDo";
import HeaderNavigation from "../../navigation/HeaderNavigation";
import { PetService } from "../../service/PetService";
import { useRecoilState } from "recoil";

import { FlatList } from "react-native-gesture-handler";
import { IToDo } from "../../../types/ToDo";
import { IPetTypes } from "../../../types/PetTypes";
import { PetListAtom } from "../../recoil/PetAtom";
import PetListModal from "./modal/PetListModal";
import ToDoCard from "./ToDoCard";
import FloatingButton from "../../components/button/FloatingButton";
import styled from "styled-components/native";
import CenterModal from "../../components/modal/CenterModal";

import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
    useSharedValue, 
    withSpring,  
  } from 'react-native-reanimated';

interface IToDoListResponse {
  curPage: number;
  size: number;
  totalPage: number;
  totalCount: number;
  toDoList: IToDo[];
}

const HIDDEN_MENU_WIDTH = 70;
const TIMING_DURATION = 500;

const AllTodoScreen = () => {
  const [petList, setPetList] = useRecoilState<IPetTypes[]>(PetListAtom);
  useEffect(() => {
    if (petList.length === 0) {
      PetService.pet.list().then((response) => {
        setPetList(response.data.data);
      });
    }
  }, [petList.length]);

  const [usePetListWindow, setUsePetListWindow] = useState<boolean>(false);
  const [clickedPetIds, setClickedPetIds] = useState<number[]>([]);

  const [queryParam, setQueryParam] = useState<IListToDoParam>({
    done: null,
    pets: null,
    page: 1,
    size: 15,
  });

  useEffect(() => {
    setQueryParam({
      ...queryParam,
      pets: clickedPetIds.length === 0 ? null : clickedPetIds,
    });
  }, [clickedPetIds]);

  const PetListButton = useCallback(() => {
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
  }, [queryParam.pets]);

  const { isLoading, data: toDoData } = useQuery({
    queryKey: [QueryKey.TODO_LIST, queryParam],
    queryFn: () => ToDoService.todo.list(queryParam),
  });

  const pageResonse: IToDoListResponse = toDoData?.data;
  const [toDoList, setToDoList] = useState<IToDo[]>([]);
  const [gestures, setGestures] = useState<{ [key: number]: any }>({});
  useEffect(() => {
    setToDoList(pageResonse?.toDoList || []);
    setGestures(pageResonse?.toDoList.reduce((acc, item) => {
      acc[item.id] = useSharedValue(0);
      return acc;
    }, {} as { [key: number]: any }));
  }, [toDoData]);

  const [time, setTime] = useState(new Date());
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setTime(new Date());
  //   }, 60000);
  //   return () => clearInterval(interval);
  // }
  // , []);

  const [isVisibleMenu, setIsVisibleMenu] = useState<boolean>(false); //플로팅버튼
  const [todoIdToDelete, setTodoIdToDelete] = useState<number | null>(null); //삭제할 todo id
  
  const resetAllGestures = (exceptId: number) => {
    Object.keys(gestures).forEach((key) => {
      if (parseInt(key) !== exceptId) {
        gestures[parseInt(key)].value = withSpring(0);
      }
    });
  };
  
  const handleGestureEvent = (id: number) => Gesture.Pan()
  .onUpdate((event) => {
    gestures[id].value = event.translationX;
  })
  .onEnd((event) => {
    const { translationX } = event;
    if (Math.abs(translationX) > 20) {
      resetAllGestures(id);
    }
    if (translationX > 50) {
      animateSwipe(id, 0);
    } else if (translationX < -50) {
      animateSwipe(id, -80);
    } else {
      resetPosition(id);
    }
  });
  
  const animateSwipe = (id: number, toValue: number) => {
    gestures[id].value = withSpring(toValue);
  };
  
  const resetPosition = (id: number) => {
    gestures[id].value = withSpring(0);
  };

  return (
    <>
      <HeaderNavigation  middletitle={<PetListButton />} hasBackButton={false} />
      <View style={{display: 'flex', alignItems: 'center'}}>
        {isLoading ? <Text>Loading...</Text> : toDoList.length === 0 && <Text>할 일이 없습니다.</Text>}
        <FlatList
          data={toDoList}
          renderItem={({ item }) => (
            <GestureDetector key={item.id} gesture={handleGestureEvent(item.id)}>
              <Animated.View style={{transform: [{translateX: gestures[item.id].value}]}}>
                <ToDoCard
                  todo={item}
                  curTime={time}
                  onDelete={() => {
                    setTodoIdToDelete(item.id)
                  }}
                />
              </Animated.View>
            </GestureDetector>
          )}
          keyExtractor={(item) => `todo-${item.id}`}
        />
      </View>
      <FloatingButtonContainer isVisibleMenu={isVisibleMenu}>
        <FloatingButton
          isVisibleMenu={isVisibleMenu}
          onPressCancel={() => setIsVisibleMenu(false)}
          onPressFloating={() => setIsVisibleMenu(!isVisibleMenu)}
          />
      </FloatingButtonContainer>
      {usePetListWindow && (
        <PetListModal
          queryIdList={queryParam.pets || []}
          setClickedPetIds={setClickedPetIds}
          setUsePetListWindow={setUsePetListWindow}
        />
      )}
      <CenterModal
        visible={todoIdToDelete != null}
        title="할 일을 삭제하시겠어요?"
        subTitle="삭제 이후에는 할 일이 영구적으로 삭제되며, 복원하실 수 없습니다."
        onClose={() => setTodoIdToDelete(null)}
        onDelete={() => {
          if (todoIdToDelete === null) return;
          ToDoService.todo.delete(todoIdToDelete);
          setToDoList(toDoList.filter((todo) => todo.id !== todoIdToDelete));
          setTodoIdToDelete(null);
        }}
      />

    </>
  );
};

export default AllTodoScreen;

interface IFloatingButtonContainer {
  isVisibleMenu: boolean;
}

interface IToDoListResponse {
  curPage: number;
  size: number;
  totalPage: number;
  totalCount: number;
  toDoList: IToDo[];
}

const FloatingButtonContainer = styled.View<IFloatingButtonContainer>`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: ${(props) => (props.isVisibleMenu ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.0)")};
  z-index:${(props) => (props.isVisibleMenu ?  1 : 0)};
  ${(props) => props.isVisibleMenu && `top: 0;`}
`;