import { Heading, Modal, Button, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, Icon, CloseIcon, ModalBody, ModalFooter, ButtonText, Text } from "@gluestack-ui/themed";

export default function LeaveGroupModal(props: { isOpen: boolean, onClose: () => void, handleLeaveGroup: () => void }) {
  const isOpen = props.isOpen
  const onClose = props.onClose
  const handleLeaveGroup = props.handleLeaveGroup;

  return (
    <Modal
      isOpen={ isOpen }
      onClose={ onClose }
    >
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Leave Group</Heading>
          <ModalCloseButton onPress={ onClose }>
            <Icon as={ CloseIcon } />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <Text>Are you sure you want to leave this group?</Text>
        </ModalBody>
        <ModalFooter>
          <Button style={{ marginRight: 8 }} onPress={ onClose }>
            <ButtonText>No</ButtonText>
          </Button>
          <Button action="negative" onPress={() => {
            handleLeaveGroup()
            onClose()
          }}>
            <ButtonText>Yes</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}