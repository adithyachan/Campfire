import {
  Box,
  Card,
  HStack,
  Image,
  VStack,
  Text,
  Spinner,
  Heading,
  Avatar,
  AvatarImage,
  AtSignIcon,
  AvatarFallbackText,
  Icon,
  Button,
  ButtonIcon,
  StarIcon,
  ButtonText,
  MessageCircleIcon,
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  ScrollView,
  CloseIcon,
  Pressable,
  Menu,
  MenuItem,
  MenuItemLabel,
  MenuIcon,
} from '@gluestack-ui/themed';
import { useState, useEffect } from 'react';
import { supabase } from '~/utils/supabase';
import CommentModal from './commentModal';
import ConfirmDeleteModal from './confirmDeleteModal';
import { router } from 'expo-router';
import ShowTaggedModal from './showTaggedModal';
import UpdatePostModal from './updatePostModal';
import { ArrowDown10, ArrowUpDownIcon, DotIcon, EditIcon } from 'lucide-react-native';

const myDateParse = (s: string) => {
  let b = s.split(/\D/);
  // @ts-ignore
  --b[1]; // Adjust month number
  b[6] = b[6].substr(0, 3); // Microseconds to milliseconds
  // @ts-ignore
  return new Date(Date.UTC(...b));
};

export default function PostCard(props: {
  postData: {
    post_id: string;
    user_id: string;
    group_id: string;
    media_url: string;
    post_caption: string;
    created_at: string;
    city: string;
    show_location: boolean;
    partner_id: string;
    partner_username: string;
  };
  updatePosts: () => void;
}) {
  const [postData, setPostData] = useState(props.postData);

  const [userID, setUserID] = useState<string>();
  const [loadingUserID, setLoadingUserID] = useState(true);

  const [posterData, setPosterData] = useState<{ username: string; avatar_url: string }>();
  const [loadingPosterData, setLoadingPosterData] = useState(true);

  const [posterGroupData, setPosterGroupData] = useState<string>();
  const [loadingGroupData, setLoadingGroupData] = useState(true);

  const [likeData, setLikeData] = useState<string[]>();
  const [loadingLikeData, setLoadingLikeData] = useState(true);

  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  const [comments, setComments] =
    useState<
      { user_id: string; created_at: string; comment_text: string; username: string; id: string }[]
    >();
  const [loadingComments, setLoadingComments] = useState(true);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showConfirmDeleteCommentModal, setShowConfirmDeleteCommentModal] = useState(false);

  const [showTaggedModal, setShowTaggedModal] = useState(false);
  const [taggedUserIDs, setTaggedUserIDs] = useState([]);

  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const menuButton = (
    <Menu
      placement="bottom"
      selectionMode="single"
      closeOnSelect={true}
      borderRadius={'$xl'}
      mx={'$2'}
      trigger={({ ...triggerProps }) => {
        return (
          <Button {...triggerProps} variant="link" margin={10}>
            <ButtonIcon as={MenuIcon} />
          </Button>
        );
      }}>
      <MenuItem textValue="Create a group" onPress={() => setShowUpdateModal(true)}>
        <Icon as={EditIcon} size="sm" mr="$2" />
        <MenuItemLabel size="sm">Edit</MenuItemLabel>
      </MenuItem>
      {postData.user_id === userID && (
        <MenuItem textValue="Delete post" onPress={() => setShowConfirmDeleteModal(true)}>
          <Icon as={TrashIcon} size="sm" mr="$2" />
          <MenuItemLabel size="sm">Delete</MenuItemLabel>
        </MenuItem>
      )}
    </Menu>
  );

  const getCurrentUser = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw new Error('CURRENT USER DATA ERROR - ' + userError.message);
    }

    setUserID(user?.id);
    setLoadingUserID(false);
  };

  const getPosterData = async () => {
    const { data: posterData, error: posterError } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('user_id', postData.user_id)
      .single();

    if (posterError) {
      throw new Error('POSTER DATA ERROR - ' + posterError.message);
    }

    console.log(posterData);

    setPosterData(posterData as unknown as { username: string; avatar_url: string });
    setLoadingPosterData(false);
  };

  const getPosterGroupData = async () => {
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('name')
      .eq('group_id', postData.group_id)
      .single();

    if (groupError) {
      throw new Error('GROUP DATA ERROR - ' + groupError.message);
    }

    console.log(groupData);
    setPosterGroupData(groupData.name);
    setLoadingGroupData(false);
  };

  const handleDeletePost = async () => {
    const { error } = await supabase.from('posts').delete().match({ post_id: postData.post_id });

    if (error) {
      console.error('ERROR DELETING POST - ' + error.message);
    } else {
      props.updatePosts();
      setShowConfirmDeleteModal(false);
      alert('Post deleted successfully');
    }
  };

  const getLikeData = async () => {
    const { data: likeData, error: likeError } = await supabase
      .from('post_likes')
      .select('user_id')
      .eq('post_id', postData.post_id);

    if (likeError) {
      throw new Error('LIKE DATA ERROR - ' + likeError.message);
    }

    console.log(likeData);
    setLikeData(likeData.map((e) => e.user_id));
    setLoadingLikeData(false);
  };

  const getCommentData = async () => {
    const { data: commentData, error: commentError } = await supabase
      .from('post_comments')
      .select('user_id, created_at, comment_text, username, id')
      .eq('post_id', postData.post_id);

    if (commentError) {
      throw new Error('COMMENT DATA ERROR - ' + commentError.message);
    }

    console.log(commentData);
    setComments(commentData);
    setLoadingComments(false);
  };

  const likePost = async () => {
    const { error: likeError } = await supabase
      .from('post_likes')
      .insert({ post_id: postData.post_id, user_id: userID });

    if (likeError) {
      throw new Error('ERROR LIKING POST - ' + likeError.message);
    }

    getLikeData();
  };

  const unlikePost = async () => {
    const { error: likeError } = await supabase
      .from('post_likes')
      .delete()
      .match({ post_id: postData.post_id, user_id: userID });

    if (likeError) {
      throw new Error('ERROR LIKING POST - ' + likeError.message);
    }

    getLikeData();
  };

  const handleCommentSubmit = async (comment: string) => {
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', userID)
      .single();

    if (userError) {
      throw new Error('USERNAME ERROR - ' + userError.message);
    }

    const { error: commentError } = await supabase.from('post_comments').insert({
      user_id: userID,
      post_id: postData.post_id,
      comment_text: comment,
      username: userData.username,
    });

    if (commentError) {
      throw new Error('COMMENT SUBMISSION ERROR - ' + commentError.message);
    }

    setShowCommentModal(false);
    getCommentData();
  };

  const handleCommentDeleteFunGen = (c: {
    user_id: string;
    created_at: string;
    comment_text: string;
    username: string;
    id: string;
  }) => {
    return async () => {
      const { error: commentError } = await supabase.from('post_comments').delete().eq('id', c.id);

      if (commentError) {
        throw new Error('COMMENT DELETION ERROR - ' + commentError.message);
      }

      getCommentData();
      setShowConfirmDeleteCommentModal(false);
    };
  };

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('tags')
      .eq('post_id', postData.post_id)
      .single();

    if (error) {
      console.error('Error fetching tags:', error.message);
      return;
    }

    setTaggedUserIDs(data.tags);
  };

  const loadingSpinner = (
    <Box w="$full" h="$full" justifyContent="center" alignItems="center">
      <Spinner size="large" />
    </Box>
  );

  useEffect(() => {
    try {
      getCurrentUser();
      getPosterData();
      getPosterGroupData();
      getLikeData();
      getCommentData();
    } catch (error) {
      // @ts-ignore
      console.log(error.message);
    }
  }, []);

  return (
    <Card m="$5" px="$0" pb="$1">
      {loadingUserID ||
      loadingPosterData ||
      loadingGroupData ||
      loadingLikeData ||
      loadingComments ? (
        loadingSpinner
      ) : (
        <VStack>
          <HStack mx="$5" mb="$3">
            <Box w="$full" flexDirection="row" justifyContent="space-between" alignItems="center">
              <Pressable onPress={() => router.push(`/account/${postData.user_id}`)}>
                <HStack space="md">
                  <Avatar>
                    <AvatarFallbackText>{posterData?.username}</AvatarFallbackText>
                    <AvatarImage alt="avatar image" source={{ uri: posterData?.avatar_url }} />
                  </Avatar>
                  <VStack>
                    <Heading size="sm">{`${posterData?.username}${postData.partner_username ? ' + ' + postData?.partner_username : ''}`}</Heading>
                    <Text size="sm">{posterGroupData}</Text>
                    {props.postData.show_location && <Text size="sm">{props.postData.city}</Text>}
                  </VStack>
                </HStack>
              </Pressable>
              <HStack alignItems="center">
                <Button
                  variant={`solid`}
                  borderColor={userID && likeData && likeData.includes(userID) ? `$yellow500` : ''}
                  bgColor={userID && likeData && likeData.includes(userID) ? `$yellow200` : `white`}
                  borderRadius="$full"
                  onPress={async () => {
                    if (likeData!.includes(userID!)) {
                      await unlikePost();
                    } else {
                      await likePost();
                    }
                  }}>
                  <ButtonIcon size="xl" color="$yellow500" as={StarIcon} />
                  <ButtonText ml="$1" color="$yellow500">
                    {likeData ? likeData.length : 0}
                  </ButtonText>
                </Button>
                {postData.user_id == userID ? menuButton : null}
              </HStack>
            </Box>
          </HStack>
          <Box w="$full" justifyContent="center" alignItems="center">
            <Image
              alt="post image"
              w="$full"
              size="2xl"
              source={{ uri: props.postData.media_url }}
            />
          </Box>
          <Box flexDirection="row" justifyContent="space-between" mx="$3" mt="$2">
            <HStack mt="$3" alignItems="center">
              <Heading size="sm">{`${posterData?.username} ~ `}</Heading>
              <Text size="sm">{props.postData.post_caption}</Text>
            </HStack>
            <HStack alignItems="center" space="sm">
              <Button
                size="xs"
                variant="solid"
                action="secondary"
                onPress={() => {
                  fetchTags();
                  setShowTaggedModal(true);
                }}>
                <ButtonIcon size="xl" as={AtSignIcon} />
              </Button>
              <Button
                size="xs"
                variant="solid"
                action="secondary"
                onPress={() => setShowCommentModal(true)}>
                <ButtonIcon size="xl" as={MessageCircleIcon} />
              </Button>
            </HStack>
          </Box>
          <Accordion
            m="$0.5"
            width="90%"
            size="md"
            variant="unfilled"
            type="single"
            isCollapsible={true}>
            <AccordionItem value="a">
              <AccordionHeader>
                <AccordionTrigger>
                  {({ isExpanded }) => {
                    return (
                      <>
                        <Text size="xs">View Comments</Text>
                        {isExpanded ? (
                          <AccordionIcon size="xs" as={ChevronUpIcon} />
                        ) : (
                          <AccordionIcon size="xs" as={ChevronDownIcon} />
                        )}
                      </>
                    );
                  }}
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <ScrollView>
                  <VStack>
                    {comments?.map((c) => (
                      <Pressable
                        onPress={async () => {
                          if (userID === c.user_id) {
                            router.push({
                              pathname: '/account',
                            });
                            return;
                          } else {
                            router.push({
                              pathname: '/account/[id]',
                              params: { id: c.user_id ?? '' },
                            });
                            return;
                          }
                        }}>
                        <Box
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                          key={c.id}>
                          <HStack mt="$3" alignItems="center">
                            <Heading size="sm">{`${c.username} ~ `}</Heading>
                            <Text size="sm">{c.comment_text}</Text>
                          </HStack>
                          {c.user_id == userID ? (
                            <>
                              <Button
                                size="xs"
                                variant="link"
                                action="negative"
                                onPress={() => setShowConfirmDeleteCommentModal(true)}>
                                <ButtonIcon as={CloseIcon} />
                              </Button>
                              <ConfirmDeleteModal
                                isOpen={showConfirmDeleteCommentModal}
                                onClose={() => setShowConfirmDeleteCommentModal(false)}
                                handleSubmit={handleCommentDeleteFunGen(c)}
                              />
                            </>
                          ) : null}
                        </Box>
                      </Pressable>
                    ))}
                  </VStack>
                </ScrollView>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <HStack direction="rtl">
            <Text size="2xs">{myDateParse(props.postData.created_at).toUTCString()}</Text>
          </HStack>
        </VStack>
      )}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        handleSubmit={handleCommentSubmit}
      />
      <ShowTaggedModal
        isOpen={showTaggedModal}
        onClose={() => setShowTaggedModal(false)}
        taggedUserIDs={taggedUserIDs}
      />
      <UpdatePostModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          props.updatePosts();
        }}
        postData={props.postData}
        tagged_userIDs={taggedUserIDs}
      />
      <ConfirmDeleteModal
        isOpen={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        handleSubmit={handleDeletePost}
      />
    </Card>
  );
}
