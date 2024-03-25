import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Pressable,
} from "react-native";
import { Avatar, AvatarImage, Box, FlatList, HStack, VStack, Text } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { supabase } from "~/utils/supabase";

const Item = ({ id, first_name, last_name, username, bio, avatar_url, user }: 
    { id: string, first_name: string, last_name: string, username: string, bio: string, avatar_url: string, user: boolean }) => { 
    return user ? 
    ( 
        <Pressable onPress={async () => {
            console.log("USER ID", id)
            const {data: {user}}  = await supabase.auth.getUser();
            if (user == null) {
              console.log("Could not retrieve")
              return;
            }
            const userId = user.id;
            if (id === userId) {
                router.push({
                    pathname: "/account"
                })
                return;
            } else {
                router.push({
                    pathname: "/account/[id]",
                    params: {id: id}
                })
                return;
            }
        }}>
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
                    uri: avatar_url
                }}
                alt="Image of Campfire" />
        </Avatar> 
        <VStack paddingLeft={10}>
            <Text
            color="$coolGray800"
            fontWeight="$bold"
            $dark-color="$warmGray100"
            >
                {username}
            </Text>
            <Text color="$coolGray600" $dark-color="$warmGray200">
            {first_name} {last_name}
            </Text>
        </VStack>
        <Text
            fontSize="$xs"
            color="$coolGray800"
            $dark-color="$warmGray100"
        >
        </Text>
        </HStack>
    </Box>
    </Pressable>
    ) 
    : ( 
        <Pressable onPress={() => {
            const name = username
            console.log("GROUP ID", id, name, bio)
            router.push({
                pathname: "/group/[id]",
                params: {id: id, name: name, bio: bio}
            })
        }}>
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
                        uri: avatar_url
                    }}
                    alt="Image of Campfire" />
            </Avatar> 
            <VStack paddingLeft={10}>
                <Text
                color="$coolGray800"
                fontWeight="$bold"
                $dark-color="$warmGray100"
                >
                    {username}
                </Text>
                <Text color="$coolGray600" $dark-color="$warmGray200">
                {bio}
                </Text>
            </VStack>
            <Text
                fontSize="$xs"
                color="$coolGray800"
                $dark-color="$warmGray100"
            >
            </Text>
            </HStack>
        </Box>
        </Pressable>
    ); 
}; 

export default function SearchList ({ searchPhrase, setClicked, userData, groupData }: { searchPhrase: string, setClicked: (clicked: boolean) => void, userData: any, groupData:any }) {

    const renderItem = ({ item }: { item: any }) => {
            // when no input, show all
            if (searchPhrase === "") {
                return null;
            }
            // filter of the title
            else if (item.username && item.username.toUpperCase().includes(searchPhrase.toUpperCase().trim().replace(/\s/g, "")) ||
            item.first_name && item.first_name.toUpperCase().includes(searchPhrase.toUpperCase().trim().replace(/\s/g, "")) ||
            item.last_name && item.last_name.toUpperCase().includes(searchPhrase.toUpperCase().trim().replace(/\s/g, ""))) {
                return <Item id={item.user_id} first_name={item.first_name} last_name={item.last_name} username={item.username} 
                bio={item.bio} avatar_url={item.avatar_url} user={item.isUser}  />;
            }
    };

    console.log("USERDATA", userData)
    const mappedUserData = userData.map((item: any) => ({
        ...item,
        isUser: true,
        // add or modify properties here
    }));

    
    const mappedGroupData = groupData.map((item: any) => ({
        user_id: item.group_id,
        first_name: '',
        last_name: '',
        username: item.name,
        bio: item.bio,
        avatar_url: 'default_group_avatar_url', // replace with your default group avatar URL
        isUser: false
    }));

    
    const combinedData = [...mappedGroupData, ...mappedUserData];
    console.log("COMBINED", combinedData)
  return (
    <SafeAreaView style={styles.list__container}>
            <FlatList
                data={combinedData} 
                renderItem={({ item }) => renderItem({ item }) || null} 
                keyExtractor={(item : any) => item.username} 
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