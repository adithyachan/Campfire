import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, StatusBar } from "react-native";
import SearchBar from "~/components/searchbar";
import { Text } from "@gluestack-ui/themed";
import SearchList from "~/components/searchview";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "~/utils/supabase";

export default function ExploreFeedScreen() {

	const [clicked, setClicked] = useState(false);
	const [searchPhrase, setSearchPhrase] = useState('');

	useEffect(() => {
		const getInitialUserData = async () => {
			try {
				const { data: profilesData, error: profilesError } = await supabase
					.from('profiles')
					.select('first_name, last_name, bio, username');
				if (!profilesError) {
					console.log('Profiles:', profilesData);
				} else {
					console.error('Error fetching profiles:', profilesError.message);
				}
			} catch (error) {
				console.log(error)
			}
		}
		getInitialUserData();
	}, []);

	const DATA = [ 
		{ 
		id: "1", 
		title: "Data Structures", 
		},
		
		{ 
		id: "2", 
		title: "STL", 
		}, 
		{ 
		id: "3", 
		title: "C++", 
		}, 
		{ 
		id: "4", 
		title: "Java", 
		}, 
		{ 
		id: "5", 
		title: "Python", 
		}, 
		{ 
		id: "6", 
		title: "CP", 
		}, 
		{ 
		id: "7", 
		title: "ReactJs", 
		}, 
		{ 
		id: "8", 
		title: "NodeJs", 
		}, 
		{ 
		id: "9", 
		title: "MongoDb", 
		}, 
		{ 
		id: "10", 
		title: "ExpressJs", 
		}, 
		{ 
		id: "11", 
		title: "PHP", 
		}, 
		{ 
		id: "12", 
		title: "MySql", 
		}, 
		{ 
			id: "13", 
			title: "brhu", 
		}, 
		{ 
			id: "14", 
			title: "nruh1", 
		}, 
		{ 
			id: "15", 
			title: "adf", 
		}, 
		{ 
			id: "16", 
			title: "asdfa", 
		}, 
		{ 
			id: "17", 
			title: "asdfasf", 
		}, 
		{ 
			id: "18", 
			title: "asd", 
		}, 
		
	]; 
    

return (
	<SafeAreaView style={styles.root}>
		
		<SearchBar
			clicked={clicked}
			searchPhrase={searchPhrase}
			setSearchPhrase={setSearchPhrase}
			setClicked={setClicked}
		/>
		<SearchList
			searchPhrase={searchPhrase}
			setClicked={setClicked}
			data={DATA}
		/>
	</SafeAreaView>
);
}

const styles = StyleSheet.create({
	root: {
		flex:1
	  },
});