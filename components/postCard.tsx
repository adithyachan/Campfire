import { Box, Card, HStack, Image, VStack, Text, Spinner, Heading, Avatar, AvatarImage, AvatarBadge, AvatarFallbackText, Icon, Button, ButtonIcon } from "@gluestack-ui/themed";
import { HeartIcon } from "lucide-react-native";
import { useState, useEffect } from "react";
import { supabase } from "~/utils/supabase";

const myDateParse = (s: string) => {
  let b = s.split(/\D/);
  // @ts-ignore
  --b[1];                  // Adjust month number
  b[6] = b[6].substr(0,3); // Microseconds to milliseconds
  // @ts-ignore
  return new Date(Date.UTC(...b));
}

export default function PostCard(props: { postData: { post_id: string, user_id: string, group_id: string, media_url: string, post_caption: string, created_at: string } }) {

  const postData = props.postData

  const [posterData, setPosterData] = useState<{ username: string, 
                                                 avatar_url: string }>()
  const [loadingPosterData, setLoadingPosterData] = useState(true)

  const [posterGroupData, setPosterGroupData] = useState<string>()
  const [loadingGroupData, setLoadingGroupData] = useState(true)

  const [likeData, setLikeData] = useState<string[]>()
  const [loadingLikeData, setLoadingLikeData] = useState(true)

  const [comments, setComments] = useState<{ user_id: string, 
                                             created_at: string, 
                                             comment_text: string }[]>()
  const [loadingComments, setLoadingComments] = useState(true)

  const getPosterData = async () => {
    const { data: posterData, error: posterError } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("user_id", postData.user_id)
      .single()

    if (posterError) {
      throw new Error("POSTER DATA ERROR - " + posterError.message)
    }

    console.log(posterData)

    setPosterData(posterData as unknown as { username: string, avatar_url: string })
    setLoadingPosterData(false)
  }

  const getPosterGroupData = async () => {
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .select("name")
      .eq("group_id", postData.group_id)
      .single()

    if (groupError) {
      throw new Error("GROUP DATA ERROR - " + groupError.message)
    }

    console.log(groupData)
    setPosterGroupData(groupData.name)
    setLoadingGroupData(false)
  }

  const getLikeData = async () => {
    const { data: likeData, error: likeError } = await supabase
      .from("post_likes")
      .select("user_id")
      .eq("post_id", postData.post_id)

    if (likeError) {
      throw new Error("LIKE DATA ERROR - " + likeError.message)
    }

    console.log(likeData)
    setLikeData(likeData.map((e) => e.user_id))
    setLoadingLikeData(false)
  }

  const getCommentData = async () => {
    const { data: commentData, error: commentError } = await supabase
      .from("post_comments")
      .select("user_id, created_at, comment_text")
      .eq("post_id", postData.post_id)

    if (commentError) {
      throw new Error("COMMENT DATA ERROR - " + commentError.message)
    }

    console.log(commentData)
    setComments(commentData)
    setLoadingComments(false)
  }

  const loadingSpinner = 
    <Box 
      w="$full" 
      h="$full" 
      justifyContent="center" 
      alignItems="center"
    >
      <Spinner size="large" />
    </Box>

  useEffect(() => {
    try {
      getPosterData()
      getPosterGroupData()
      getLikeData()
      getCommentData()
    } catch (error) {
      // @ts-ignore
      console.log(error.message)
    }
  }, [])

  return (
    <Card m="$5" px="$0" pb="$1">
      { 
        (loadingPosterData || loadingGroupData || loadingLikeData|| loadingComments) ? loadingSpinner :
        <VStack>
          <HStack mx="$5" mb="$3">
            <Box w="$full" flexDirection="row" justifyContent="space-between">
              <HStack space="md">
                <Avatar>
                  <AvatarFallbackText>{ posterData?.username }</AvatarFallbackText>
                  <AvatarImage alt="avatar image" source={{ uri: posterData?.avatar_url }} />
                </Avatar>
                <VStack>
                  <Heading size="sm">{ posterData?.username }</Heading>
                  <Text size="sm">{ posterGroupData }</Text>
                </VStack>
              </HStack>
              <Button variant="link">
                <ButtonIcon 
                  size="xl"
                  as={HeartIcon} 
                />
              </Button>
            </Box>
          </HStack>
          <Box w="$full" justifyContent="center" alignItems="center">
            <Image alt="post image" w="$full" size="2xl" source={{ uri: props.postData.media_url }} />
          </Box>
          <Box>
            <Text>{ props.postData.post_caption }</Text>
          </Box>
          <HStack direction="rtl">
            <Text size="2xs">{ myDateParse(props.postData.created_at).toUTCString() }</Text>
          </HStack>
        </VStack> 
      }
    </Card>
  );
}