import { Button, ButtonIcon, ButtonText, CloseIcon, Heading, Icon, Input, InputField, Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "@gluestack-ui/themed";
import { PenBoxIcon } from "lucide-react-native";

export default function confirmDeleteModal(props: {isOpen: boolean, onClose: () => void, handleSubmit: () => void }) {
  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">
            Confirm Comment Deletion
          </Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon}/>
          </ModalCloseButton>
        </ModalHeader>
        <ModalFooter justifyContent="space-around">
          <Button onPress={() => props.handleSubmit()} action="negative">
            <ButtonText>Confirm</ButtonText>
          </Button>
          <Button action="secondary" onPress={props.onClose}>
            <ButtonText>Cancel</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}