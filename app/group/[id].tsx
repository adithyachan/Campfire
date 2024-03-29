import {
  Button, ButtonIcon, ButtonText,
  Heading, ShareIcon, Text, VStack, 
  Pressable, Box, ScrollView, 
  Image, Card, HStack, Fab, FabIcon, FabLabel,
  AddIcon,
  Spinner
} from "@gluestack-ui/themed";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CreatePostModal from "./createPostModal";
import PostCard from "~/components/postCard";
import ShareGroupModal from "./shareGroupModal";
import ShowMembersModal from "./showMembersModal";
import LeaveGroupModal from "./leaveGroupModal";

type Profile = { 
  user_id: string, 
  first_name: string, 
  last_name: string, 
  username: string, 
  bio: string, 
  avatar_url: string 
};

type Group = { 
  group_id: string, 
  name: string, 
  bio: string, 
  code: string, 
  admin: string, 
  num_members: number 
}


export default function GroupScreen() {
  const navigation = useNavigation()
  const routeParams = useLocalSearchParams();

  // Modal state handlers
  const [showShare, setShowShare] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  // group related data
  const groupID = routeParams.id;
  const [groupPosts, setGroupPosts] = useState<any[]>([])
  const [groupMembers, setGroupMembers] = useState<Profile[]>([])
  const [groupData, setGroupData] = useState<Group>()
  const [membershipData, setMembershipData] = useState<string[]>([])
  const [groupCode, setGroupCode] = useState('')

  // Visiting user related data
  const [isMember, setIsMember] = useState(false)
  const [subscribers, setSubscribers] = useState<string[]>([])
  const [userId, setUserId] = useState<string>('')

  const [leaveConfirmationVisible, setLeaveConfirmationVisible] = useState(false)

  const [loadingMemberList, setLoadingMemberList] = useState(true)
  const [loadingGroupCode, setLoadingGroupCode] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [loadingCheckMembership, setLoadingCheckMembership] = useState(true)
  const [loadingSubscribers, setLoadingSubcribers] = useState(true)
  

  ////// Database Queries ///////
  const getCurrentUserID = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user == null) {
      throw new Error("USER ERROR - current user not found")
    }

    setUserId(user.id)
    return user.id
  }

  // Sets array of user data for all users in the group
  const getMembers = async () => {
    try {
      const profileColumns = 'user_id, first_name, last_name, username, bio, avatar_url';
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select(profileColumns)
        .in('user_id', await getMemberIDs());

      if (userError) {
        throw new Error(userError.message)
      } else {
        console.log(userData);
      }
      setGroupMembers(userData as Profile[]);
      setLoadingMemberList(false);
    }
    catch (error) {
      throw error
    }
  }
  // Returns list of userIDs in the group. Helper for getMembers()
  const getMemberIDs = async () => {
    const { data: usersInGroup, error: uigError } = await supabase
        .from('group_users')
        .select('profile_id')
        .eq('group_id', groupID);

      if (uigError) {
        throw new Error("USERINGROUP - " + uigError.message)
      }

      return usersInGroup.map(user => user.profile_id);
  }

  // Retrieves the group share code
  const getCode = async () => {
    const { data: groupData, error: errorCode } = await supabase
      .from('groups')
      .select('*')
      .eq('group_id', groupID)
      .single();

    if (errorCode) {
      throw new Error("GET CODE - " + errorCode.message);
    }

    // console.log(groupData)
    setGroupCode(groupData?.code)
    setGroupData(groupData as Group);
    setLoadingGroupCode(false);
  }

  // Retrieves all posts associated with the group
  const getPosts = async () => {
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("group_id", groupID)

    if (postError) {
      throw new Error(postError.message)
    }

    setGroupPosts(postData!)
    setLoadingPosts(false)
  }

  // Retrieves all the subscribers of the group
  const getSubscribers = async () => {
    const { data: subData, error: subError } = await supabase
        .from("profile_subscriptions")
        .select("profile_id")
        .eq("group_id", groupID)

    if (subError) {
      throw new Error(subError.message)
    }

    console.log(subData.map((p) => p.profile_id))
    setSubscribers(subData.map((p) => p.profile_id))
    setLoadingSubcribers(false)
  }

  const checkMembership = async () => {
    const { data: membershipData, error: membershipError } = await supabase
      .from('group_users')
      .select('profile_id')
      .eq('group_id', groupID);

    if (membershipError) {
      throw new Error("MEMBERSHIP ERROR - " + membershipError.message)
    }

    setMembershipData(membershipData.map((member) => member.profile_id))
    setIsMember(membershipData.map((member) => member.profile_id).includes(await getCurrentUserID()));
    setLoadingCheckMembership(false)
  }

  const handleSubscribe = async () => {
    const { error } = await supabase
      .from('profile_subscriptions')
      .insert({ 
        profile_id: userId,
        group_id: groupID 
      })

    getSubscribers()

    if (error) {
      console.log('SUBSCRIBE ERROR - ' + error.message)
    }
  }

  const handleUnsubscribe = async () => {
    const { error } = await supabase
      .from('profile_subscriptions')
      .delete()
      .match({ profile_id: userId, group_id: groupID })

    getSubscribers()

    if (error) {
      console.log('UNSUBSCRIBE ERROR - ' + error.message)
    }
  }

  const handleLeaveGroup = async () => {
    const { error } = await supabase
      .from('group_users')
      .delete()
      .match({ profile_id: userId, group_id: groupID });

    if (error) {
      console.error('LEAVE GROUP ERROR - ' + error.message);
    } else {
      await AsyncStorage.setItem('refreshGroups', 'true');
      router.navigate("groups");
    }
  };

    ////// Components //////
    const shareButton =  
    <Button 
      variant="link" 
      onPress={ () => 
        setShowShare(true)
      }
    >
      <ButtonIcon as={ShareIcon} />
    </Button>
  
  const leaveGroupButton = 
    <Button 
      size="md" 
      variant="link" 
      action="negative" 
      onPress={() => {
        setLeaveConfirmationVisible(true)
      }}>
      <ButtonText>Leave Group</ButtonText>
    </Button>
  
  const unsubscribeButton = 
    <Button 
      size="md" 
      variant="solid" 
      action="negative" 
      onPress={
        handleUnsubscribe
      }
    >
      <ButtonText>Unsubscribe</ButtonText>
    </Button>
   
  const subscribeButton = 
    <Button 
      alignItems="center" 
      size="md" 
      variant="solid" 
      action="primary" 
      onPress={
        handleSubscribe
      }
    >
      <ButtonText>Subscribe</ButtonText>
    </Button>

  const loadingSpinner = 
  <Box 
    w="$full" 
    h="$full" 
    justifyContent="center" 
    alignItems="center"
  >
    <Spinner size="large" />
  </Box>
  
  const CreatePostFAB = () => {
    return (
      <Fab
        size="md"
        mb="$10"
        placement="bottom right"
        isHovered={false}
        isDisabled={false}
        isPressed={false}
        onPress={() => { setShowCreate(true) }}
      >
        <FabIcon as={AddIcon} mr="$1" />
        <FabLabel>Create Post</FabLabel>
      </Fab>
    )
  }

  const GroupPageHeader = () => {
    return (
      <Card width={"$full"} size="lg" variant="ghost" p={"$0"} >
        <Image
          w={"$full"}
          h={"$1/2"}
          source={{
            uri: "https://source.unsplash.com/f9bkzNQyylg"
          }}
          alt="Image of Campfire"
        />
        <Box flexDirection="row" justifyContent="space-between" p={"$3"}>
          <VStack>
            <Heading size="xl" mb="$1">
              {routeParams.name}
            </Heading>
            <Text size="sm" >
              {routeParams.bio}
            </Text>
          </VStack>
          <GroupActionButton />
        </Box>
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
                { groupPosts ? groupPosts.length : 0 }
              </Heading>
              <Text size="xs">posts</Text>
            </VStack>
            <VStack
              alignItems="center"
            >
              <Heading size="xs" fontFamily="$heading">
                { subscribers.length }
              </Heading>
              <Text size="xs">followers</Text>
            </VStack>
            <Pressable onPress={() => setShowMembers(true)}>
              <VStack
                alignItems="center"
              >

                <Heading size="xs" fontFamily="$heading">
                  { membershipData.length }
                </Heading>
                <Text size="xs">Members</Text>

              </VStack>
            </Pressable>
          </HStack>
        </Box>
      </Card>
    );
  }

  const GroupActionButton = () => {
    return (
      <Box alignItems="center" justifyContent="center" my="$4">
        {
          isMember ?
            leaveGroupButton :
          subscribers.length !== 0 && subscribers.includes(userId) ?
            unsubscribeButton :
          subscribeButton
        }
      </Box>
    );
  }

  const GroupPostCards = () => {
    return (
      <Box>
        {
          groupPosts ? groupPosts.map((post) =>
            <PostCard postData={ post } key={ post.id }/>
          ) : null
        }
      </Box>
    )
  }



  ///// Misc Functions /////
  const setTitle = () => {
    if (routeParams.first) {
      alert('Welcome to ' + routeParams.name);
    }

    navigation.setOptions({
      headerTitle: routeParams.name,
      headerBackTitle: 'Home',
      headerRight: () => (
        isMember ? shareButton : null
      )
    });
  }

  useEffect(() => {
    setTitle();

    try {
      getCurrentUserID()
      checkMembership()
      getCode()
      getMembers()
      getPosts()
      getSubscribers()
    } catch (error) {
      // @ts-ignore
      console.log(error.message)
    }
  }, [])

  return (
    <>
      {(loadingCheckMembership || 
      loadingGroupCode || 
      loadingMemberList || 
      loadingPosts ||
      loadingSubscribers) ? loadingSpinner : 
      <Box h="$full">
        <ScrollView>
          <GroupPageHeader />
          { isMember && groupPosts && <GroupPostCards /> }
          { isMember && 
            <ShareGroupModal 
              isOpen={ showShare } 
              onClose={ () => 
                setShowShare(false)
              } 
              groupCode={ groupCode }
            /> 
          }
          <ShowMembersModal 
            isOpen={ showMembers } 
            onClose={ () => 
              setShowMembers(false) 
            } 
            groupMembers={ groupMembers } 
          />
          <LeaveGroupModal 
            isOpen={ leaveConfirmationVisible }
            onClose={ () => 
              setLeaveConfirmationVisible(false)
            }
            handleLeaveGroup={ handleLeaveGroup }
          />
          <CreatePostModal 
            isOpen={showCreate} 
            onClose={() => { 
              setShowCreate(false) 
            }} 
            groupID={ groupID as string } 
          />
        </ScrollView>
        {isMember && <CreatePostFAB />}
      </Box>
      }
    </>
  );
}