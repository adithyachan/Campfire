
import { Text, View } from "react-native";

import { useLocalSearchParams } from "expo-router";

export default function GroupScreen() {

        

        const items = useLocalSearchParams()
        console.log(items)
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