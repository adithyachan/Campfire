import { Button, ButtonText, VStack, Text, FormControl, FormControlLabel, FormControlError, FormControlErrorIcon, AlertCircleIcon, FormControlErrorText, FormControlLabelText } from "@gluestack-ui/themed";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

//@ts-ignore
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import { router, useLocalSearchParams } from "expo-router";

const timeout = 60;

const Verify = () => {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const params = useLocalSearchParams();
  const email = params.email as string ?? "example@email.mail";

  const [seconds, setSeconds] = useState(timeout);
  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    handleStart()
    return () => clearInterval(timer.current);
  }, [])

  const handleResend = async () => {
    handleStart();
    const { data, error } = await supabase.auth.resend({ type: "signup", email: email })

    if (error) {
      setCodeError(error.message)
      console.log(error)
    } 
    else {
      console.log("reset sucessfully")
      console.log(data)
    }
  }

  const handleStart = () => {
    timer.current = setInterval(() => {
    setSeconds((prev) => {
      if (prev <= 1) {
        clearInterval(timer.current);
        return timeout;
      }
      
      return prev - 1;
    });
    }, 1000);
  }
  
  const verifyOTP = async () => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: email, token: code, type: "email"})
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
      <Text>An email was sent to { email }</Text>
      <FormControl isInvalid={ codeError != "" } w="$full" alignItems="center">
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
          <FormControlErrorIcon as={ AlertCircleIcon } />
            <FormControlErrorText>
              { codeError }
            </FormControlErrorText>
          </FormControlError>
      </FormControl>
      
      <Button w="$3/5" onPress={() => verifyOTP()} isDisabled={code.length != 6}>
        <ButtonText>Verify</ButtonText>
      </Button>

      <Button w="$3/5" variant="link" disabled={ seconds < timeout } onPress={handleResend}>
          <ButtonText>{ seconds < timeout ? `Resend in ${seconds}s` : "Didn't get a link?"  }</ButtonText>
      </Button>
      <Text fontSize="$xs">You can resend an OTP every 60 seconds</Text>
    </VStack>
  );
}

export default Verify;