import { Link, Stack } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function Auth() {
  return (
    <>
      <Text>Authentication page</Text>
      <Link href="/(tabs)/home-feed" asChild>
        <Button title='Login'/>
      </Link>
    </>
  );
 }