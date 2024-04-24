import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, ActivityIndicator, Alert, FlatList, Pressable } from 'react-native';
import {
  Modal,
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
  ButtonText,
  CloseIcon,
  Icon,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Center,
  SectionList
} from '@gluestack-ui/themed';
import { supabase } from '../../utils/supabase'; 
import {  router, useLocalSearchParams, useNavigation } from 'expo-router';

type Profile = {
  bio: string;
  avatarUrl: string | null;
  firstName: string;
  lastName: string;
  num_groups: number;
};


export default function searchAccountScreen () {
    const navigation = useNavigation();
    const items = useLocalSearchParams()
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showGroups, setShowGroups] = useState(false);
    const [groups, setGroups] = useState<{ group_id: string, name: string, bio: string, num_members: number }[]>([]);
    const [taggedPosts, setTaggedPosts] = useState<any[]>([]);

    console.log("ITEMS:", items)

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
                    .select('bio, avatar_url, first_name, last_name, num_groups')
                    .eq('user_id', items.id)
                    .single();

                    if (error) {
                        throw error;
                    }

                    if (!data) {
                        throw new Error('Profile not found');
                    }

                    const { data: groups, error: groupsError } = await supabase
                    .from('group_users')
                    .select('group_id')
                    .eq('profile_id', items.id);
        
                    if (groupsError) {
                      console.log(groupsError);
                      return;
                    }
                    console.log("GROUPS", groups)
                    
                    const groupIds = groups.map(group => group.group_id);
                    
                    const { data: userData, error: userError } = await supabase
                      .from('groups')
                      .select('group_id, name, bio, num_members')
                      .in('group_id', groupIds);
                    
                    if (userError) {
                      console.log(userError);
                    } else {
                      console.log(userData);
                    }
                    setGroups(userData as { group_id: string, name: string, bio: string, num_members: number }[]);

                    // Fetch posts that are in these groups
                    const { data: postsData, error: postsError } = await supabase
                      .from('posts')
                      .select('*')
                      .in('group_id', groupIds);

                    if (postsError) {
                      console.log(postsError);
                      return;
                    }

                    console.log("POSTS, items.id", postsData, items.id)

                    // Filter posts to only include ones where the user is tagged
                    const userTaggedPosts = postsData.filter(post => post.tags && post.tags.includes(items.id));
                    // Fetch group names for each group_id in userTaggedPosts

                    if (userTaggedPosts.length > 0) {
                    const groupNames = await Promise.all(userTaggedPosts.map(async (post) => {
                      const { data: groupData, error: groupError } = await supabase
                        .from('groups')
                        .select('name')
                        .eq('group_id', post.group_id)
                        .single();

                      if (groupError) {
                        console.log(groupError);
                        return 'Unknown Group';
                      }

                      return groupData.name;
                    }));
                    
                    // Add group name to each post
                    const postsWithGroupNames = userTaggedPosts.map((post, index) => ({
                      ...post,
                      groupName: groupNames[index],
                    }));

                    // Group postsWithGroupNames by groupName
                    const groupedPosts = postsWithGroupNames.reduce((groups, post) => {
                      (groups[post.groupName] = groups[post.groupName] || []).push(post);
                      return groups;
                    }, {});

                    // Map each group to an object with a title and data property
                    const sections = Object.entries(groupedPosts).map(([groupName, posts]) => ({
                      title: groupName,
                      data: posts,
                    }));
                    setTaggedPosts(sections);
                    }

                    setProfile({
                        bio: data?.bio ?? "Hi! I'm new to Campfire!",
                        avatarUrl: data?.avatar_url,
                        firstName: data?.first_name ?? '',
                        lastName: data?.last_name ?? '',
                        num_groups: data?.num_groups ?? 0,
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
            0
          </Heading>
          <Text size="xs">Followers</Text>
        </VStack>
        <Pressable onPress={() => setShowGroups(true)}>
        <VStack
          alignItems="center"
        >
          <Heading size="xs" fontFamily="$heading">
            {groups.length}
          </Heading>
          <Text size="xs">Groups</Text>
      </VStack>
      </Pressable>
        </HStack>

      </Box>
      <Divider style={styles.divider} />
      
      {taggedPosts && taggedPosts.length > 0 ? (
      <Text justifyContent='center' mb={"$1"}>
        Tagged Posts: {taggedPosts.length}
      </Text>
      ) : 
      (
      <Text justifyContent='center' mb={"$1"}>
        No Tagged Posts
      </Text>
      )}

      {taggedPosts && taggedPosts.length > 0 && (
        
      <View style={{flex: 1, height: '100%', width: '100%'}}>
      <SectionList
        stickySectionHeadersEnabled={false}
        sections={taggedPosts}
        keyExtractor={(item : any, index) => item.post_id}
        renderItem={({ item }: { item: any }) => (
          <Pressable onPress={() => {
            console.log("POST GROUP ID", item.group_id)
            router.push({
              pathname: "/group/[id]",
              params: {id: item.group_id}
            })
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: item.media_url }}
              style={{ width: 50, height: 50, marginRight: 10 }}
            />
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ flex: 1 }}>
              {item.post_caption}
            </Text>
          </View>
          </Pressable>
        )}
        renderSectionHeader={({ section }: { section: any }) => (
          <Center>
            <Heading fontSize="$xl" mt="$8" pb="$4">
              {section.title}
            </Heading>
          </Center>
        )}
      />
    </View>
      )}

      <Modal
				isOpen={showGroups}
				onClose={() => {
				setShowGroups(false)
				}}
					>
						<ModalBackdrop />
						<ModalContent>
						<ModalHeader>
							<Heading size="lg"> Members </Heading>
							<ModalCloseButton>
							<Icon as={CloseIcon} />
							</ModalCloseButton>
						</ModalHeader>
						<ModalBody horizontal={true} scrollEnabled={false} style={{width: '100%'}} 
            >
            <View style={{flex: 1, width: '100%'}}>
    <FlatList 
      style={{ flexGrow: 1 }}
      data={groups}
      renderItem={({ item }) => (
        <Pressable onPress={() => {
          setShowGroups(false)
          console.log("GROUP ID", item.group_id, item.name, item.bio)
          router.push({
              pathname: "/group/[id]",
              params: {id: item.group_id, name: item.name, bio: item.bio}
          })
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
          <AvatarImage
              source={{
                  uri: "https://source.unsplash.com/BdTtvBRhOng"
              }}
              alt="https://source.unsplash.com/BdTtvBRhOng"
          />
      </Avatar>
          <VStack paddingLeft={10}>
              <Text
              color="$coolGray800"
              fontWeight="$bold"
              $dark-color="$warmGray100"
              >
                  {item.name}
              </Text>
              <Text color="$coolGray600" $dark-color="$warmGray200">
                  {item.bio}
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
							onPress={() => {
								setShowGroups(false)
							}}
							>
							<ButtonText>Cancel</ButtonText>
							</Button>
						</ModalFooter>
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
