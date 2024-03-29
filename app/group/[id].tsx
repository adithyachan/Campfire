import {
  Button, ButtonIcon, ButtonText,
  Heading, ShareIcon, Text, VStack, 
  Pressable, Box, ScrollView, 
  Image, Card, HStack, Fab, FabIcon, FabLabel,
  AddIcon,Spinner
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
import ManageGroupModal from "./manageGroupModal";

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
  const [manageGroupModalVisible, setManageGroupModalVisible] = useState(false);

  // group related data
  const groupID = routeParams.id;
  const [groupPosts, setGroupPosts] = useState<any[]>([])
  const [groupMembers, setGroupMembers] = useState<Profile[]>([])
  const [groupData, setGroupData] = useState<Group>()
  const [membershipData, setMembershipData] = useState<string[]>([])
  const [groupCode, setGroupCode] = useState('')
  const [isGroupPublic, setIsGroupPublic] = useState(false);

  // Visiting user related data
  const [isMember, setIsMember] = useState(false)
  const [subscribers, setSubscribers] = useState<string[]>([])
  const [userId, setUserId] = useState<string>('')
  const isCurrentUserAdmin = userId === groupData?.admin;
  const [isBanned, setIsBanned] = useState(false);
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
    setIsGroupPublic(groupData?.public_profile);
    setIsBanned(groupData?.banlist?.includes(userId));
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
      
      const { data: dU, error: eU } = await supabase.rpc('increment_group_member_count', {x: -1, id: groupID});

      if (eU) {
        console.log("Failed to update num_groups:", eU.message);
      } else {
        console.log("num_groups updated successfully:", dU);
      }

    if (error) {
      console.error('LEAVE GROUP ERROR - ' + error.message);
    } else {
      await AsyncStorage.setItem('refreshGroups', 'true');
      router.navigate("groups");
    }
  };

  const handleBanMember = async (profileId: string) => {
    try {
      const { error: kickError } = await supabase
        .from('group_users')
        .delete()
        .match({ profile_id: profileId, group_id: groupID});
  
      if (kickError) {
        throw kickError;
      }
  
      if (!groupData) {
        console.error('Group data is not available.');
        alert('Group data is not available.');
        return;
      }
  
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('banlist')
        .eq('group_id', groupID)
        .single();
  
      if (groupError) {
        throw groupError;
      }
  
      const updatedBanlist = group.banlist ? [...group.banlist, profileId] : [profileId];
  
      const { error: updateGroupError } = await supabase
        .from('groups')
        .update({ 
          num_members: groupData.num_members - 1,
          banlist: updatedBanlist
        })
        .eq('group_id', groupID);
  
      if (updateGroupError) {
        throw updateGroupError;
      }

      await getMembers();
      setManageGroupModalVisible(false);
      await checkMembership();

      alert('Member has been banned.');
    } catch (error) {
      console.error('Error during ban operation:', error);
      alert('An error occurred while trying to ban the member.');
    }
  };
  
  
  const handleKickMember = async (profileId: string) => {
    try {
      const { error: kickError } = await supabase
        .from('group_users')
        .delete()
        .match({ profile_id: profileId, group_id: groupID});
  
      if (kickError) {
        throw kickError;
      }

      if (!groupData) {
        console.error('Group data is not available.');
        alert('Group data is not available.');
        return;
      }
  
      const { error: updateGroupError } = await supabase
        .from('groups')
        .update({ num_members: groupData.num_members - 1 })
        .match({ group_id: groupID});
  
      if (updateGroupError) {
        throw updateGroupError;
      }
  
      await getMembers();
      setManageGroupModalVisible(false);
      await checkMembership();

      setManageGroupModalVisible(false);
  
      alert('Member has been kicked out.');
    } catch (error) {
      console.error('Error during kick operation:', error);
      alert('An error occurred while trying to kick the member.');
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
      variant="solid" 
      action="negative" 
      isDisabled={isCurrentUserAdmin}
      onPress={() => {
        setLeaveConfirmationVisible(true)
      }}>
      <ButtonText>Leave Group</ButtonText>
    </Button>

  const manageGroupButton = (
    <VStack mt="$4" alignItems="center">
      <Box width={"35%"}>
        {/* Updated Button onPress to directly set manageGroupModalVisible */}
        <Button onPress={() => setManageGroupModalVisible(true)} mt="$2">
          <ButtonText>Manage Group</ButtonText>
        </Button>
      </Box>
      <ManageGroupModal
        isVisible={manageGroupModalVisible}
        onClose={() => setManageGroupModalVisible(false)}
        groupMembers={groupMembers}
        handleKickMember={handleKickMember}
        handleBanMember={handleBanMember}
        groupData={groupData}
      />
    </VStack>
  );
  
  const joinGroupButton = () => {
    if (!isGroupPublic) {
      return null;
    }

    if (isBanned) {
      return (
        <Button 
          size="md" 
          variant="solid" 
          action="negative"
          disabled={true}
        >
          <ButtonText>Banned from Group</ButtonText>
        </Button>
      );
    }
  
    return (
      <Button 
        size="md" 
        variant="solid" 
        action="positive" 
        onPress={async () => {
          try {
            const { error } = await supabase
              .from('group_users')
              .insert([{ group_id: groupID, profile_id: userId }]);
  
            if (error) throw error;
  
            const { data: dU, error: eU } = await supabase.rpc('increment_group_member_count', {x: 1, id: groupID});
  
            if (eU) {
              console.log("Failed to update num_groups:", eU.message);
            }
  
            setIsMember(true);
            checkMembership();
            await AsyncStorage.setItem('refreshGroups', 'true');
          } catch (error) {
            console.error('Error joining group:', error);
            alert('Error joining group');
          }
        }}
      >
        <ButtonText>Join Group</ButtonText>
      </Button>
    );
  };
  
  
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
      <Card width="$full" variant="ghost" p="$0" pb="$10">
        <Image
          w="$full"
          h="$40"
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
          mt="$3"
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
        {isMember ? (
          leaveGroupButton
        ) : subscribers.length !== 0 && subscribers.includes(userId) ? (
          unsubscribeButton
        ) : !isMember && isGroupPublic ? (
          joinGroupButton()
        ) : null}
      </Box>
    );
  };  

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
        <Box>
          <ScrollView>
            <Box h="$full">
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
              {isCurrentUserAdmin && manageGroupButton}
              <CreatePostModal 
                isOpen={showCreate} 
                onClose={() => { 
                  setShowCreate(false) 
                }} 
                groupID={ groupID as string } 
              />
            </Box>
          </ScrollView>
          {isMember && <CreatePostFAB />}
        </Box>
      }
    </>
  );
}