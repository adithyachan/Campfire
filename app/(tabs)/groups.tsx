
import { View } from "react-native";
import {ScrollView, VStack, Center,  Heading, Textarea, TextareaInput, Button, ButtonIcon, AddIcon, Modal,
	ModalBackdrop, ButtonText, ModalFooter, ModalContent, ModalHeader, ModalCloseButton,
	Icon, ModalBody, CloseIcon, FormControl, AlertCircleIcon, FormControlError, FormControlErrorIcon, 
	FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText, Input, InputField, HStack, Text} from "@gluestack-ui/themed";
import { supabase } from "~/utils/supabase";
import GroupCard from "~/components/groupcard";
import { useState } from "react";
import { router } from "expo-router";



export default function GroupsScreen() {
		const [showCreate, setShowCreate] = useState(false)
		const [showJoin, setShowJoin] = useState(false)
		const [groupName, setGroupName] = useState("")
		const [groupBio, setGroupBio] = useState("")
		const [groupCode, setGroupCode] = useState("")

		
		const name = "Group 1"
		const bio = "This is a test group"


		async function createGroup() {
			console.log("Creating Group")
			/*
			console.log("Creating Group")
			const { data, error } = await supabase
			.from('groups')
			.insert([
			  { bio: 'This is a test group creation' },
			])
			.select()
			console.log(data, error)
			*/
			router.push({
				pathname: "/group/[id]",
				params: {id: groupName, bio: groupBio}
			})
			setGroupName("")
			setGroupBio("")
		}

		async function joinGroup() {
			console.log("Creating Group")
			/*
			console.log("Creating Group")
			const { data, error } = await supabase
			.from('groups')
			.insert([
			  { bio: 'This is a test group creation' },
			])
			.select()
			console.log(data, error)
			*/
			router.push({
				pathname: "/group/[id]",
				params: {id: groupName, bio: groupBio}
			})
			setGroupName("")
			setGroupBio("")
		}

		console.log(showCreate)
        return (
			<View className={styles.container}>
			<ScrollView w="$full" h="$full">
				<Center mt="$3" mb="$4" >
					<VStack flex={1} w="$full" h="$full" space="md" p="$2">
						<GroupCard name={name} bio={bio}/>
					</VStack>

				</Center>
			</ScrollView>
			<HStack>
			<Button onPress={() => setShowCreate(true)}> 
				<ButtonIcon as={AddIcon}>

				</ButtonIcon>
			</Button>
			<Button onPress={() => setShowJoin(true)}> 
				<ButtonText color="$textLight0">
					Join
				</ButtonText>
			</Button>
			</HStack>

			<Modal
				isOpen={showCreate}
				onClose={() => {
				setShowCreate(false)
				}}
					>
						<ModalBackdrop />
						<ModalContent>
						<ModalHeader>
							<Heading size="lg">Create a new group</Heading>
							<ModalCloseButton>
							<Icon as={CloseIcon} />
							</ModalCloseButton>
						</ModalHeader>
						<ModalBody>
							<VStack>
							<FormControl size="md" isDisabled={false} isInvalid={false} isReadOnly={false} isRequired={false} >
								<FormControlLabel mb='$1'>
								<FormControlLabelText>Group Name</FormControlLabelText>
								</FormControlLabel>
								<Input>
								<InputField
									type="text"
									placeholder="Campfire"
									value={groupName}
									onChangeText={text => setGroupName(text)}
								/>
								</Input>
								<FormControlHelper>
								<FormControlHelperText>
									Must be at least 6 characters.
								</FormControlHelperText>
								</FormControlHelper>
								<FormControlError>
								<FormControlErrorIcon
									as={AlertCircleIcon}
								/>
								<FormControlErrorText>
									At least 6 characters are required.
								</FormControlErrorText>
								</FormControlError>
							</FormControl>
							<FormControl>
							<FormControlLabel>
								<FormControlLabelText>Group Bio</FormControlLabelText>
							</FormControlLabel>
							<Textarea>
								<TextareaInput 								
									value={groupBio}
									onChangeText={text => setGroupBio(text)}/>
							</Textarea>
							<FormControlHelper>
								<FormControlHelperText>Type your bio above. Must be under 300 characters.</FormControlHelperText>
							</FormControlHelper>
							</FormControl>
							</VStack>
						</ModalBody>
						<ModalFooter>
							<Button
							variant="outline"
							size="sm"
							action="secondary"
							mr="$3"
							onPress={() => {
								setShowCreate(false)
							}}
							>
							<ButtonText>Cancel</ButtonText>
							</Button>
							<Button
							size="sm"
							action="positive"
							borderWidth="$0"
							onPress={() => {
								createGroup()
							}}
							>
							<ButtonText>Create</ButtonText>
							</Button>
						</ModalFooter>
						</ModalContent>
				</Modal>
				
				 
				<Modal
				isOpen={showJoin}
				onClose={() => {
				setShowJoin(false)
				}}
					>
						<ModalBackdrop />
						<ModalContent>
						<ModalHeader>
							<Heading size="lg">Join a group</Heading>
							<ModalCloseButton>
							<Icon as={CloseIcon} />
							</ModalCloseButton>
						</ModalHeader>
						<ModalBody>
							<VStack>
							<FormControl size="md" isDisabled={false} isInvalid={false} isReadOnly={false} isRequired={false} >
								<FormControlLabel mb='$1'>
								<FormControlLabelText>Group Code</FormControlLabelText>
								</FormControlLabel>
								<Input>
								<InputField
									type="text"
									placeholder="Campfire"
									value={groupCode}
									onChangeText={text => setGroupCode(text)}
								/>
								</Input>
							</FormControl>
							</VStack>
						</ModalBody>
						<ModalFooter>
							<Button
							variant="outline"
							size="sm"
							action="secondary"
							mr="$3"
							onPress={() => {
								setShowJoin(false)
							}}
							>
							<ButtonText>Cancel</ButtonText>
							</Button>

							<Button
							size="sm"
							action="positive"
							borderWidth="$0"
							onPress={() => {
								joinGroup()
							}}
							>
							<ButtonText >Join</ButtonText>
							</Button>
						</ModalFooter>
						</ModalContent>
				</Modal>

			</View>
		);
    
}

    const styles = {
		container: `items-center flex-1 justify-center`,
		separator: `h-[1px] my-7 w-4/5 bg-gray-200`,
		title: `text-xl font-bold text-center`
	};
