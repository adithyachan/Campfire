import React, { useState, useEffect } from 'react';
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
  onTagsConfirmed: (selectedMembers: string[]) => void;
  initialSelectedMembers: string[]; // Add this line
  groupId: string;
}

const TagMembersModal = ({
  isVisible,
  onClose,
  groupMembers,
  onTagsConfirmed,
  initialSelectedMembers,
  groupId,
}: TagMembersModalProps) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (isVisible) {
      setSelectedMembers(initialSelectedMembers);
    }
  }, [initialSelectedMembers, isVisible]);

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

  const handleConfirmTags = async () => {
    onTagsConfirmed(selectedMembers); // Pass selected members back to the parent component

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const current_user_id = user?.id;

    const { data: groupData } = await supabase
      .from('groups')
      .select('name')
      .eq('group_id', groupId)
      .single();

    const groupName = groupData?.name;

    selectedMembers.forEach(async (tagged_user_id) => {
      if (tagged_user_id !== current_user_id) {
        const { error } = await supabase.from('notifications').insert({
          user_id: tagged_user_id,
          title: "You've been tagged",
          body: `Someone in group ${groupName} has tagged you in a post!`,
          event: 'Tagged',
          redirect_to: groupId,
        });
      }
    });

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
          {groupMembers.length > 0 ? (
            groupMembers.map((member) => (
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
            ))
          ) : (
            <Text>No members available to tag. Invite friends to join your group!</Text>
          )}
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
