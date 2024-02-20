import '../global.css';
import { Stack } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: "(tabs)",
};

export default function RootLayout() {
  	return (
			<GluestackUIProvider config={config}>
				<Stack>
					{/* <Stack.Screen name='auth' options={{ headerShown: false }}/> */}
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				</Stack>
			</GluestackUIProvider>
  	);
}