import {
  Switch,
  Text,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  CloseIcon,
  Heading,
  Icon,
  ModalBody,
  Image,
  Box,
  Button,
  ButtonText,
  ButtonIcon,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabelText,
} from '@gluestack-ui/themed';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Alert } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { ImagePlusIcon, UploadIcon, UserIcon, XIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '~/utils/supabase';
import { useLocalSearchParams } from 'expo-router';

import CollageLayout from 'react-native-collage-layout';
import ViewShot from 'react-native-view-shot';
import * as Location from 'expo-location';
import TagMembersModal from '../app/group/tagMembersModal';
import ShowTaggedModal from './showTaggedModal';

interface ImageObj {
  uri: string;
  aspectRatio: number;
}

type Profile = {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  bio: string;
  avatar_url: string;
};

export default function UpdatePostModal(props: {
  isOpen: boolean,
  onClose: () => void,
  postData: {
    post_id: string;
    user_id: string;
    group_id: string;
    media_url: string;
    post_caption: string;
    created_at: string;
    city: string;
  },
  tagged_userIDs: string[],
}) {

  const isOpen = props.isOpen
  const onClose = props.onClose

  const [caption, setCaption] = useState(props.postData.post_caption)

  const [postData, setPostData] = useState('');

  const [showTagModal, setShowTagModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState<Profile[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(props.tagged_userIDs);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const members = await getMembersForTagModal();
        setGroupMembers(members);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMembers();
  }, []);

  // Get members
  const getMembersForTagModal = async () => {
    try {
      const profileColumns = 'user_id, first_name, last_name, username, bio, avatar_url';
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select(profileColumns)
        .in('user_id', await getMemberIDexcludingself());

      if (userError) {
        throw new Error(userError.message);
      } else {
        console.log(userData);
      }
      return userData as Profile[];
    } catch (error) {
      throw error;
    }
  };

  // Get members EXCLUDING self
  const getMemberIDexcludingself = async () => {
    const currentUserID = (await supabase.auth.getUser()).data.user?.id;

    const { data: usersInGroup, error: uigError } = await supabase
      .from('group_users')
      .select('profile_id')
      .eq('group_id', props.postData.group_id);

    if (uigError) {
      throw new Error('USERINGROUP - ' + uigError.message);
    }

    const profileIDs = usersInGroup.map((user) => user.profile_id);
    if (currentUserID) {
      const index = profileIDs.indexOf(currentUserID);
      if (index !== -1) {
        profileIDs.splice(index, 1);
      }
    }

    return profileIDs;
  };

  const handleTagsConfirmed = (selectedMembers: string[]) => {
    setSelectedTags(selectedMembers);
  };

  const handlePostUpload = async () => {
    const userDataString = await AsyncStorage.getItem('userData');
    if (!userDataString) {
      Alert.alert('Error', 'User data not found.');
      console.error('User data not found');
      return;
    }

    const userData = JSON.parse(userDataString);
    const userId = userData.session.user.id;

    try {
      const { data: postData, error: createError } = await supabase
        .from('posts')
        .update({
          post_caption: caption,
          tags: selectedTags,
        })
        .eq("post_id", props.postData.post_id)
        .select();

      if (createError) {
        throw new Error(createError.message);
      }

      Alert.alert('Success', 'Your post has been uploaded successfully.');
      onClose();
    } catch (error) {
      console.error('Error uploading post:', error);
    }
  };

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={onClose}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Update Your Post</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Box h="$64" w="$full" justifyContent="center" alignItems="center">
              <Image alt="image upload preview" size="2xl" source={{ uri: props.postData.media_url }} />
            </Box>
            {showTagModal && (
              <TagMembersModal
                isVisible={showTagModal}
                onClose={() => setShowTagModal(false)}
                groupMembers={groupMembers}
                onTagsConfirmed={handleTagsConfirmed} // Pass the callback function
              />
            )}
            <FormControl mt="$5">
              <FormControlLabel mb="$1">
                <FormControlLabelText>Caption</FormControlLabelText>
              </FormControlLabel>
              <Input
                variant="outline"
                size="md"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}>
                <InputField placeholder="Your caption" value={caption} onChangeText={setCaption} />
              </Input>
            </FormControl>
          </ModalBody>
          <ModalFooter flexDirection="row" justifyContent="space-around" mb={-5}>
            <Button onPress={handlePostUpload}>
              <ButtonIcon as={UploadIcon} />
              <ButtonText> Update</ButtonText>
            </Button>
            <Button onPress={() => setShowTagModal(true)} isDisabled={!props.postData.media_url}>
              <ButtonIcon as={UserIcon} />
              <ButtonText> Tag</ButtonText>
            </Button>
            <Button
              variant="outline"
              bgColor="$red50"
              borderColor="$red400"
              onPress={onClose}
              marginTop={20}>
              <ButtonIcon color="$red400" as={XIcon} />
              <ButtonText color="$red400"> Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
    </>
  );
}
