import { Box, Heading, Modal, Button, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, Icon, CloseIcon, ModalBody, HStack, Avatar, AvatarImage, AvatarFallbackText, VStack, ModalFooter, ButtonText, Text } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { View, FlatList, Pressable } from "react-native";
import { supabase } from "~/utils/supabase";

export default function ShowMembersModal(props: { isOpen: boolean, onClose: () => void, groupMembers: any[] }) {
  const isOpen = props.isOpen
  const onClose = props.onClose
  const groupMembers = props.groupMembers

  return (
    <Modal
      isOpen={ isOpen }
      onClose={ onClose }
    >
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg"> Members </Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody horizontal={true} scrollEnabled={false} style={{ width: '100%' }}
        >
          <View style={{ flex: 1, width: '100%' }}>
            <FlatList
              style={{ flexGrow: 1 }}
              data={ groupMembers }
              renderItem={({ item }) => (
                <Pressable onPress={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user == null) {
                    console.log("Could not retrieve")
                    return;
                  }
                  const uid = user.id;
                  if (uid === (item as { user_id: string }).user_id) {
                    onClose();
                    router.push({
                      pathname: "/account"
                    });
                    return;
                  } else {
                    onClose();
                    router.push({
                      pathname: "/account/[id]",
                      params: { id: (item as { user_id: string }).user_id }
                    });
                    return;
                  }
                }}>
                  <Box
                    borderBottomWidth="$1"
                    borderColor="$trueGray800"
                    $dark-borderColor="$trueGray100"
                    py="$2"
                    justifyContent="space-between"
                  >
                    <HStack>
                      <Avatar size="md">
                        {(item as { avatar_url: string, first_name: string, last_name: string }).avatar_url ? (
                          <AvatarImage source={{ uri: (item as { avatar_url: string, first_name: string, last_name: string }).avatar_url }} alt="Profile picture" />
                        ) : (
                          <AvatarFallbackText>{`${(item as { avatar_url: string, first_name: string, last_name: string }).first_name} ${(item as { avatar_url: string, first_name: string, last_name: string }).last_name}`}</AvatarFallbackText>
                        )}
                      </Avatar>
                      <VStack paddingLeft={10}>
                        <Text
                          color="$coolGray800"
                          fontWeight="$bold"
                          $dark-color="$warmGray100"
                        >
                          {(item as { username: string }).username}
                        </Text>
                        <Text color="$coolGray600" $dark-color="$warmGray200">
                          {(item as { first_name: string, last_name: string }).first_name} {(item as { first_name: string, last_name: string }).last_name}
                        </Text>
                      </VStack>
                      <Text
                        fontSize="$xs"
                        color="$coolGray800"
                        $dark-color="$warmGray100"
                      >
                      </Text>
                    </HStack>
                  </Box>
                </Pressable>
              )}
              keyExtractor={(item: unknown, index: number) => (item as { id: string }).id}
            />
          </View>
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
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}