
import {  View, Share, Alert, TouchableOpacity } from "react-native";
import { Modal, Button, ButtonIcon, ButtonText, 
    CloseIcon, FormControl, FormControlLabel, FormControlLabelText, 
    Heading, Icon, Input, InputField, ModalBackdrop, ModalBody, 
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, 
    ShareIcon, Text, VStack, InputIcon, CopyIcon, InputSlot, Pressable, Box, ScrollView, useToast, Toast, ToastDescription, ToastTitle, CheckIcon } from "@gluestack-ui/themed";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import * as Clipboard from 'expo-clipboard';

export default function GroupScreen() {
    const navigation = useNavigation();
    const items = useLocalSearchParams()
    const [showShare, setShowShare] = useState(false)
    const [groupCode, setGroupCode] = useState('')

    console.log(items)

    useEffect(() => {

        navigation.setOptions({ 
            headerTitle: items.name,
            headerBackTitle: 'Home',
            headerRight: () => (
                <Button variant="link" onPress={() => setShowShare(true)}>
                    <ButtonIcon as={ShareIcon} />
                </Button>
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

    const copyToClipboard = async () => {
      await Clipboard.setStringAsync(groupCode);
    };
  

    return ( 
        <View className={styles.container}>
          <ScrollView>
          <Box width={"$full"} height={"$1/6"}>
            
          </Box>

              <Text>
                  Group Name: {items.name}
              </Text>
              <Text>
                  Group Bio: {items.bio}
              </Text>
          </ScrollView>
        <Modal
				isOpen={showShare}
				onClose={() => {
				setShowShare(false)
				}}
					>
						<ModalBackdrop />
						<ModalContent>
						<ModalHeader>
							<Heading size="lg">Share Group Code</Heading>
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
        



        </View>
    );
}


const styles = {
    container: `items-center flex-1 justify-center`,
    separator: `h-[1px] my-7 w-4/5 bg-gray-200`,
    title: `text-xl font-bold`
};