import { View } from "react-native";
import {ScrollView, VStack, Center,  Heading, Button, ButtonIcon, AddIcon, Modal,
	ModalBackdrop, ButtonText, ModalFooter, ModalContent, ModalHeader, ModalCloseButton,
	Icon, ModalBody, CloseIcon, FormControl, AlertCircleIcon, FormControlError, FormControlErrorIcon, 
	FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText, 
	Input, InputField, HStack, Select, ChevronDownIcon, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger} from "@gluestack-ui/themed";
import { supabase } from "~/utils/supabase";
import GroupCard from "~/components/groupcard";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams, useNavigation  } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GroupsScreen() {
		const [showCreate, setShowCreate] = useState(false)
		const [showJoin, setShowJoin] = useState(false)
		const [groupName, setGroupName] = useState('')
		const [groupBio, setGroupBio] = useState('')
		const [groupCode, setGroupCode] = useState('')
		const [groupData, setGroupData] = useState<{ group_id: string; name: string; bio: string; }[]>([]);

		useEffect(() => {
			const getInitialGroupData = async () => {
				try {
					const userDataString = await AsyncStorage.getItem('userData')
					if (!userDataString) {
						console.log("Could not retrieve")
						return;
					}
					const userData = JSON.parse(userDataString)
					console.log(userData.session.user.id)
					const userId = (userData.session.user.id);
					const { data, error } = await supabase
					.from('group_users')
					.select('*')
					.eq('profile_id', userId);
					
					console.log("DATA: ", data, error)
	
					if (!error) {
						const groupIds = data.map((group: { group_id: any; }) => group.group_id);
						const { data: groupsData, error: groupsError } = await supabase
							.from('groups')
							.select('*')
							.in('group_id', groupIds);
							setGroupData(groupsData as { group_id: string, name: string, bio: string }[]);
							console.log("GROUPDATA: ", groupsData, groupsError)
						if (!groupsError) {
							console.log('Groups:', groupsData);
						} else {
							console.error('Error fetching groups:', groupsError.message);
						}
					}	
				} catch (error) {
					console.log(error)
				}

			}
			if (groupData.length == 0) {
				getInitialGroupData()
			}
			// Further processing of groups if needed
		}, [groupData]);
		  

		const createGroup = async () => {
			console.log("Creating Group")
			try {
				const userDataString = await AsyncStorage.getItem('userData')
				if (!userDataString) {
					console.log("Could not retrieve")
					return;
				}
				const userData = JSON.parse(userDataString)
				console.log(userData.session.user.id)
				const userId = (userData.session.user.id);
				const { data, error } = await supabase.rpc('insert_groups', {group_name: groupName, group_bio: groupBio, user_id: userId})
				console.log(data, error)
				if (!error) {
					const groupIds = data.map((group: { group_id: any; }) => group.group_id);
					const { data: groupsData, error: groupsError } = await supabase
						.from('groups')
						.select('*')
						.in('group_id', groupIds);
					setGroupData(groupsData as { group_id: string, name: string, bio: string }[]);
					if (!groupsError) {
						console.log('Groups:', groupsData);
						// Further processing of groupsData if needed
					} else {
						console.error('Error fetching groups:', groupsError.message);
					}
				} else {
					console.error('Error calling insert_groups RPC:', error.message);
				}
				setShowCreate(false)
			} catch (error) {

			}
			setGroupName("")
			setGroupBio("")
		}
		

		const joinGroup = async () => {
			router.push({
				pathname: "/group/[id]",
				params: {id: groupName, bio: groupBio}
			})
			setGroupName("")
			setGroupBio("")
		}

        return (
			<View className={styles.container}>
			<ScrollView w="$full" h="$full">
				<Center mt="$3" mb="$4" >
					<VStack flex={1} w="$full" h="$full" space="md" p="$2">
					
					{groupData.map(group => (
          				<GroupCard key={group.group_id} name={group.name} bio={group.bio} />
        			))}
					
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
				size="md"
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
							<FormControl size="md" isRequired={true} >
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
							<FormControl isRequired={true}>
							<FormControlLabel>
								<FormControlLabelText>Group Bio</FormControlLabelText>
							</FormControlLabel>
							<Input >
								<InputField
									type="text"
									placeholder="Campfire"
									value={groupBio}
									onChangeText={text => setGroupBio(text)}
								/>
								</Input>
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
