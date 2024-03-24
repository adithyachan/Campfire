import React from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
} from "react-native";
import { Avatar, AvatarImage, Box, FlatList, HStack, VStack, Text } from "@gluestack-ui/themed";

const Item = ({ title, user }: { title: string, user: boolean }) => { 
    return user ? 
    ( 
        <>
        </>
    ) 
    : ( 
    <Box
            borderBottomWidth="$1"
            borderColor="$trueGray800"
            $dark-borderColor="$trueGray100"
            py="$2"
            justifyContent="space-between"
        >
            <HStack>        
            <Avatar size="md">
                <AvatarImage   source={{
                        uri: "https://source.unsplash.com/f9bkzNQyylg"
                    }}
                    alt="Image of Campfire" />
            </Avatar> 
            <VStack paddingLeft={10}>
                <Text
                color="$coolGray800"
                fontWeight="$bold"
                $dark-color="$warmGray100"
                >
                    {title}
                {/* {item.fullName} */ }
                </Text>
                <Text color="$coolGray600" $dark-color="$warmGray200">
                Bruh 2
                {/* {item.recentText} */}
                </Text>
            </VStack>
            <Text
                fontSize="$xs"
                color="$coolGray800"
                $dark-color="$warmGray100"
            >
                {/* {item.timeStamp} */}
            </Text>
            </HStack>
        </Box>
    ); 
}; 

export default function SearchList ({ searchPhrase, setClicked, data }: { searchPhrase: string, setClicked: (clicked: boolean) => void, data: any }) {
    const renderItem = ({ item }: { item: any }) => {
            // when no input, show all
            if (searchPhrase === "") {
                return <Item title={item.title} user={false}  />;
            }
            // filter of the title
            if (item.title.toUpperCase().includes(searchPhrase.toUpperCase().trim().replace(/\s/g, ""))) {
                return <Item title={item.title} user={false} />;
            }
        };
  return (
    <SafeAreaView style={styles.list__container}>
            <FlatList
                data={data} 
                renderItem={({ item }) => renderItem({ item }) || null} 
                keyExtractor={(item : any) => item.title} 
            />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    list__container: {
        margin: 10,
        height: "85%",
        width: "100%",
      },
      item: {
        margin: 30,
        borderBottomWidth: 2,
        borderBottomColor: "lightgrey"
      },
      title: {  
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
        fontStyle: "italic",
      },
});