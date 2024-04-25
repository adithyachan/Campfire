import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import {
  Button,
  ButtonText,
  Divider,
  Text,
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  InputField,
  useToast,
  ToastTitle,
  Toast,
  VStack,
  ToastDescription,
  HStack,
  Switch,
  Fab,
  BellIcon,
  FabIcon,
  Heading,
  Icon,
  CloseIcon,
  ScrollView
} from '@gluestack-ui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../utils/supabase'; 
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import * as Location from 'expo-location'
import NotificationRecord from '~/components/notificationRecord';

type Profile = {
  bio: string;
  avatarUrl: string | null;
  firstName: string;
  lastName: string;
  notifications: boolean;
};

type Notification = {
  notification_id: string,
  created_at: string,
  user_id: string, 
  title: string,
  body: string, 
  event: string,
  redirect_to: string
}

const AccountScreen = () => {
  const toast = useToast()
  supabase
    .channel('notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, async (payload) => {
      const insertedRow = payload.new
      console.log(`new row inserted: ${JSON.stringify(insertedRow)}`)
      const {data: {user}}  = await supabase.auth.getUser();
      const {data: notificationData, error: notificationError} = await supabase
        .from('profiles')
        .select('notifications')
        .eq('user_id', user?.id)
        .single()
      
      if (notificationData?.notifications && user?.id === insertedRow.user_id)
        toast.show({
					duration: 7000,
					placement: "top",
					render: ({ id }) => {
						const toastId = "toast-" + id
						return (
							<Toast nativeID={toastId} action="attention" variant="solid">
								<VStack space="xs">
									<ToastTitle>{insertedRow.title}</ToastTitle>
									<ToastDescription>
										{insertedRow.body}
									</ToastDescription>
								</VStack>
							</Toast>
						)
					},
				})
      }
    )
    .subscribe()

  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>();
  const [loading, setLoading] = useState(true);
  const [showBioModal, setShowBioModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [switchState, setSwitchState] = useState<boolean>();
  const [user_id, setUser_id] = useState<string>();
  
  
  useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true);
			try {
				const userDataString = await AsyncStorage.getItem('userData');
				console.log(`fetched the following from async: ${userDataString}`);
				if (!userDataString) {
					return;
				}
				const userData = JSON.parse(userDataString);
				const userId = userData.session.user.id;
        setUser_id(userId)
	
				let { data: profileData, error: profileError } = await supabase
					.from('profiles')
					.select('bio, avatar_url, first_name, last_name, notifications')
					.eq('user_id', userId)
					.single();
		
				setProfile({
					bio: profileData?.bio ?? "Hi! I'm new to Campfire!",
					avatarUrl: profileData?.avatar_url,
					firstName: profileData?.first_name ?? '',
					lastName: profileData?.last_name ?? '',
          notifications: profileData?.notifications

				});

        let {data: notifData, error: notifError} = await supabase
          .from('notifications')
          .select()
          .eq('user_id', userId)
          .order('created_at', { ascending: false})
          .limit(10)

        let sortedNotifs = notifData?.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return dateB - dateA
        })

        setNotifications(sortedNotifs)
        
			} catch (error: any) {
				console.error('Error fetching profile:', error.message);
			} finally {
				setLoading(false);
			}
		};
    
		fetchProfile();
    
	}, []);
  const onChangeProfilePhoto = async () => {
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
  
    const userDataString = await AsyncStorage.getItem('userData');
    if (!userDataString) {
      Alert.alert('Error', 'User data not found.');
      console.error('User data not found');
      return;
    }
  
    const userData = JSON.parse(userDataString);
    const userId = userData.session.user.id;
    const img = result.assets[0];
    const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: 'base64' });
    const filePath = `${userId}.png`;
    const contentType = 'image/png';
  
    try {
      const { error: uploadError } = await supabase.storage.from('profile_photos').upload(filePath, decode(base64), {
        contentType,
        cacheControl: '3600',
        upsert: true
      });
  
      if (uploadError) {
        throw new Error(uploadError.message);
      }
  
      const { data } = supabase.storage.from('profile_photos').getPublicUrl(filePath);
  
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('user_id', userId);
  
      if (updateError) {
        throw new Error(updateError.message);
      }

      const updatedAvatarUrl = `${data.publicUrl}?v=${new Date().getTime()}`;
      setProfile((prevProfile) => {
        if (!prevProfile) return null;
        return { ...prevProfile, avatarUrl: updatedAvatarUrl };
      });
  
      Alert.alert('Success', 'Your profile photo has been updated successfully.');
  
    } catch (error) {
      console.error('Error updating profile photo:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!profile) {
    return null;
  }

  const handleChangeBio = async () => {
    if (newBio.length <= 5) {
      Alert.alert("Error", "Bio must be longer than 5 characters.");
      return;
    }

    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        console.error('User data not found');
        return;
      }
      const userData = JSON.parse(userDataString);
      const userId = userData.session.user.id;

      const { error } = await supabase
        .from('profiles')
        .update({ bio: newBio })
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      setProfile((prevProfile) => {
        if (prevProfile === null) {
          return null;
        }
        return {
          ...prevProfile,
          bio: newBio,
        };
      });           

      Alert.alert("Success", "Your bio has been updated.");
    } catch (error) {
      console.error("Failed to update bio:", error);
      Alert.alert("Error", "Failed to update your bio.");
    } finally {
      setShowBioModal(false);
    }
  };
