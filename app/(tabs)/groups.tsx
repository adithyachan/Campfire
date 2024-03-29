import { View } from "react-native";
import {Alert, ScrollView, VStack, Center,  Heading, Button, ButtonIcon, AddIcon, Modal,
	ModalBackdrop, ButtonText, ModalFooter, ModalContent, ModalHeader, ModalCloseButton,
	Icon, ModalBody, CloseIcon, FormControl, AlertCircleIcon, FormControlError, FormControlErrorIcon, 
	FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText, Switch,
	Input, InputField, HStack, Fab, FabIcon, Box, Toast, ToastTitle, useToast, GlobeIcon, Menu, MenuItem, MenuItemLabel, SettingsIcon, Divider, ToastDescription} from "@gluestack-ui/themed";
import { supabase } from "~/utils/supabase";
import GroupCard from "~/components/groupcard";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import * as Crypto from 'expo-crypto';
import { UsersRound } from 'lucide-react-native'
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
		const [selected, setSelected] = useState<Selection | null>(null);
		const [isGroupPublic, setIsGroupPublic] = useState(false); // Add this line


		const getInitialGroupData = async () => {
			try {
				// Get user data from react async storage
				// const userDataString = await AsyncStorage.getItem('userData')
				// if (!userDataString) {
				// 	console.log("Could not retrieve")
				// 	return;
				// }
				// const userData = JSON.parse(userDataString)
				// const userId = (userData.session.user.id);
				const {data: {user}}  = await supabase.auth.getUser();
				if (user == null) {
					console.log("Could not retrieve")
					return;
				}
				const userId = user.id;


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

		useFocusEffect(
			React.useCallback(() => {
			  const checkRefreshFlag = async () => {
				const refreshNeeded = await AsyncStorage.getItem('refreshGroups');
				if (refreshNeeded === 'true') {
				  await AsyncStorage.removeItem('refreshGroups');
				  setGroupData([]); 
				  getInitialGroupData();
				}
			  };
		  
			  checkRefreshFlag();
			}, [])
		  );

		useEffect(() => {
			getInitialGroupData()
		}, []);
		  

		const createGroup = async () => {
			console.log("Creating group")
			try {
				const {data: {user}}  = await supabase.auth.getUser();
				if (user == null) {
					console.log("Could not retrieve")
					return;
				}
				const userId = user.id;
				console.log("ID: ", userId)

				// Create a group code
				const groupCode = await Crypto.digestStringAsync(
					Crypto.CryptoDigestAlgorithm.SHA256,
					groupName,
					{ encoding: Crypto.CryptoEncoding.BASE64 }
				);

				console.log("Group Code: ", groupCode)

				// Insert a group using RPC
				const { data, error } = await supabase.rpc('insert_groups', {
					group_name: groupName,
					group_bio: groupBio,
					group_code: groupCode,
					user_id: userId,
					admin: userId,
					public_profile: isGroupPublic
				});
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
					} else {
						console.error('Error fetching groups:', groupsError.message);
					}
					const { data: dataUpdate, error: errorUpdate } = await supabase.rpc('increment_user_group_count', {x: 1, id: userId});

					if (errorUpdate) {
						console.log("Failed to update num_groups:", errorUpdate.message);
					} else {
						console.log("num_groups updated successfully:", dataUpdate);
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

				const {data: {user}}  = await supabase.auth.getUser();
				if (user == null) {
					console.log("Could not retrieve")
					return;
				}
				const userId = user.id;
			
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

					if (groups && groups.length > 0) {
						const group = groups[0];
						if (group.banlist && group.banlist.includes(userId)) {
							setGCE(true);
							setGroupCodeError("You are banned from joining this group.");
							return;
						}
					}

					const groupId = groups![0].group_id; 
					console.log(groupId)
					const { data: insertedData, error: insertError } = await supabase
						.from('group_users')
						.insert([{ group_id: groupId, profile_id: userId }]);
					if (insertError) {
						setGCE(true)
						setGroupCodeError("You are already a part of this group.")
					} else {
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

						const { data: dataUpdate, error: errorUpdate } = await supabase.rpc('increment_user_group_count', {x: 1, id: userId});

						if (errorUpdate) {
							console.log("Failed to update num_groups:", errorUpdate.message);
						} else {
							console.log("num_groups updated successfully:", dataUpdate);
						}
						
						const { data: dU, error: eU } = await supabase.rpc('increment_group_member_count', {x: 1, id: groupId});

						if (eU) {
							console.log("Failed to update num_groups:", eU.message);
						} else {
							console.log("num_groups updated successfully:", dU);
						}

						setShowJoin(false)
						setGroupName("")
						setGroupBio("")
						setGroupCode("")
						router.push({
							pathname: "/group/[id]",
							params: { id: groupId, name: groups![0].name, bio: groups![0].bio, first: 1} 
						});
					}

				
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
		<Menu
      placement="left bottom"
      selectionMode="single"
      closeOnSelect={true}
	  borderRadius={"$xl"}
	  mx={"$2"}

      trigger={({ ...triggerProps }) => {
        return (
		<Fab size="lg" placement="bottom right" {...triggerProps}>
			<FabIcon as={AddIcon} size="sm" />
		</Fab>
        )
      }}
    >
      <MenuItem textValue="Create a group" onPress={() => setShowCreate(true)}>
        <Icon as={AddIcon} size="sm" mr="$2" />
        <MenuItemLabel size="sm">Create a group</MenuItemLabel>
      </MenuItem>
      <MenuItem textValue="Join a private group" onPress={() => setShowJoin(true)}>
        <Icon as={UsersRound} size="sm" mr="$2" />
        <MenuItemLabel size="sm">Join a private group</MenuItemLabel>
      </MenuItem>
    </Menu>
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
							<VStack space="md">
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
								placeholder="For the campers"
								value={groupBio}
								onChangeText={text => setGroupBio(text)}
								maxLength={300}
								/>
								</Input>
							<FormControlHelper>
								<FormControlHelperText>Type your bio above. Must be under 300 characters.</FormControlHelperText>
							</FormControlHelper>
							</FormControl>
							<FormControl>
								<HStack space="md">
									<Switch value={isGroupPublic} onValueChange={value => setIsGroupPublic(value)} />
									<FormControlHelperText>Public Group</FormControlHelperText>
								</HStack>
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
							<Heading size="lg">Join a private group	</Heading>
							<ModalCloseButton>
							<Icon as={CloseIcon} />
							</ModalCloseButton>
						</ModalHeader>
						<ModalBody>
							<VStack>
							<FormControl size="md" isDisabled={false} isInvalid={showGCE} >
								<FormControlLabel mb='$1'>
								<FormControlLabelText>Private Group Code</FormControlLabelText>
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
								Join a private group
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
