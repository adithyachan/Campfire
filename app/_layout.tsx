import '../global.css';
import { Stack } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"
import { supabase } from '~/utils/supabase';
import { useEffect } from 'react';

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: "welcome",
};

export default function RootLayout() {
	
  	return (
			<GluestackUIProvider config={config}>
				<Stack>
					<Stack.Screen name='welcome' options={{ headerShown: false }}/>
					<Stack.Screen name='auth/register' options={{ headerShown: false }}/>
					<Stack.Screen name='auth/verify' options={{ headerShown: false}}/>
					<Stack.Screen name='auth/login' options={{ headerShown: false}}/>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				</Stack>
			</GluestackUIProvider>
  	);
}