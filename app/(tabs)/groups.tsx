
import { View } from "react-native";
import EditScreenInfo from "../../components/edit-screen-info";
import {Modal, Center, ButtonText, 
	ModalBackdrop, ModalContent, ModalHeader, Heading, ModalCloseButton, Icon, CloseIcon,
	ModalBody, ModalFooter, Text, Button} from "@gluestack-ui/themed";
import { useState, useEffect } from "react";
import { useNavigation, useNavigationContainerRef } from "expo-router";
import { useNavigatorContext } from "expo-router/build/views/Navigator";
import { supabase } from "~/utils/supabase";

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
				<Text className={styles.title}></Text>
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
