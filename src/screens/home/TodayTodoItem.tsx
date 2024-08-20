import React from "react";
import { ImageBackground, Image, Pressable, StyleSheet, View, Text } from "react-native";
import { Colors } from "../../styles/Colors";

interface ITodayTodoItem {
    item: IItemslider;
    index: number;
}

const TodayTodoItem = ({item, index}: ITodayTodoItem) => {
  return (
    <View style={styles.todayTodo}>
      <View style={{ flexDirection: "row", alignItems: "center"}}>
        <View style={{ flexDirection: "row", alignItems: "baseline", width: "45%" }}>
          <Text style={{ fontSize: 15 }}>
            {item.at}
          </Text>
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            {item.time}
          </Text>
        </View>
        <Text style={{ fontSize: 20, marginLeft: 20, width: "45%", marginLeft: "10%" }}>
          {item.title}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center"}}>
        <View style={{ flexDirection: "row", alignItems: "baseline", width: "45%" }}>
        { item.pet.map((pet) => (
          <Text style={[styles.petTag, { backgroundColor: "#E1F0FF", color: "#80A5F1", marginRight: 5 }]}>
            {pet}
          </Text>
        ))}
        </View>
        <Text numberOfLines={2} ellipsizeMode="end" style={{ width: "45%", marginLeft: "10%", color: "#AEAEAE"}}>
          {item.discription}
        </Text>
      </View>
    </View>
  )
}

export default TodayTodoItem;

const styles = StyleSheet.create({
  todayTodo: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  petTag: {
    fontSize: 15,
    paddingVertical: 4, 
    paddingHorizontal: 10, 
    borderRadius: 3, 
    overflow: "hidden",
  },
})