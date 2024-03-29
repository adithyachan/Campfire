import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalFooter, CloseIcon, Heading, Icon, ModalBody } from "@gluestack-ui/themed";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Alert } from "react-native";

export default function CreatePostModal(props: {isOpen: boolean, onClose: () => void}) {

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required to change your profile picture.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.25,
    });
  
    if (result.canceled) {
      return;
    }
  }
  return (
    <>
      <Modal
        isOpen={props.isOpen}
        onClose={props.onClose}
      >
        <ModalBackdrop/>
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Create A New Post</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>

          </ModalBody>
        </ModalContent>
      </Modal> 
    </>
  );
}