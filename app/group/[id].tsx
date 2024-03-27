import {  View, Share, Alert, TouchableOpacity } from "react-native";
import { Modal, Button, ButtonIcon, ButtonText, 
    CloseIcon, FormControl, FormControlLabel, FormControlLabelText, 
    Heading, Icon, Input, InputField, ModalBackdrop, ModalBody, 
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, 
    ShareIcon, Text, VStack, InputIcon, CopyIcon, InputSlot, 
    Pressable, Box, ScrollView, useToast, Toast, 
    ToastDescription, ToastTitle, CheckIcon, Image, Card, Avatar, AvatarFallbackText, AvatarImage, Divider, HStack } from "@gluestack-ui/themed";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import * as Clipboard from 'expo-clipboard';

export default function GroupScreen() {
    const navigation = useNavigation();
    const items = useLocalSearchParams()
    const [showShare, setShowShare] = useState(false)
    const [groupCode, setGroupCode] = useState('')
    const [isMember, setIsMember] = useState(false);
    const [leaveConfirmationVisible, setLeaveConfirmationVisible] = useState(false);

    // console.log(items)

    const confirmLeaveGroup = () => {
      // Show confirmation modal
      setLeaveConfirmationVisible(true);
    };


    useEffect(() => {
        checkMembership();
        console.log("MEMBER", isMember)
        if (items.first) {
          alert('Welcome to ' + items.name);
        }

        navigation.setOptions({ 
          headerTitle: items.name,
          headerBackTitle: 'Home',
          headerRight: () => (
              isMember ? (
                  <Button variant="link" onPress={() => setShowShare(true)}>
                      <ButtonIcon as={ShareIcon} />
                  </Button>
              ) : null
          )
        });
        try {
          const getCode = async () => {
            try {
              const { data: groupData, error: errorCode } = await supabase
              .from('groups')
              .select('code')
              .eq('group_id', items.id);
          
              console.log(groupData)
              setGroupCode(groupData?.[0]?.code)
            
              if (!groupCode) {
                throw new Error('Group code not found.');
              }
            } catch (error) {

            }
          }

          if (!groupCode) {
            getCode()
          }
        } catch (error) {

        }

    },[navigation, items])

    const checkMembership = async () => {
      const {data: {user}}  = await supabase.auth.getUser();
      if (user == null) {
        console.log("Could not retrieve")
        return;
      }
      const userId = user.id;

      const { data: membershipData, error: membershipError } = await supabase
          .from('group_users')
          .select('*')
          .eq('profile_id', userId) // replace with the current user's id
          .eq('group_id', items.id);

      if (membershipError) {
          console.log(membershipError);
          return;
      }

      setIsMember(membershipData.length > 0);
    };


    const ShareCode = async () => {
        try {
          const result = await Share.share({
            message: `Join My Campfire Group! Code: ${groupCode}`,
          });
        
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // shared with activity type of result.activityType
            } else {
              // shared
            }
          } else if (result.action === Share.dismissedAction) {
            // dismissed
          }
        } catch (error: any) {
          Alert.alert(error.message);
        }
    };

    const unsubscribeFromGroup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          console.log(user.id, items.id)
          const { error } = await supabase
              .from('group_users')
              .delete()
              .match({ profile_id: user.id, group_id: items.id });
  
          if (error) {
            console.error('Error unsubscribing from group:', error);
          } else {
            router.navigate("groups");
          }
      }
  };
  

    const copyToClipboard = async () => {
      await Clipboard.setStringAsync(groupCode);
    };

    return ( 
        <View className={styles.container}>
          <ScrollView width={"$full"}>
            <Card width={"$full"} size="lg" variant="ghost" p={"$0"} >
            <Image
            w={"$full"}
            h={"$1/2"}
  source={{
    uri: "https://source.unsplash.com/f9bkzNQyylg"
  }}
  alt="Image of Campfire"
/>
      <Box flexDirection="row" p={"$3"}>
        <VStack>
          <Heading size="xl" mb="$1">
            {items.name}
          </Heading>
          <Text size="sm" >
            {items.bio}
          </Text>
        </VStack>
      </Box>
      <Box
        my="$3"
        sx={{
          flexDirection: "row",
        }}
      >
        <HStack width={"$full"} justifyContent="space-evenly">
        <VStack
          alignItems="center"
        >
          <Heading size="xs" fontFamily="$heading">
            10
          </Heading>
          <Text size="xs">posts</Text>
        </VStack>
        <VStack
          alignItems="center"
        >
          <Heading size="xs" fontFamily="$heading">
            200
          </Heading>
          <Text size="xs">followers</Text>
        </VStack>
        <VStack
          alignItems="center"
        >
          <Heading size="xs" fontFamily="$heading">
            12
          </Heading>
          <Text size="xs">Members</Text>
      </VStack>
        </HStack>

      </Box>

      {isMember && (
        <Box alignItems="center" justifyContent="center" my="$4">
          <Button size="md" variant="solid" action="negative" onPress={confirmLeaveGroup}>
            <ButtonText>Leave Group</ButtonText>
          </Button>
        </Box>
      )}

    </Card>
          </ScrollView>

          {isMember && (
        <Modal
				isOpen={showShare}
				onClose={() => {
				setShowShare(false)
				}}
					>
						<ModalBackdrop />
						<ModalContent>
						<ModalHeader>
							<Heading size="lg">Invite some friends! </Heading>
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
                                <Input isReadOnly={true}>
                                <InputField >
                                {groupCode}
                                </InputField>
                                <InputSlot pr="$3" >
                                {/* EyeIcon, EyeOffIcon are both imported from 'lucide-react-native' */}
                                <TouchableOpacity onPress={() => copyToClipboard()}>
                                <InputIcon
                                    as={CopyIcon}
                                    color="$darkBlue500"
                                />
                                </TouchableOpacity>
                                </InputSlot>
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
								setShowShare(false)
							}}
							>
							<ButtonText>Cancel</ButtonText>
							</Button>

							<Button
							size="sm"
							action="positive"
							borderWidth="$0"
                            onPress={ShareCode}
							>
							<ButtonText >Share</ButtonText>
							</Button>
						</ModalFooter>
						</ModalContent>
				</Modal>
          )}

        <Modal
                isOpen={leaveConfirmationVisible}
                onClose={() => setLeaveConfirmationVisible(false)}
            >   
            <ModalBackdrop/>
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">Leave Group</Heading>
                        <ModalCloseButton onPress={() => setLeaveConfirmationVisible(false)}>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <Text>Are you sure you want to leave this group?</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button style={{ marginRight: 8 }} onPress={() => setLeaveConfirmationVisible(false)}>
                            <ButtonText>No</ButtonText>
                        </Button>
                        <Button action="negative" onPress={() => {
                            unsubscribeFromGroup();
                            setLeaveConfirmationVisible(false);
                        }}>
                            <ButtonText>Yes</ButtonText>
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
    title: `text-xl font-bold`,
};