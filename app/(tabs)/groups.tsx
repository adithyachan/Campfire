
import { View } from "react-native";
import EditScreenInfo from "../../components/edit-screen-info";
import {ScrollView, VStack, Center,  Heading, Text, Button, ButtonIcon, AddIcon} from "@gluestack-ui/themed";
import { supabase } from "~/utils/supabase";
import GroupCard from "~/components/groupcard";

async function createGroup() {
	console.log("Creating Group")
	const { data, error } = await supabase
	.from('groups')
	.insert([
	  { bio: 'This is a test group creation' },
	])
	.select()
	console.log(data, error)
  }

export default function GroupsScreen() {

        return (
			<View className={styles.container}>
			<ScrollView w="$full" h="$full">
				<Center mt="$3" mb="$4" >
					<VStack flex={1} w="$full" h="$full" space="md" p="$2">
						<GroupCard/>
						<GroupCard/>
						<GroupCard/>
						<Button > 
							<ButtonIcon as={AddIcon}>

							</ButtonIcon>
						</Button>
					</VStack>
				</Center>
			</ScrollView>
			</View>
		);
    
}

    const styles = {
		container: `items-center flex-1 justify-center`,
		separator: `h-[1px] my-7 w-4/5 bg-gray-200`,
		title: `text-xl font-bold text-center`
	};
