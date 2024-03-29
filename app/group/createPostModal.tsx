import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalFooter, CloseIcon, Heading, Icon, ModalBody, Image, Box, Button, ButtonText, ButtonIcon, Input, InputField, FormControl, FormControlLabel, FormControlHelper, FormControlHelperText, FormControlLabelText } from "@gluestack-ui/themed";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Alert } from "react-native";
import { useState } from "react";
import { ImagePlusIcon, UploadIcon, XIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "~/utils/supabase";

export default function CreatePostModal(props: { isOpen: boolean, onClose: () => void, groupID: string }) {

  const [imagePreview, setImagePreview] = useState("");
  const [caption, setCaption] = useState("");
  const onClose = () => {
    setImagePreview("");
    setCaption("");
    props.onClose();
  }

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required to change your profile picture.');
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
  }

  const handlePostUpload = async () => {
    const userDataString = await AsyncStorage.getItem('userData');
    if (!userDataString) {
      Alert.alert('Error', 'User data not found.');
      console.error('User data not found');
      return;
    }
    
    const userData = JSON.parse(userDataString);
    const userId = userData.session.user.id;
    const base64 = await FileSystem.readAsStringAsync(imagePreview, { encoding: 'base64' });
    const contentType = 'image/png';
  
    try {
      const { data: postData , error: createError } = await supabase
        .from('posts')
        .insert({ 
          user_id: userId,
          group_id: props.groupID,
          media_url: "",
          post_caption: caption
        })
        .select()

      if (createError) {
        throw new Error(createError.message);
      }

      const filePath = `${postData![0].post_id}.png`;

      const { error: uploadError } = await supabase.storage.from('post_media').upload(filePath, decode(base64), {
        contentType,
        cacheControl: '3600',
        upsert: true
      });
  
      if (uploadError) {
        throw new Error("UPLOAD ERROR - " + uploadError.message);
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
  }

  return (
    <>
      <Modal
        isOpen={props.isOpen}
        onClose={onClose}
      >
        <ModalBackdrop/>
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Create A New Post</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            {
              imagePreview ? 
              <Box h="$64" w="$full" justifyContent="center" alignItems="center">
                <Image alt="image upload preview" size="2xl" source={{ uri: imagePreview }} />
                <Button onPress={ handlePickImage } mt="-$12">
                  <ButtonIcon as={ ImagePlusIcon }/>
                  <ButtonText> Select Photo</ButtonText>
                </Button>
              </Box> : 
              <Box 
                borderWidth="$1"
                h="$64"
                borderColor="$primary500"
                backgroundColor="$primary50"
                borderRadius="$sm"
                justifyContent="center"
                alignItems="center"
              >
                <Button onPress={ handlePickImage }>
                  <ButtonIcon as={ ImagePlusIcon }/>
                  <ButtonText> Select Photo</ButtonText>
                </Button>
              </Box>
            }
            <FormControl mt="$5">
              <FormControlLabel mb="$1">
                <FormControlLabelText>
                  Caption
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                variant="outline"
                size="md"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
              >
                <InputField 
                  placeholder="Your caption"
                  value={caption}
                  onChangeText={setCaption} 
                />
              </Input>
            </FormControl>
          </ModalBody>
          <ModalFooter justifyContent="space-around">
            <Button onPress={handlePostUpload}>
              <ButtonIcon as={UploadIcon} />
              <ButtonText> Post</ButtonText>
            </Button>
            <Button variant="outline" bgColor="$red50" borderColor="$red400" onPress={onClose}>
              <ButtonIcon color="$red400" as={XIcon} />
              <ButtonText color="$red400"> Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal> 
    </>
  );
}