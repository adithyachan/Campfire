import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import {
  Divider,
  Text,
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  HStack,
  Button,
  VStack,
  Heading,
  Box,
} from '@gluestack-ui/themed';
import { supabase } from '../../utils/supabase'; 
import {  useLocalSearchParams, useNavigation } from 'expo-router';

type Profile = {
  bio: string;
  avatarUrl: string | null;
  firstName: string;
  lastName: string;
};

export default function searchAccountScreen () {
    const navigation = useNavigation();
    const items = useLocalSearchParams()
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    console.log(items)
    useEffect(() => {

        navigation.setOptions({ 
            headerTitle: "Account",
            headerBackTitle: 'Home',
          });

            const fetchProfile = async () => {
                setLoading(true);
                try {
                    const { data, error } = await supabase
                    .from('profiles')
                    .select('bio, avatar_url, first_name, last_name')
                    .eq('user_id', items.id)
                    .single();

                    if (error) {
                        throw error;
                    }

                    if (!data) {
                        throw new Error('Profile not found');
                    }

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
          <AvatarImage source={{ uri: profile.avatarUrl }} alt="Profile picture"/>
        ) : (
          <AvatarFallbackText>{`${profile.firstName} ${profile.lastName}`}</AvatarFallbackText>
        )}
      </Avatar>

      <Text style={styles.bio}>
        {profile.bio}
      </Text>

      <Box
        my="$3"
        sx={{
          flexDirection: "row",
        }}
      >
        <HStack width={"$full"} justifyContent="space-evenly">
        <VStack
          alignItems="center"
        >
          <Heading size="xs" fontFamily="$heading">
            200
          </Heading>
          <Text size="xs">Followers</Text>
        </VStack>
        <VStack
          alignItems="center"
        >
          <Heading size="xs" fontFamily="$heading">
            12
          </Heading>
          <Text size="xs">Groups</Text>
      </VStack>
        </HStack>

      </Box>
      <Divider style={styles.divider} />


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
