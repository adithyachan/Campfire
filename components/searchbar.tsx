import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, View, Keyboard, Animated, Button, TouchableOpacity, Pressable } from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";
import { HStack, VStack, ButtonText} from "@gluestack-ui/themed";


export default function SearchBar ({ clicked, searchPhrase, activeButton, setSearchPhrase, setClicked, setActiveButton }: { clicked: boolean, searchPhrase: string, activeButton: string, setSearchPhrase: (phrase: string) => void, setClicked: (clicked: boolean) => void, setActiveButton: (phrase: string) => void }) {
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
      <View style={styles.row}>
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
          <View >
            <Button
              title="Cancel"
              onPress={() => {
                Keyboard.dismiss();
                setClicked(false);
                setSearchPhrase("");
              }}
            >
            </Button>
          </View>
        )}
      </View>
     
      <View className="flex flex-row w-full">
      <Pressable         
                onPress={() => setActiveButton('users')}
          className={activeButton === 'users' ? 
          "flex-1 p-2 mx-2 border-b-2 border-black" 
          : "flex-1 p-2 border-b-2 mx-2 border-gray-500"} 
      >
      <Text className={activeButton === 'users' ? 
        "text-center text-black text-lg" 
        : "text-center text-gray-500 text-lg"} >Users</Text>
      </Pressable>
      <Pressable 
              onPress={() => setActiveButton('groups')}
        className={activeButton === 'groups' ? 
        "flex-1 p-2 mx-2 border-b-2 border-black" 
        : "flex-1 p-2 border-b-2 mx-2 border-gray-500"} 
      >       
      <Text className={activeButton === 'groups' ? 
        "text-center text-black text-lg" 
        : "text-center text-gray-500 text-lg"} >Groups</Text>
      </Pressable>
    </View>
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
    flexDirection: "column",
    width: "95%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  searchBar__unclicked: {
    marginLeft: 10,
    padding: 7,
    flexDirection: "row",
    width: "85%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
  },
  searchBar__clicked: {
    padding: 7,
    flexDirection: "row",
    width: "70%",
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inactiveText: {
    color: 'white',
    textDecorationLine: 'none',
  },
  activeText: {
    color: 'white',
    textDecorationLine: 'none',
  },
  cancelButton: {
    marginLeft: 10,
  },
});