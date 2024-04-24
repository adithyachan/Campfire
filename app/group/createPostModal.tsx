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
import { ImagePlusIcon, UploadIcon, XIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '~/utils/supabase';
import { useLocalSearchParams } from 'expo-router';

import CollageLayout from 'react-native-collage-layout';
import ViewShot from 'react-native-view-shot';
import * as Location from 'expo-location';
import TagMembersModal from './tagMembersModal';

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

export default function CreatePostModal(props: {
  isOpen: boolean;
  onClose: () => void;
  groupID: string;
}) {
  const [imagePreview, setImagePreview] = useState('');
  const [caption, setCaption] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);

  const [images, setImages] = useState<ImageObj[]>([]);
  const [isCollage, setIsCollage] = useState(false);
  const collageRef = useRef(null);
  const [isPublicPost, setIsPublicPost] = useState(true);
  const [groupMembers, setGroupMembers] = useState<Profile[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const routeParams = useLocalSearchParams();

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

  const onClose = () => {
    setImagePreview('');
    setCaption('');
    setImages([]);
    props.onClose();
  };

  const handleCollage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Camera roll permissions are required to change your profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3,
      aspect: [1, 1],
      quality: 0.25,
    });

    if (result.canceled) {
      return;
    }
    console.log(
      result.assets.map((asset) => asset.uri),
      result.assets.length
    );
    setImages(result.assets.map((asset) => ({ uri: asset.uri, aspectRatio: 1.5 })));
    setIsCollage(true);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Camera roll permissions are required to change your profile picture.'
      );
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

    const img = result.assets[0];
    setImagePreview(img.uri);
    setIsCollage(false);
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

    // Capture the collage and get its URI
    let uri = imagePreview;
    if (isCollage && collageRef.current) {
      uri = await (collageRef.current as any).capture();
    }

    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    const contentType = 'image/png';

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    let latitude = location.coords.latitude;
    let longitude = location.coords.longitude;
    let reverseGeo = await Location.reverseGeocodeAsync({ latitude, longitude });
    console.log(location);
    console.log(reverseGeo);
    let geo_city = reverseGeo[0].city;
    console.log(`{post city: ${geo_city}`);

    try {
      const { data: postData, error: createError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          group_id: props.groupID,
          media_url: '',
          post_caption: caption,
          city: geo_city,
          is_public: isPublicPost,
          tags: selectedTags,
        })
        .select();

      if (createError) {
        throw new Error(createError.message);
      }

      const filePath = `${postData![0].post_id}.png`;

      const { error: uploadError } = await supabase.storage
        .from('post_media')
        .upload(filePath, decode(base64), {
          contentType,
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error('UPLOAD ERROR - ' + uploadError.message);
      }

      const { data } = supabase.storage.from('post_media').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('posts')
        .update({ media_url: data.publicUrl })
        .eq('post_id', postData![0].post_id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      Alert.alert('Success', 'Your post has been uploaded successfully.');
      onClose();
    } catch (error) {
      console.error('Error uploading post:', error);
    }
    setIsCollage(false);
  };

  const handleTogglePublicPost = () => {
    setIsPublicPost(!isPublicPost);
    console.log(isPublicPost);
  };

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
      .eq('group_id', routeParams.id);

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

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={onClose}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Create A New Post</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            {showTagModal && (
              <TagMembersModal
                isVisible={showTagModal}
                onClose={() => setShowTagModal(false)}
                groupMembers={groupMembers}
                onTagsConfirmed={handleTagsConfirmed} // Pass the callback function
              />
            )}
            {isCollage ? (
              images.length > 0 && (
                <ViewShot ref={collageRef} options={{ format: 'jpg', quality: 0.9 }}>
                  <CollageLayout spacing={2} images={images} layoutMaxHeight={200} />
                </ViewShot>
              )
            ) : imagePreview ? (
              <Box h="$64" w="$full" justifyContent="center" alignItems="center">
                <Image alt="image upload preview" size="2xl" source={{ uri: imagePreview }} />
                <Button onPress={handlePickImage} mt="-$12">
                  <ButtonIcon as={ImagePlusIcon} />
                  <ButtonText> Select Photo</ButtonText>
                </Button>
              </Box>
            ) : (
              <Box
                borderWidth="$1"
                h="$64"
                borderColor="$primary500"
                backgroundColor="$primary50"
                borderRadius="$sm"
                justifyContent="center"
                alignItems="center">
                <Button onPress={handlePickImage}>
                  <ButtonIcon as={ImagePlusIcon} />
                  <ButtonText> Select Photo</ButtonText>
                </Button>
              </Box>
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

              <Text mt="$2">Public Post</Text>
              <Switch mt="$1" onToggle={handleTogglePublicPost} value={isPublicPost} />
            </FormControl>
          </ModalBody>
          <ModalFooter flexDirection="row" justifyContent="space-around" mb={-5}>
            <Button onPress={handlePostUpload}>
              <ButtonIcon as={UploadIcon} />
              <ButtonText> Post</ButtonText>
            </Button>
            <Button onPress={handleCollage}>
              <ButtonIcon as={XIcon} />
              <ButtonText> Collage</ButtonText>
            </Button>
            <Button onPress={() => setShowTagModal(true)} isDisabled={!imagePreview}>
              <ButtonIcon as={XIcon} />
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
