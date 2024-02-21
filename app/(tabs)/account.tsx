import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import {
  Button,
  ButtonText,
  Divider,
  Text,
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from '@gluestack-ui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../utils/supabase'; 

type Profile = {
  bio: string;
  avatarUrl: string | null;
  firstName: string;
  lastName: string;
};

const AccountScreen = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true);
			try {
				const userDataString = await AsyncStorage.getItem('userData');
				console.log(`fetched the following from async: ${userDataString}`);
				if (!userDataString) {
					// Handle case where userData is not available
					return;
				}
				const userData = JSON.parse(userDataString);
				const userId = userData.session.user.id;
	
				let { data, error } = await supabase
					.from('profiles')
					.select('bio, avatar_url, first_name, last_name')
					.eq('user_id', userId)
					.single();
	
				if (error) throw error;
	
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
        onPress={() => console.log('Change Bio')}
        style={styles.button}
      >
        <ButtonText>Change Bio</ButtonText>
      </Button>
            
      <Button
        size="md"
        variant="solid"
        onPress={() => console.log('Change Profile Photo')}
        style={styles.button}
      >
        <ButtonText>Change Profile Photo</ButtonText>
      </Button>
      <Button
        size="md"
        variant="solid"
        action='negative'
        onPress={() => console.log('Log Out')}
        style={styles.button}
      >
        <ButtonText>Log Out</ButtonText>
      </Button>
      <Button
        size="md"
        variant="solid"
        action='negative'
        onPress={() => console.log('Delete Account')}
        style={styles.button}
      >
        <ButtonText>Delete Account</ButtonText>
      </Button>
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