const bioChangeModal = (
  <Modal
    isOpen={showBioModal}
    onClose={() => setShowBioModal(false)}
  >
    <ModalBackdrop />
    <ModalContent>
      <ModalHeader>
        <Text>Update Your Bio</Text>
        <ModalCloseButton onPress={() => setShowBioModal(false)} />
      </ModalHeader>
      <ModalBody>
        <Input variant="outline" size="md" isDisabled={false} isInvalid={false} isReadOnly={false}>
          <InputField
            value={newBio}
            onChangeText={(text) => setNewBio(text)}
            placeholder="Enter your new bio"
            maxLength={50}
          />
        </Input>
      </ModalBody>
      <ModalFooter>
        <Button
          onPress={() => setShowBioModal(false)}
          style={{ marginRight: 8 }}
          action="secondary">
          <ButtonText>Cancel</ButtonText>
        </Button>
        <Button onPress={handleChangeBio}>
          <ButtonText>Save</ButtonText>
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);



	const handleDeleteAccount = async () => {
		try {
			const userDataString = await AsyncStorage.getItem('userData');
			console.log(`Fetched userDataString from AsyncStorage: ${userDataString}`);
			if (!userDataString) {
				console.error('userData not found in AsyncStorage');
				return;
			}
			const userData = JSON.parse(userDataString);
			const userId = userData.session.user.id;
	
			// Manually cascade delete user by deleting profile first
			const { data: profileDeleteData, error: deleteProfileError } =  await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

			if (deleteProfileError) {
				throw deleteProfileError;
			} else {
				console.log(`Profile with ID ${userId} deleted successfully.`);
			}
			// Delete user record from Supabase
			const { data: userDeleteData, error: deleteUserError } = await supabase.auth.admin.deleteUser(userId)
			if (deleteUserError) {
				throw deleteUserError;
			} else {
				console.log(`User with ID ${userId} deleted successfully.`);
			}
	
			await AsyncStorage.removeItem('userData');
			console.log('userData removed from AsyncStorage successfully.');
	
			router.replace("/auth/login");
		} catch (error) {
			console.error(error);
		}
	};

	const handleLogout = async () => {
    
    const { error } = await supabase.auth.signOut();
		await AsyncStorage.removeItem('userData');
		console.log('[logout] userData removed from AsyncStorage successfully.');
		router.replace('/auth/login');
	}

  const handleResetPassword = async () => {
    router.navigate("/auth/resetpassword")
  }

  const handleNotificationToggle = async () => {
    const {data: {user}}  = await supabase.auth.getUser(); 
    const {data: notificationData, error: notificationError} = await supabase
      .from('profiles')
      .select('notifications')
      .eq('user_id', user?.id)
      .single()

    const newNotifs = ! notificationData?.notifications
    setSwitchState(newNotifs)
    const {error} = await supabase
      .from('profiles')
      .update({notifications: newNotifs})
      .eq('user_id', user?.id)

  }

  const handleOpenNotifications = async () => {
    let {data: notifData, error: notifError} = await supabase
      .from('notifications')
      .select()
      .eq('user_id', user_id)
      .order('created_at', { ascending: false})
      .limit(10)

    let sortedNotifs = notifData?.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })
    setNotifications(sortedNotifs)
    setShowNotifModal(true)
  }
  return (
    <View style={styles.container}>
      <Text marginBottom={20} bold={true} size={'5xl'}>{`${profile.firstName} ${profile.lastName}`}</Text>
      
      <Avatar bgColor='$amber600' size="2xl" borderRadius="$full">
        {profile.avatarUrl ? (
          <AvatarImage source={{ uri: profile.avatarUrl }} alt="Profile picture"/>
        ) : (
          <AvatarFallbackText>{`${profile.firstName} ${profile.lastName}`}</AvatarFallbackText>
        )}
      </Avatar>

      <Text style={styles.bio}>
        {profile.bio}
      </Text>

            
      <Divider style={styles.divider} />
      <HStack space="md">
        <Switch defaultValue={profile.notifications} value={switchState}onToggle={handleNotificationToggle}/>
        <Text size="sm">Allow notifications</Text>
      </HStack>
      <Button
        size="md"
        variant="solid"
        action="primary"
        onPress={() => handleResetPassword()}
        style={styles.button}
      >
        <ButtonText>Reset Password</ButtonText>
      </Button>
            
      <Button
        size="md"
        variant="solid"
        action="secondary"
        onPress={() => setShowBioModal(true)}
        style={styles.button}
      >
        <ButtonText>Change Bio</ButtonText>
      </Button>
            
      <Button
        size="md"
        variant="solid"
        action="secondary"
        onPress={onChangeProfilePhoto}
        style={styles.button}
      >
        <ButtonText>Change Profile Photo</ButtonText>
      </Button>
      <Button
        size="md"
        variant="solid"
        action='negative'
        onPress={() => handleLogout()}
        style={styles.button}
      >
        <ButtonText>Log Out</ButtonText>
      </Button>
      <Button
        size="md"
        variant="solid"
        action='negative'
        onPress={() => handleDeleteAccount()}
        style={styles.button}
      >
        <ButtonText>Delete Account</ButtonText>
      </Button>
      {bioChangeModal}
      <Fab placement="bottom right" onPress={() => {handleOpenNotifications()}}>
        <FabIcon as={BellIcon}/>
      </Fab>
      <Modal isOpen={showNotifModal} onClose={() => setShowNotifModal(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Notifications</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications?.map((notificationData) => (
                
                <NotificationRecord key={notificationData.notification_id} notification={notificationData} setShowNotifModal={setShowNotifModal}/>
                
              ))}
            </ScrollView>
          </ModalBody>
        </ModalContent>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  bio: {
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  divider: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    marginVertical: 5,
  }
});

export default AccountScreen;
