import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgProps } from "react-native-svg";
import {
  AlertIcon,
  CustomerServiceIcon,
  InformationIcon,
  LogoutIcon,
  NoticeIcon,
  PetIcon,
  ProfileIcon,
  VersionIcon,
  WithdrawIcon,
} from "../../assets/svg";
import Title from "../../components/text/Title";
import HeaderNavigation from "../../navigation/HeaderNavigation";
import { ScreenName } from "../../statics/constants/ScreenName";
import { Colors } from "../../styles/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/type";

interface IMypageList {
  id: number;
  name: string;
  image: React.FC<SvgProps>;
  screen?: any;
}

const MypageScreen = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, ScreenName.Mypage>>();

  const myPageTopList: IMypageList[] = [
    {
      id: 1,
      name: "프로필 및 계정 관리",
      image: ProfileIcon,
      screen: ScreenName.ProfileManagement,
    },
    {
      id: 2,
      name: "펫 관리",
      image: PetIcon,
      screen: ScreenName.PatManagement,
    },
    {
      id: 3,
      name: "알림 설정",
      image: AlertIcon,
      screen: ScreenName.AlertSetting,
    },
  ];

  const myPageBottomList: IMypageList[] = [
    {
      id: 4,
      name: "공지 사항",
      image: NoticeIcon,
      screen: ScreenName.Notice
    },
    {
      id: 5,
      name: "고객 센터",
      image: CustomerServiceIcon,
      screen: ScreenName.CustomerService,
    },
    {
      id: 6,
      name: "이용 안내",
      image: InformationIcon,
      screen: ScreenName.Information,
    },
  ];

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();

      Toast.show({
        type: "success",
        text1: "로그아웃 성공",
      });
      navigation.navigate(ScreenName.Login);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "로그아웃 실패"
      })
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderNavigation
          middletitle="마이페이지"
          hasBackButton={false}
          onPressBackButton={() => {
            navigation.goBack();
          }}
        />
        <View style={styles.topBackground}>
          <View style={styles.grayBackground}>
            {myPageTopList.map((m: IMypageList, index: number) => {
              return (
                <Pressable
                  key={m.id}
                  onPress={() => navigation.navigate(m.screen)}
                  style={[
                    styles.myPageContainer,
                    { paddingTop: index === 0 ? 30 : 0 },
                  ]}
                >
                  <m.image />
                  <Title text={m.name} style={{ marginLeft: 10 }} />
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.bottomBackground}>
          <View style={styles.whiteBackground}>
            {myPageBottomList.map((m: IMypageList, index: number) => {
              return (
                <Pressable
                  key={m.id}
                  onPress={() => navigation.navigate(m.screen)}
                  style={[
                    styles.myPageContainer,
                    { paddingTop: index === 0 ? 30 : 0 },
                  ]}
                >
                  <m.image />
                  <Title text={m.name} style={{ marginLeft: 10 }} />
                </Pressable>
              );
            })}
            <View style={styles.versionInformationContainer}>
              <View style={{ flexDirection: "row" }}>
                <VersionIcon />
                <Title text={"버전 정보"} style={{ marginLeft: 10 }} />
              </View>
              <Title text={"최신 버전 입니다"} color={Colors.AEAEAE} />
            </View>
          </View>
          <View style={styles.logoutContainer}>
            <Pressable onPress={handleLogout} style={styles.rowView}>
              <LogoutIcon />
              <Title
                text={"로그아웃"}
                color={Colors.AEAEAE}
                style={{ marginLeft: 10 }}
              />
            </Pressable>
            <View
              style={{
                borderWidth: 1.5,
                borderColor: Colors.F4F4F4,
                marginHorizontal: 18,
              }}
            />
            <Pressable style={styles.rowView}>
              <WithdrawIcon />
              <Title
                text={"탈퇴하기"}
                color={Colors.AEAEAE}
                style={{ marginLeft: 10 }}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MypageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.F9F9FB
  },
  myPageContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 30,
    marginHorizontal: 20,
  },
  topBackground: {
    backgroundColor: "white",
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  bottomBackground: {
    backgroundColor: Colors.F9F9FB,
    paddingVertical: 22,
    flex: 1,
    paddingHorizontal: 20,
  },
  whiteBackground: {
    backgroundColor: "white",
    borderRadius: 20,
  },
  grayBackground: {
    backgroundColor: Colors.F9F9FB,
    borderRadius: 20,
  },
  rowView: {
    flexDirection: "row",
  },
  logoutContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 50
  },
  versionInformationContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: "space-between",
  },
});
