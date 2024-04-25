import '../global.css';
import { Stack } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: "/",
};

export default function RootLayout() {
	
  	return (
			<GluestackUIProvider config={config}>
				<Stack>
					<Stack.Screen name='index' options={{ headerShown: false }}/>
					<Stack.Screen name='auth/register' options={{ headerShown: false }}/>
					<Stack.Screen name='auth/forgotpassword' options={{ headerShown: false }}/>
					<Stack.Screen name='auth/resetpassword' options={{ headerShown: false }}/>
					<Stack.Screen name='auth/verify' options={{ headerShown: false}}/>
					<Stack.Screen name='auth/login' options={{ headerShown: false}}/>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="group/[id]" />
					<Stack.Screen name="account/[id]" />
				</Stack>
			</GluestackUIProvider>
  	);
}