import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";

import { Pressable, StyleSheet } from "react-native";
import { Button, ButtonIcon, AddIcon } from "@gluestack-ui/themed";
import { supabase } from "~/utils/supabase";


function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={styles.tabBarIcon} {...props} />;
}

async function createGroup() {
  console.log("Creating Group")
  const { data, error } = await supabase
  .from('groups')
  .insert([
    { bio: 'This is a test group creation' },
  ])
  .select()
  console.log(data, error)
}

export default function TabLayout() {  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
      }}>
      {/* <Tabs.Screen
        name='index'
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color }) => <TabBarIcon name='code' color={color} />,
          headerRight: () => (
            <Link href='/modal' asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name='info-circle'
                    size={25}
                    color='gray'
                    style={[styles.headerRight, { opacity: pressed ? 0.5 : 1 }]}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Tab Two",
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      /> */}
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => (
          <Button borderRadius='$full' size='lg' p='$3.5' bgColor='$warning500' 
          onPress={() => createGroup()}>
            <ButtonIcon as={AddIcon}/>
          </Button>  
          ),
        }}
      />
      <Tabs.Screen
        name="home-feed"
        options={{
          title: "Home Feed",
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore-feed"
        options={{
          title: "Explore Feed",
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />

    </Tabs>
  );
}


const styles = StyleSheet.create({
  headerRight: {
    marginRight: 15
  },
  tabBarIcon: {
    marginBottom: -3
  }
});
