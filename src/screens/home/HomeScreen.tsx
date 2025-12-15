import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Image, ImageBackground, StyleSheet, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
import HomeTheme1 from "../../assets/png/bg_home_theme1.png";
import { BathIcon, FeedIcon, HomeAvatar1, HomeAvatar2, HomeAvatar3, HomeAvatar4, HomeAvatar5, MedicineIcon, WalkIcon } from "../../assets/svg";
import { CurrentProfileAtom } from "../../recoil/AuthAtom";
import { ToDoService } from "../../service/ToDoService";
import { QueryKey } from "../../statics/constants/Querykey";
import AvatarSwiper from "./AvatarSwiper";
import TodoSwiper from "./TodoSwiper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../../navigation/type";
import { ScreenName } from "../../statics/constants/ScreenName";

const ItemsAvatar = [
    {
      image: <HomeAvatar1 />,
      emotion: <WalkIcon width="100" height="100" />,
    },
    {
      image: <HomeAvatar2 />,
      emotion: <FeedIcon width="100" height="100" />,
    },
    {
      image: <HomeAvatar3 />,
      emotion: <BathIcon width="100" height="100" />,
    },
    {
      image: <HomeAvatar4 />,
      emotion: <MedicineIcon width="100" height="100" />,
    },
    {
      image: <HomeAvatar5 />,
      emotion: <WalkIcon width="100" height="100" />,
    },
]

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, ScreenName.Profiles>>();
  const baseUrl = "https://animores-image.s3.ap-northeast-2.amazonaws.com";
  
  const currentProfile = useRecoilValue(CurrentProfileAtom);

  const { data: todayToDo, isLoading, isError } = useQuery({
    queryKey: [QueryKey.TODO_LIST],
    queryFn: () => ToDoService.todo.today(1, 5),
  });

  if (isLoading) return null;

  const todayTodoList = todayToDo?.data?.data?.toDoList ?? [];

  if (todayTodoList.length === 0) {
    todayTodoList.push({
      id: 0,
      title: "산책",
      pets: [
        {
          id: 0,
          name: "심바"
        },
        {
          id: 1,
          name: "호동"
        },
        {
          id: 2,
          name: "레오"
        },
      ],
      isAllDay: true,
      date: "2024-08-30",
      time: "10:00",
      isUsingAlarm: true,
      color: "red",
      completeProfileImage: "",
      completeDateTime: ""
    });
  }

  return (
    <ImageBackground source={ HomeTheme1 } resizeMode="cover" style={styles.homeBackground}>
      <SafeAreaView style={styles.container}>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 20 }}>
          <Pressable onPress={() => {
                    navigation.navigate(ScreenName.Profiles);
                }}>
          <Image
          style={styles.profile}
          source={{ uri: `${baseUrl}/${currentProfile?.imageUrl}` }}
           />
           </Pressable>
        </View>
        <TodoSwiper itemList={todayTodoList} />
        <AvatarSwiper itemList={ItemsAvatar} />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  homeBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  petState: {
    paddingHorizontal: 40,
    backgroundColor: "#fff",
  },
  homeAvatar: {
    width: 50,
    height: 50,
  },
})