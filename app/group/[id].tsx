
import { View } from "react-native";
import { Button, ButtonIcon, ShareIcon, Text } from "@gluestack-ui/themed";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";

export default function GroupScreen() {
    const navigation = useNavigation();
    const items = useLocalSearchParams()
    console.log(items)

    useEffect(() => {
        navigation.setOptions({ 
            headerTitle: items.id,
            headerRight: () => (
                <Button variant="link">
                    <ButtonIcon as={ShareIcon} />
                </Button>
            )
        });
    },[navigation, items])

    return ( 
        <View className={styles.container}>
            <Text>
                Group Name: {items.id}
            </Text>
            <Text>
                Group Bio: {items.bio}
            </Text>
        </View>
    );
}


const styles = {
    container: `items-center flex-1 justify-center`,
    separator: `h-[1px] my-7 w-4/5 bg-gray-200`,
    title: `text-xl font-bold`
};