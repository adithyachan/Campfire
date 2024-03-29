import { Box, Card, HStack, Image, VStack, Text } from "@gluestack-ui/themed";

export default function PostCard(props: { postData: { post_id: string, user_id: string, group_id: string, media_url: string, post_caption: string, created_at: string } }) {
  return (
    <Card>
      <VStack>
        <HStack>
          <Text>{ props.postData.created_at }</Text>
        </HStack>
        <Image size="2xl" source={{ uri: props.postData.media_url }} />
        <Box>
          <Text>{ props.postData.post_caption }</Text>
        </Box>
      </VStack>
      
    </Card>
  );
}