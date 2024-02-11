
import { Text, View } from "react-native";


import EditScreenInfo from "../../components/edit-screen-info";

export default function GroupsScreen() {
    
        return (
			<View className={styles.container}>
				<Text className={styles.title}>You do not have any groups! Create one and invite some friends!</Text>
				<View className={styles.separator} />
				<EditScreenInfo path="app/(tabs)/index.tsx" />
			</View>
		);
    
}


    const styles = {
		container: `items-center flex-1 justify-center`,
		separator: `h-[1px] my-7 w-4/5 bg-gray-200`,
		title: `text-xl font-bold text-center`
	};
