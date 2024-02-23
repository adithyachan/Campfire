import React from "react";
import { Button, ButtonText, Image, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";


const Welcome = () => {
  return (
    <VStack w="$full" h="$full" backgroundColor="#053d63">
      <Image source={require("../assets/campfirelogo.png")} alt="Campfire Logo" w="$full" mt="$1/2"/>
      <VStack w="$full" h="$full" alignItems="center" mt="$1/3" space="xl">
        <Button w="$1/2" bgColor="#ff9d41"
          onPress={() => router.navigate("/auth/register")}
        >
          <ButtonText>Create new account</ButtonText>
        </Button>
        <Button w="$1/2" variant="link" 
          onPress={() => router.navigate("/auth/login")}
        >
          <ButtonText color="#ff9d41">Already have an account?</ButtonText>
        </Button>
      </VStack>
    </VStack>
  ); 
}

export default Welcome;