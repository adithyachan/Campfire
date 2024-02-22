
import { Pressable, TouchableOpacity, View } from "react-native";
import { Card, Heading, Image, Text, Button } from "@gluestack-ui/themed";
import { Link, router } from "expo-router";


export default function GroupCard(props: {name: string, bio: string, id: string}) {
        return (
            <Pressable onPress={() => {
                router.push({
                    pathname: "/group/[id]",
                    params: {id: props.id, name: props.name, bio: props.bio}
                })
            }}>
            <Card size="md" variant="elevated" w="$full" >
                <Heading mb="$1" size="md">
                    {props.name}
                </Heading>
                <Text size="sm">{props.bio}</Text>
            </Card>         
            </Pressable>
        );
    
}
 
