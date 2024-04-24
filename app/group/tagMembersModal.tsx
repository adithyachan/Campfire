import React, { useState } from 'react';
import { supabase } from '~/utils/supabase';
import {
  Modal,
  ModalCloseButton,
  Icon,
  CloseIcon,
  ModalFooter,
  ModalContent,
  ModalBody,
  ModalHeader,
  Heading,
  Button,
  ModalBackdrop,
  ButtonText,
  Box,
  Text,
} from '@gluestack-ui/themed';

type Profile = {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  bio: string;
  avatar_url: string;
};

interface TagMembersModalProps {
  isVisible: boolean;
  onClose: () => void;
  groupMembers: Profile[];
  onTagsConfirmed: (selectedMembers: string[]) => void; // New prop for passing selected members back
}

const TagMembersModal = ({
  isVisible,
  onClose,
  groupMembers,
  onTagsConfirmed,
}: TagMembersModalProps) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const toggleTagMember = (userId: string) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const isTagged = (userId: string) => {
    return selectedMembers.includes(userId);
  };

  const handleConfirmTags = () => {
    onTagsConfirmed(selectedMembers); // Pass selected members back to the parent component
    onClose(); // Close the modal
  };

  return (
    <Modal isOpen={isVisible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Tag Members</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          {groupMembers.map((member) => (
            <Box
              key={member.user_id}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mb="$4">
              <Box flexDirection="row" alignItems="center">
                <Text>
                  {member.first_name} {member.last_name}
                </Text>
              </Box>
              <Button
                action={isTagged(member.user_id) ? 'negative' : 'positive'}
                onPress={() => toggleTagMember(member.user_id)}>
                <ButtonText>{isTagged(member.user_id) ? 'Untag' : 'Tag'}</ButtonText>
              </Button>
            </Box>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button onPress={handleConfirmTags}>
            <ButtonText>Confirm</ButtonText>
          </Button>
          <Button ml="$2" action="negative" onPress={onClose}>
            <ButtonText>Cancel</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TagMembersModal;
