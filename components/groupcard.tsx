
import { TouchableOpacity, View } from "react-native";
import { Card, Heading, Image, Text, Button } from "@gluestack-ui/themed";


export default function GroupCard() {

        return (
            <TouchableOpacity onPress={() => {alert("Hello")}}>
            <Card size="md" variant="elevated" w="$full" >

                <Heading mb="$1" size="md">
                    Group Name
                </Heading>
                <Text size="sm">Group Bio</Text>

            </Card>
            </TouchableOpacity>
        );
    
}

