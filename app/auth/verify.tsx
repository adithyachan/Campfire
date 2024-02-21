import { Button, ButtonText, VStack, Text, FormControl, FormControlLabel, FormControlError, FormControlErrorIcon, AlertCircleIcon, FormControlErrorText, FormControlLabelText } from "@gluestack-ui/themed";
import React, { useState } from "react";
import { supabase } from "utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

//@ts-ignore
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import { router, useLocalSearchParams } from "expo-router";

const Verify = () => {
  const [code, setCode] = useState("");
  const [isOTPValid, setIsOTPValid] = useState(true);
  const [codeError, setCodeError] = useState("");
  const params = useLocalSearchParams();
  const { email } = params;
  
  const verifyOTP = async () => {
    if (code.length != 6) {
      setIsOTPValid(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: (email as string), token: code, type: "email"})
      console.log(email)
      console.log(code)

      if (error) {
        setCodeError(error.message);
        console.log(error);
      }
      else {
        console.log(data);
        await AsyncStorage.setItem('userData', JSON.stringify(data)); // Store data in AsyncStorage
        router.replace("/(tabs)/home-feed");
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  return (
    <VStack w="$full" h="$full" justifyContent="center" alignItems="center" space="xl">
      <FormControl isInvalid={!isOTPValid} w="$full" alignItems="center">
        <FormControlLabel>
          <FormControlLabelText>Please enter your 6-digit code:</FormControlLabelText>
        </FormControlLabel>
        <SmoothPinCodeInput
          cellStyle={{
            borderBottomWidth: 2,
            borderColor: 'gray',
          }}
          cellStyleFocused={{
            borderColor: 'black',
          }}
          value={code}
          codeLength={6}
          onTextChange={(code: string) => setCode(code)}

        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
            <FormControlErrorText>
              {codeError}
            </FormControlErrorText>
          </FormControlError>
      </FormControl>
      
      <Button w="$3/5" onPress={() => verifyOTP()}>
        <ButtonText>Verify</ButtonText>
      </Button>
    </VStack>
  );
}

export default Verify;