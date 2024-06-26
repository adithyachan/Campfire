import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, StatusBar, ScrollView } from 'react-native';
import SearchBar from '~/components/searchbar';
import {
  Fab,
  Divider,
  HStack,
  Text,
  Button,
  FabIcon,
  RepeatIcon,
  Center,
  SearchIcon,
  Toast,
  ToastDescription,
  ToastTitle,
  VStack,
  useToast,
} from '@gluestack-ui/themed';
import SearchList from '~/components/searchview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '~/utils/supabase';
import * as Location from 'expo-location';
import PostCard from '~/components/postCard';
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

export default function ExploreFeedScreen() {
  const toast = useToast()
  supabase
    .channel('notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, async (payload) => {
      const insertedRow = payload.new
      console.log(`new row inserted: ${JSON.stringify(insertedRow)}`)
      const {data: {user}}  = await supabase.auth.getUser();
      const {data: notificationData, error: notificationError} = await supabase
        .from('profiles')
        .select('notifications')
        .eq('user_id', user?.id)
        .single()
      
      if (notificationData?.notifications && user?.id === insertedRow.user_id)
        toast.show({
					duration: 7000,
					placement: "top",
					render: ({ id }) => {
						const toastId = "toast-" + id
						return (
							<Toast nativeID={toastId} action="attention" variant="solid">
								<VStack space="xs">
									<ToastTitle>{insertedRow.title}</ToastTitle>
									<ToastDescription>
										{insertedRow.body}
									</ToastDescription>
								</VStack>
							</Toast>
						)
					},
				})
      }
    )
    .subscribe()
  const navigation = useNavigation();
  const [clicked, setClicked] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState('');
  const [activeButton, setActiveButton] = useState('users');
  const [userData, setUserData] = useState<
    {
      user_id: string;
      first_name: string;
      last_name: string;
      username: string;
      bio: string;
      avatar_url: string;
    }[]
  >([]);
  const [groupData, setGroupData] = useState<{ group_id: string; name: string; bio: string }[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [posts, setPosts] = useState<Post[]>();
  const [searchView, setSearchView] = useState(false);

  const getPostsByGeo = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    let latitude = location.coords.latitude;
    let longitude = location.coords.longitude;
    let reverseGeo = await Location.reverseGeocodeAsync({ latitude, longitude });
    console.log(location);
    console.log(reverseGeo);
    let geo_city = reverseGeo[0].city;
    console.log(`{post city: ${geo_city}`);

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select()
      .eq('is_public', true)
      .eq('city', geo_city)
      .limit(50);

    if (postError) {
      throw new Error('POST DATA ERROR - ' + postError.message);
    }

    let sortedPosts = postData.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    setPosts(sortedPosts);
    console.log(`POST DATA FOR EXPLORE FEED: ${JSON.stringify(postData)}`);
  };

  useEffect(() => {
    retrieveData();
    getPostsByGeo();
  }, [refreshCount]);

  const retrieveData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user == null) {
      console.log('Could not retrieve');
      return;
    }
    const userId = user.id;

    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, username, bio, avatar_url');
    if (userError) {
      console.log(userError);
    } else {
      console.log(userData);
    }
    setUserData(
      userData as {
        user_id: string;
        first_name: string;
        last_name: string;
        username: string;
        bio: string;
        avatar_url: string;
      }[]
    );
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('group_id, name, bio');
    if (groupError) {
      console.log(groupError);
    } else {
      console.log(groupData);
    }
    setGroupData(groupData as { group_id: string; name: string; bio: string }[]);
  };

	if (! searchView) {
		navigation.setOptions({
			headerShown: true
		  });
		return (
			<>
				<Center mt="$3" mb="$4">
					<ScrollView showsVerticalScrollIndicator={false}>
						{posts?.map((postData) => (
							
							<PostCard key={postData.post_id} postData={postData} updatePosts={getPostsByGeo}/>
							
						))}
					</ScrollView>
				</Center>
				<Fab placement="bottom right" onPress={() => setRefreshCount(refreshCount + 1)}>
					<FabIcon as={RepeatIcon} />
				</Fab>
				<Fab placement="bottom left" onPress={() => setSearchView(true)}>
					<FabIcon as={SearchIcon} />
				</Fab>
			</>
		);
	} else {
		navigation.setOptions({
			headerShown: false
		  });
		return (
			<SafeAreaView style={styles.root}>
				<SearchBar
					clicked={clicked}
					searchPhrase={searchPhrase}
					setSearchPhrase={setSearchPhrase}
					setClicked={setClicked}
					activeButton={activeButton}
					setActiveButton={setActiveButton}
				/>
				<SearchList
					searchPhrase={searchPhrase}
					setClicked={setClicked}
					userData={userData}
					groupData={groupData}
					activeButton={activeButton}
					setActiveButton={setActiveButton}
				/>
        <Fab placement="bottom right" onPress={() => setRefreshCount(refreshCount + 1)}>
					<FabIcon as={RepeatIcon} />
				</Fab>
				<Fab placement="bottom left" onPress={() => setSearchView(false)}>
					<FabIcon as={SearchIcon} />
				</Fab>
			</SafeAreaView>
			
		)
	}
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
