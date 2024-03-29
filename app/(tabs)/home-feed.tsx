import { ListRenderItemInfo, Text, View } from "react-native";
import PostCard from "~/components/postCard";

import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import { Fab, FabIcon, Spinner, ScrollView, Center } from "@gluestack-ui/themed";
import { RepeatIcon } from "lucide-react-native";

type Post = {
	post_id: string,
	group_id: string,
	user_id: string,
	media_url: string,
	post_caption: string,
	created_at: string
}
export default function HomeFeedScreen() {

	const [refreshCount, setRefreshCount] = useState(0);
  const [userId, setUserId] = useState<string>();
	const [subscriptions, setSubscriptions] = useState<string[]>();
	const [posts, setPosts] = useState<Post[]>();
	const [loading, setLoading] = useState(true);

	const getCurrentUserID = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user == null) {
      throw new Error("USER ERROR - current user not found")
    }

    setUserId(user.id)
    return user.id
  }
	const getUserSubscriptions = async () => {
		const { data: subscriptionData, error: subscriptionError } = await supabase
			.from('profile_subscriptions')
			.select('group_id')
			.eq('profile_id', userId)
		
		const subscribedGroupIds = subscriptionData?.map((obj) => obj.group_id)
		console.log(`groups subscribed to: ${JSON.stringify(subscribedGroupIds)}`)
		setSubscriptions(subscribedGroupIds)
	}

	const getSubscribedGroupPosts = async () => {
		if (subscriptions) {
			const { data: postData, error: postError } = await supabase
				.from('posts')
				.select()
				.in('group_id', subscriptions)
				// .in('group_id', ["2fb73a1b-b798-433e-a31d-8cacafd1884c"])

			setPosts(postData as Post[])
			console.log(`posts from subscribed groups: ${JSON.stringify(postData)}`)
		}
		
	}

	useEffect(() => {
		getCurrentUserID()
		getUserSubscriptions()
		getSubscribedGroupPosts()
		setLoading(false)
	}, [userId, refreshCount])

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
					{posts?.map((postData) => (
						
						<PostCard key={postData.post_id} postData={postData} />
						
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
	subtext: `text-sm`
};
