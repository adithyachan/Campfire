import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  Heading,
  ModalCloseButton,
  Icon,
  CloseIcon,
  ModalBody,
  ScrollView,
  HStack,
  Button,
  ButtonText,
  Text,
} from '@gluestack-ui/themed';

interface ManageGroupModalProps {
  isVisible: boolean;
  onClose: () => void;
  groupMembers: any[];
  handleKickMember: (profileId: string) => void;
  handleBanMember: (profileId: string) => void;
  handleUnbanMember: (profileId: string) => void;
  bannedMembers: any[];
  groupData: any;
}

export default function ManageGroupModal({
  isVisible,
  onClose,
  groupMembers,
  handleKickMember,
  handleBanMember,
  handleUnbanMember,
  bannedMembers,
  groupData,
}: ManageGroupModalProps) {
  const nonAdminMembers = groupMembers.filter((member) => member.user_id !== groupData?.admin);

  return (
    <Modal isOpen={isVisible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Manage Group Members</Heading>
          <ModalCloseButton onPress={onClose}>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <ScrollView style={{ maxHeight: '95%' }}>
            {nonAdminMembers.map((member) => (
              <HStack
                key={member.user_id}
                justifyContent="space-between"
                py="$2"
                alignItems="center">
                <Text flex={1}>{member.username}</Text>
                <Button
                  variant="solid"
                  action="negative"
                  size="sm"
                  mr="$2"
                  onPress={() => handleKickMember(member.user_id)}>
                  <ButtonText>Kick</ButtonText>
                </Button>
                <Button
                  variant="solid"
                  action="negative"
                  size="sm"
                  onPress={() => handleBanMember(member.user_id)}>
                  <ButtonText>Ban</ButtonText>
                </Button>
              </HStack>
            ))}
            {/* List of banned members */}
            {bannedMembers.map((member) => (
              <HStack
                key={member.user_id}
                justifyContent="space-between"
                py="$2"
                alignItems="center">
                <Text flex={1}>{member.username}</Text>
                <Button
                  variant="solid"
                  action="positive"
                  size="sm"
                  onPress={() => handleUnbanMember(member.user_id)}>
                  <ButtonText>Unban</ButtonText>
                </Button>
              </HStack>
            ))}
          </ScrollView>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
