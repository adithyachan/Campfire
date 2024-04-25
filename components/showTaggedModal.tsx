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
  VStack,
  Text,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
  Box,
  FlatList,
  Pressable,
  ModalFooter,
  Button,
  ButtonText,
  ListRenderItemInfo,
} from '@gluestack-ui/themed';
import { supabase } from '~/utils/supabase';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

interface UserProfile {
  user_id: string;
  username: string;
  avatar_url: string;
}

interface ShowTaggedModalProps {
  isOpen: boolean;
  onClose: () => void;
  taggedUserIDs: string[];
}

export default function ShowTaggedModal({ isOpen, onClose, taggedUserIDs }: ShowTaggedModalProps) {
  const [taggedUsers, setTaggedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (taggedUserIDs.length === 0) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', taggedUserIDs);

      if (error) {
        console.error('Error fetching tagged users:', error.message);
        return;
      }

      setTaggedUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, [taggedUserIDs]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Tagged Members</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        {loading ? (
          <ModalBody>
            <Text>Loading...</Text>
          </ModalBody>
        ) : (
          <FlatList<UserProfile>
            data={taggedUsers}
            renderItem={({ item }: ListRenderItemInfo<UserProfile>) => (
              <Pressable
                onPress={() => {
                  onClose();
                  router.push(`/account/${item.user_id}`);
                }}>
                <Box borderBottomWidth="$1" pl="$4" py="$2" justifyContent="space-between">
                  <VStack>
                    <Avatar>
                      {item.avatar_url ? (
                        <AvatarImage source={{ uri: item.avatar_url }} alt="Profile picture" />
                      ) : (
                        <AvatarFallbackText>{item.username[0]}</AvatarFallbackText>
                      )}
                    </Avatar>
                    <Text fontWeight="bold">{item.username}</Text>
                  </VStack>
                </Box>
              </Pressable>
            )}
            keyExtractor={(item) => item.user_id}
          />
        )}
        <ModalFooter>
          <Button variant="outline" onPress={onClose}>
            <ButtonText>Close</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
