import { Heading, CloseIcon, Icon, Modal, ModalBackdrop, ModalCloseButton, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea, TextareaInput, ButtonText, AddIcon, Button, ButtonIcon, Input, InputField } from "@gluestack-ui/themed";
import { PenBoxIcon, UploadIcon } from "lucide-react-native";
import { useState } from "react";

export default function CommentModal(props: { isOpen: boolean, onClose: () => void, handleSubmit: (s: string) => void}) {
  const [comment, setComment] = useState("")

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">
            Write a comment
          </Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon}/>
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <Input>
            <InputField value={comment} onChangeText={setComment} maxLength={100}/>
          </Input>
        </ModalBody>
        <ModalFooter justifyContent="space-around">
          <Button onPress={() => props.handleSubmit(comment)}>
            <ButtonIcon as={ PenBoxIcon } />
            <ButtonText>Submit</ButtonText>
          </Button>
          <Button action="secondary" onPress={props.onClose}>
            <ButtonText>Cancel</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}