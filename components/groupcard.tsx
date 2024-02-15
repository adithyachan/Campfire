
import { Pressable, TouchableOpacity, View } from "react-native";
import { Card, Heading, Image, Text, Button } from "@gluestack-ui/themed";
import { Link } from "expo-router";


export default function GroupCard() {

        return (
            <Card size="md" variant="elevated" w="$full" >

                <Heading mb="$1" size="md">
                    Group Name
                </Heading>
                <Text size="sm">Group Bio</Text>

            </Card>
        );
    
}

