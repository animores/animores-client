import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParams } from "../../types/RootStackParams";
import JoinScreen from "../screens/auth/JoinScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import { ScreenName } from "../statics/constants/ScreenName";
import BottomTabStackNavigator from "./BottomTabStackNavigator";

const RootStack = createNativeStackNavigator<RootStackParams>();

const GuestStackNavigation = () => {
  return (
    <SafeAreaView
      style={styles.container}
      edges={["left", "right", "bottom", "top"]}
    >
      <RootStack.Navigator>
		<RootStack.Screen
          name={ScreenName.BottomTab}
          component={BottomTabStackNavigator}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name={ScreenName.Login}
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name={ScreenName.Join}
          component={JoinScreen}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </SafeAreaView>
  );
};

export default GuestStackNavigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
