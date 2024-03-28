import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, StatusBar } from "react-native";
import SearchBar from "~/components/searchbar";
import { Divider, HStack, Text, Button } from "@gluestack-ui/themed";
import SearchList from "~/components/searchview";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "~/utils/supabase";

export default function ExploreFeedScreen() {

	const [clicked, setClicked] = useState(false);
	const [searchPhrase, setSearchPhrase] = useState('');
	const [activeButton, setActiveButton] = useState('users');
	const [userData, setUserData] = useState<{ user_id: string, first_name: string, last_name: string, username: string, bio: string, avatar_url: string }[]>([]);
	const [groupData, setGroupData] = useState<{ group_id: string, name: string, bio: string }[]>([]);
	useEffect(() => {
		retrieveData();
	}, []);

	const retrieveData = async () => {
		const {data: {user}}  = await supabase.auth.getUser();
		if (user == null) {
			console.log("Could not retrieve")
			return;
		}
		const userId = user.id;

		const { data: userData, error: userError } = await supabase
			.from('profiles')
			.select('user_id, first_name, last_name, username, bio, avatar_url')
		if (userError) {
			console.log(userError);
		} else {
			console.log(userData);
		}
		setUserData(userData as { user_id: string, first_name: string, last_name: string, username: string, bio: string, avatar_url: string }[]);
		const { data: groupData, error: groupError } = await supabase
		.from('groups')
		.select('group_id, name, bio')
		if (groupError) {
			console.log(groupError);
		} else {
			console.log(groupData);
		}
		setGroupData(groupData as { group_id: string, name: string, bio: string }[]);		
	}


return (
	<SafeAreaView style={styles.root}>
		
		<SearchBar
			clicked={clicked}
			searchPhrase={searchPhrase}
			setSearchPhrase={setSearchPhrase}
			setClicked={setClicked}
			activeButton={activeButton}
			setActiveButton={setActiveButton}
		/>
		<SearchList
			searchPhrase={searchPhrase}
			setClicked={setClicked}
			userData={userData}
			groupData={groupData}
			activeButton={activeButton}
			setActiveButton={setActiveButton}
		/>
	</SafeAreaView>
);
}

const styles = StyleSheet.create({
	root: {
		flex:1
	  },
});