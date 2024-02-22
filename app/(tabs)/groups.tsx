import { View } from "react-native";
import {Alert, ScrollView, VStack, Center,  Heading, Button, ButtonIcon, AddIcon, Modal,
	ModalBackdrop, ButtonText, ModalFooter, ModalContent, ModalHeader, ModalCloseButton,
	Icon, ModalBody, CloseIcon, FormControl, AlertCircleIcon, FormControlError, FormControlErrorIcon, 
	FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText, 
	Input, InputField, HStack, Fab, FabIcon, Box, Toast, ToastDescription, ToastTitle, useToast} from "@gluestack-ui/themed";
import { supabase } from "~/utils/supabase";
import GroupCard from "~/components/groupcard";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from 'expo-crypto';

export default function GroupsScreen() {
		const [showCreate, setShowCreate] = useState(false)
		const [showJoin, setShowJoin] = useState(false)
		const [groupName, setGroupName] = useState('')
		const [groupBio, setGroupBio] = useState('')
		const [groupCode, setGroupCode] = useState('')
		const [groupData, setGroupData] = useState<{ group_id: string; name: string; bio: string; }[]>([]);
		const [groupNameError, setGroupNameError] = useState<string | undefined>('');
		const [groupCodeError, setGroupCodeError] = useState<string | undefined>('');
		const [showGNE, setGNE] = useState(false)
		const [showGCE, setGCE] = useState(false)
		const [showModal, setShowModal] = useState(false)


		useEffect(() => {

			const getInitialGroupData = async () => {
				try {
					// Get user data from react async storage
					const userDataString = await AsyncStorage.getItem('userData')
					if (!userDataString) {
						console.log("Could not retrieve")
						return;
					}
					const userData = JSON.parse(userDataString)
					const userId = (userData.session.user.id);

					// query supabase for all the groups the user is a part of
					const { data, error } = await supabase
					.from('group_users')
					.select('*')
					.eq('profile_id', userId);

					// if query is successfull set the group cards to the groups
					if (!error && data.length != 0) {
						const groupIds = data.map((group: { group_id: any }) => group.group_id);
						const { data: groupsData, error: groupsError } = await supabase
							.from('groups')
							.select('*')
							.in('group_id', groupIds);
							setGroupData(groupsData as { group_id: string, name: string, bio: string }[]);
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
			getInitialGroupData()
		}, []);
		  

		const createGroup = async () => {
			try {
				// Get user data from react async storage
				const userDataString = await AsyncStorage.getItem('userData')
				if (!userDataString) {
					console.log("Could not retrieve")
					return;
				}
				const userData = JSON.parse(userDataString)
				console.log(userData.session.user.id)
				const userId = (userData.session.user.id);

				// Create a group code
				const groupCode = await Crypto.digestStringAsync(
					Crypto.CryptoDigestAlgorithm.SHA256,
					groupName,
					{ encoding: Crypto.CryptoEncoding.BASE64 }
				);

				// Insert a group using RPC
				const { data, error } = await supabase.rpc('insert_groups', {group_name: groupName, group_bio: groupBio, group_code: groupCode, user_id: userId})
				if (!error) {
					const groupIds = data.map((group: { group_id: any; }) => group.group_id);
					const { data: groupsData, error: groupsError } = await supabase
						.from('groups')
						.select('*')
						.in('group_id', groupIds);
					setGroupData(groupsData as { group_id: string, name: string, bio: string }[]);
					if (!groupsError) {
						console.log('Groups:', groupsData);
					} else {
						console.error('Error fetching groups:', groupsError.message);
					}
					setShowCreate(false)
					setGroupName("")
					setGroupBio("")
				} else {
					if (error.code == '23505') {
						setGroupNameError('This group name already exists!')
						setGNE(true)
					}
				}
			} catch (error) {
				console.log(error)
			}
		}
		

		const joinGroup = async () => {
			try {
				const userDataString = await AsyncStorage.getItem('userData');
				if (!userDataString) {
				  console.log("Could not retrieve user data");
				  return;
				}
				
				const userData = JSON.parse(userDataString);
				const userId = userData?.session?.user?.id;
			  
				if (!userId) {
				  console.log("User ID not found in user data");
				  return;
				}
			  
				const { data: groups, error } = await supabase
				  .from('groups')
				  .select('*')
				  .eq('code', groupCode);
				console.log(groups)
				if (groups?.length == 0) {
					setGCE(true)
					setGroupCodeError("This group does not exist!")
				} else {
					console.log('Code exists in the groups table.');
					const groupId = groups![0].group_id; 
					console.log(groupId)
					const { data: insertedData, error: insertError } = await supabase
						.from('group_users')
						.insert([{ group_id: groupId, profile_id: userId }]);
					console.log(insertedData, insertError)
					const { data, error } = await supabase
					.from('group_users')
					.select('*')
					.eq('profile_id', userId);
					if (data) {
						const groupIds = data.map((group: { group_id: any; }) => group.group_id);
						const { data: groupsData, error: groupsError } = await supabase
							.from('groups')
							.select('*')
							.in('group_id', groupIds);
						if (groupsError) {
							console.log("Failed to retrieve gorups")
						}
						setGroupData(groupsData as { group_id: string, name: string, bio: string }[]);
					}
					setShowJoin(false)
					setGroupName("")
					setGroupBio("")
					setGroupCode("")
					router.push({
						pathname: "/group/[id]",
						params: { id: groupId, name: groups![0].name, bio: groups![0].bio} 
					});
				}

			  } catch (error) {

			  }
			  
		}

        return (
			<View className={styles.container}>
			<ScrollView w="$full" h="$full">
				<Center mt="$3" mb="$4" >
					<VStack flex={1} w="$full" h="$full" space="md" p="$2">
					
					{groupData.map(group => (
          				<GroupCard key={group.group_id} name={group.name} bio={group.bio} id={group.group_id} />
        			))}
					
					</VStack>

				</Center>
			</ScrollView>
					
			<Fab size="lg" placement="bottom right" onPress={() => {setShowModal(true)}}>
				<FabIcon as={AddIcon} size="sm" />
			</Fab>
			<Modal
				isOpen={showCreate}
				onClose={() => {
					setShowCreate(false)
					setGNE(false)
					setGroupName("")
					setGroupBio("")
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
							<FormControl size="md" isRequired={true} isInvalid={showGNE}>
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
									{groupNameError}
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
								value={groupBio}
								onChangeText={text => setGroupBio(text)}
								maxLength={300}
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
								setGNE(false)
								setGroupName("")
								setGroupBio("")
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
					setGCE(false)
					setGroupCode("")
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
							<FormControl size="md" isDisabled={false} isInvalid={showGCE} >
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
								<FormControlError>
								<FormControlErrorIcon
									as={AlertCircleIcon}
								/>
								<FormControlErrorText>
									{groupCodeError}
								</FormControlErrorText>
								</FormControlError>
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
								setGCE(false)
								setGroupCode("")
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


				<Modal
				isOpen={showModal}
				onClose={() => {
					setShowModal(false)
				}}
					>
						<ModalBackdrop />
						<ModalContent>
						<ModalHeader>
							<Heading size="lg">
								Group Settings
							</Heading>
							<ModalCloseButton>
							<Icon as={CloseIcon} />
							</ModalCloseButton>
						</ModalHeader>
						<ModalBody>
						<HStack space="md" reversed={false}>
						<Button  bgColor="$amber100" variant="solid" size="md" onPress={() => {setShowModal(false); setShowCreate(true);}}> 
						<ButtonText color="$amber700">
								Create a group
							</ButtonText>
						</Button>
						<Button bgColor="$amber100" variant="solid" size="md"  onPress={() => {setShowModal(false); setShowJoin(true);}}> 
							<ButtonText color="$amber700">
								Join a group
							</ButtonText>
						</Button>
						</HStack>

						</ModalBody>
						<ModalFooter>
							<Button
							variant="outline"
							size="sm"
							action="secondary"
							mr="$3"
							onPress={() => {
								setShowModal(false)
							}}
							>
							<ButtonText>Cancel</ButtonText>
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
