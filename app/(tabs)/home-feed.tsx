import { ListRenderItemInfo, Text, View } from 'react-native';
import PostCard from '~/components/postCard';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '~/utils/supabase';
import {
  Fab,
  FabIcon,
  Spinner,
  ScrollView,
  Center,
  Button,
  ButtonIcon,
  Menu,
  MenuItem,
  Icon,
  MenuItemLabel,
} from '@gluestack-ui/themed';
import { RepeatIcon, ArrowUpDownIcon, ArrowDown10 } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
type Post = {
  likes: any;
  post_id: string;
  group_id: string;
  user_id: string;
  media_url: string;
  post_caption: string;
  created_at: string;
  city: string;
  show_location: boolean;
	partner_id: string;
	partner_username: string;
};
export default function HomeFeedScreen() {
  const navigation = useNavigation();
  const [refreshCount, setRefreshCount] = useState(0);
  const [userId, setUserId] = useState<string>();
  const [subscriptions, setSubscriptions] = useState<string[]>();
  const [posts, setPosts] = useState<Post[]>();
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('Newest');

  const sortedPosts = useMemo(() => {
    if (sortOption === 'Newest') {
      return posts
        ? [...posts].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        : [];
    } else if (sortOption === 'Most Liked') {
      return posts ? [...posts].sort((a, b) => b.likes - a.likes) : [];
    } else if (sortOption === 'Oldest') {
      return posts
        ? [...posts].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        : [];
    }
  }, [posts, sortOption]);

  const getLikeCount = async (postId: string) => {
    const { data: likeData, error: likeError } = await supabase
      .from('post_likes')
      .select('user_id')
      .eq('post_id', postId);

    if (likeError) {
      throw new Error('LIKE DATA ERROR - ' + likeError.message);
    }

    return likeData.length;
  };

  const getCurrentUserID = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user == null) {
      throw new Error('USER ERROR - current user not found');
    }

    setUserId(user.id);
    return user.id;
  };
  const getUserSubscriptions = async () => {
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('profile_subscriptions')
      .select('group_id')
      .eq('profile_id', userId);

    const subscribedGroupIds = subscriptionData?.map((obj) => obj.group_id);
    console.log(`groups subscribed to: ${JSON.stringify(subscribedGroupIds)}`);
    setSubscriptions(subscribedGroupIds);
  };

  const getSubscribedGroupPosts = async () => {
    if (subscriptions) {
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select()
        .in('group_id', subscriptions);
      // .in('group_id', ["2fb73a1b-b798-433e-a31d-8cacafd1884c"])
      if (postError) {
        throw new Error('POST DATA ERROR - ' + postError.message);
      }

      const postsWithLikes = await Promise.all(
        postData.map(async (post) => {
          const likeCount = await getLikeCount(post.post_id);
          return { ...post, likes: likeCount };
        })
      );

      setPosts(postsWithLikes);
    }
  };
  // Set the header options
  navigation.setOptions({
    headerRight: () => sortButton,
  });

  ////// Components //////
  const sortButton = (
    <Menu
      placement="bottom"
      selectionMode="single"
      closeOnSelect={true}
      borderRadius={'$xl'}
      mx={'$2'}
      trigger={({ ...triggerProps }) => {
        return (
          <Button {...triggerProps} variant="link" margin={10}>
            <ButtonIcon as={ArrowUpDownIcon} />
          </Button>
        );
      }}>
      <MenuItem textValue="Create a group" onPress={() => setSortOption('Newest')}>
        <Icon as={ArrowUpDownIcon} size="sm" mr="$2" />
        <MenuItemLabel size="sm">Newest</MenuItemLabel>
      </MenuItem>
      <MenuItem textValue="Join a private group" onPress={() => setSortOption('Most Liked')}>
        <Icon as={ArrowDown10} size="sm" mr="$2" />
        <MenuItemLabel size="sm">Most Liked</MenuItemLabel>
      </MenuItem>
      <MenuItem textValue="Oldest" onPress={() => setSortOption('Oldest')}>
        <Icon as={ArrowUpDownIcon} size="sm" mr="$2" />
        <MenuItemLabel size="sm">Oldest</MenuItemLabel>
      </MenuItem>
    </Menu>
  );

  useEffect(() => {
    getCurrentUserID();
    getUserSubscriptions();
    getSubscribedGroupPosts();
    setLoading(false);
  }, [userId, refreshCount]);

	if (loading) {
		return (
			<Spinner size='large' />
		)
	}
	if (posts?.length === 0) {
		return(
			
			<>
				<View className={styles.container}>
					<Text className={styles.title}>Your feed is empty!</Text>
					<View className={styles.separator} />
					<Text className={styles.subtext}>Subscribe to groups to see their posts here</Text>
				</View>
				<Fab placement="bottom right" onPress={() => setRefreshCount(refreshCount + 1)}>
					<FabIcon as={RepeatIcon} />
				</Fab>
			</>
			
		)
	}
	return(
		<>	
			<Center mt="$3" mb="$4">
				<ScrollView showsVerticalScrollIndicator={false}>
					{sortedPosts?.map((postData) => (
						
						<PostCard key={postData.post_id} postData={postData} updatePosts={getSubscribedGroupPosts}/>
						
					))}
				</ScrollView>
			</Center>
			<Fab placement="bottom right" onPress={() => setRefreshCount(refreshCount + 1)}>
				<FabIcon as={RepeatIcon} />
			</Fab>
		</>
		
	)
	
  
    
}

const styles = {
  container: `items-center flex-1 justify-center`,
  separator: `h-[1px] my-7 w-4/5 bg-gray-200`,
  title: `text-xl font-bold`,
  subtext: `text-sm`,
};
