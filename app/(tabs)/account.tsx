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
  InputField
} from '@gluestack-ui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../utils/supabase'; 
import { router } from 'expo-router';

type Profile = {
  bio: string;
  avatarUrl: string | null;
  firstName: string;
  lastName: string;
};

const AccountScreen = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBio, setNewBio] = useState('');
  
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
	
				let { data, error } = await supabase
					.from('profiles')
					.select('bio, avatar_url, first_name, last_name')
					.eq('user_id', userId)
					.single();
		
				setProfile({
					bio: data?.bio ?? "Hi! I'm new to Campfire!",
					avatarUrl: data?.avatar_url,
					firstName: data?.first_name ?? '',
					lastName: data?.last_name ?? '',
				});
			} catch (error: any) {
				console.error('Error fetching profile:', error.message);
			} finally {
				setLoading(false);
			}
		};
	
		fetchProfile();
	}, []);
	

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
      setShowModal(false);
    }
  };
const bioChangeModal = (
  <Modal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
  >
    <ModalBackdrop />
    <ModalContent>
      <ModalHeader>
        <Text>Update Your Bio</Text>
        <ModalCloseButton onPress={() => setShowModal(false)} />
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
          onPress={() => setShowModal(false)}
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
		await AsyncStorage.removeItem('userData');
		console.log('[logout] userData removed from AsyncStorage successfully.');
		router.replace('/auth/login');
	}
  return (
    <View style={styles.container}>
      <Text marginBottom={20} bold={true} size={'5xl'}>{`${profile.firstName} ${profile.lastName}`}</Text>
      
      <Avatar bgColor='$amber600' size="2xl" borderRadius="$full">
        {profile.avatarUrl ? (
          <AvatarImage source={{ uri: profile.avatarUrl }} />
        ) : (
          <AvatarFallbackText>{`${profile.firstName} ${profile.lastName}`}</AvatarFallbackText>
        )}
      </Avatar>

      <Text style={styles.bio}>
        {profile.bio}
      </Text>

            
      <Divider style={styles.divider} />
            
      <Button
        size="md"
        variant="solid"
        action="primary"
        onPress={() => console.log('Reset Password')}
        style={styles.button}
      >
        <ButtonText>Reset Password</ButtonText>
      </Button>
            
      <Button
        size="md"
        variant="solid"
        action="secondary"
        onPress={() => setShowModal(true)}
        style={styles.button}
      >
        <ButtonText>Change Bio</ButtonText>
      </Button>
            
      <Button
        size="md"
        variant="solid"
        action="secondary"
        onPress={() => console.log('Change Profile Photo')}
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
