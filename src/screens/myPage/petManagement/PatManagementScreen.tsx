import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Image, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import asset from "../../../assets/png";
import Title from "../../../components/text/Title";
import HeaderNavigation from "../../../navigation/HeaderNavigation";
import { RootStackParamList } from "../../../navigation/type";
import { ScreenName } from "../../../statics/constants/ScreenName";
import { Colors } from "../../../styles/Colors";

const PatManagementScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, ScreenName.PatManagement>>();

  return (
    <SafeAreaView style={styles.container}>
      <HeaderNavigation
        middletitle="펫 관리"
        hasBackButton={true}
        onPressBackButton={() => {
          navigation.goBack();
        }}
        rightTitle="편집"
      />
      <View style={styles.profileTitleContainer}>
        <View style={styles.profileTitle}>
          <Title text={"펫 정보"} fontSize={16} />
          <Title
            text={"0"}
            fontSize={16}
            color={Colors.FB3F7E}
            style={{ marginLeft: 12 }}
          />
        </View>
        <Pressable onPress={() => navigation.navigate(ScreenName.PetType)}>
          <Image source={asset.petAdd} />
          <Title
            text={"펫 추가하기"}
            fontWeight="bold"
            style={{ textAlign: "center" }}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default PatManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  profileTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileTitle: {
    width: 238,
    borderWidth: 1,
    borderColor: Colors.F9F9FB,
    borderRadius: 99,
    paddingVertical: 14,
    marginBottom: 43,
    flexDirection: "row",
    justifyContent: "center",

    ...Platform.select({
      ios: {
        shadowColor: Colors.Black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        backgroundColor: Colors.F9F9FB,
        elevation: 4,
        shadowColor: "gray",
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
    }),
  },
});
