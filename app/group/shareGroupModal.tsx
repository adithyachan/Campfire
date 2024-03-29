import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, Icon, CloseIcon, ModalBody, VStack, FormControl, FormControlLabel, FormControlLabelText, Input, InputField, InputSlot, InputIcon, ModalFooter, ButtonText, Button } from "@gluestack-ui/themed"
import { Heading, CopyIcon } from "lucide-react-native"
import { Alert, Share, TouchableOpacity } from "react-native"
import * as Clipboard from 'expo-clipboard'

export default function ShareGroupModal(props: { isOpen: boolean, onClose: () => void, groupCode: string }) {

  const isOpen = props.isOpen;
  const onClose = props.onClose;
  const groupCode = props.groupCode;

  const ShareCode = async () => {
    try {
      const result = await Share.share({
        message: `Join My Campfire Group! Code: ${groupCode}`,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(groupCode);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
                  { groupCode }
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
            onPress={onClose}
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
  )
}