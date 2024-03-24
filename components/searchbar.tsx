import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, View, Keyboard, Button, Animated, TouchableOpacity } from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";


export default function SearchBar ({ clicked, searchPhrase, setSearchPhrase, setClicked }: { clicked: boolean, searchPhrase: string, setSearchPhrase: (phrase: string) => void, setClicked: (clicked: boolean) => void }) {
  const [widthAnim] = useState(new Animated.Value(clicked ? 80 : 95));
  const [opacityAnim] = useState(new Animated.Value(0));



  useEffect(() => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: clicked ? 80 : 95,
        duration: clicked ? 150 : 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: searchPhrase !== "" ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [clicked, searchPhrase]);

  return (
    <View style={styles.container}>
      <Animated.View style={[clicked ? styles.searchBar__clicked : styles.searchBar__unclicked, { width: widthAnim.interpolate({inputRange: [0, 100], outputRange: ["0%", "100%"]}) }]}>
        <Feather name="search" size={20} color="black" style={{ marginLeft: 1 }} />

        <TextInput
          style={styles.input}
          placeholder="Search"
          value={searchPhrase}
          onChangeText={setSearchPhrase}
          onFocus={() => {
            setClicked(true);
          }}
        />

        {clicked && (
        <Animated.View style={{ opacity: opacityAnim }}>
            <TouchableOpacity activeOpacity={1} onPress={() => {
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => setSearchPhrase(""));
            }}>
            <Entypo
                name="cross"
                size={20}
                color="black"
                style={{ padding: 1 }}
            />
            </TouchableOpacity>
        </Animated.View>
        )}

      </Animated.View>

      {clicked && (
        <View>
          <Button
            title="Cancel"
            onPress={() => {
              Keyboard.dismiss();
              setClicked(false);
            }}
          ></Button>
        </View>
      )}
    </View>
  );
};

// styles
const styles = StyleSheet.create({
  container: {
    margin: 5,
    paddingLeft: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    width: "95%",
  },
  searchBar__unclicked: {
    padding: 7,
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
  },
  searchBar__clicked: {
    padding: 7,
    flexDirection: "row",
    width: "80%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  input: {
    fontSize: 20,
    marginLeft: 10,
    width: "90%",
  },
});