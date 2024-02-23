import React, { useState, useEffect, useRef } from 'react';
import { AddIcon, AlertCircleIcon, Button, ButtonIcon, ButtonText, FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText, HStack, Input, InputField, Text, VStack } from '@gluestack-ui/themed';
import { supabase } from 'utils/supabase';
import { router } from 'expo-router';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const [emailError, setEmailError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message
    return String(error)
  }

  const handleEmailChanged = (email: string) => {
    email = email.toLowerCase();
    setEmail(email);
    if (email == "") {
      setEmailError("");
      return;
    }

    const emailValid = emailRegex.test(email);
    if (!emailValid) {
      setEmailError("Invalid email format");
      return;
    }

    setEmailError("");
  }

  const handleSendResetLink = async () => {
    console.log('handle sending reset password email');
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        console.log(error)
        setEmailError(error.message);
      } 
      else {
        console.log(data);
        router.navigate({ 
          pathname: "auth/verify",
          params: { email: email, type: "recovery" } 
        });
      }
    }
    catch (error) {
      console.log(error);
      setEmailError(getErrorMessage(error));
    }
  }

  return(
    <VStack w="$full" h="$full" space="xl" alignItems='center' justifyContent='center'>
      <Text bold fontSize="$2xl" size="xl">Password Reset</Text>
      <FormControl w="$1/2" isInvalid={emailError != ""}>
        <FormControlLabel mb='$1'>
          <FormControlLabelText>Email</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            type="text"
            value={email}
            placeholder="email"
            onChangeText={handleEmailChanged}
          />
        </Input>
        <FormControlHelperText>
          { 'If the email is associated with an account, check your inbox for a password reset link.' }
        </FormControlHelperText>
        <FormControlError>
          <FormControlErrorIcon
            as={AlertCircleIcon}
          />
          <FormControlErrorText>
            { emailError }
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      
      <Button
        w="$3/5"
        variant="solid"
        action="primary"
        onPress={ handleSendResetLink }
        isDisabled={email == "" || emailError != ""}
      >
        <ButtonText>{`Send Reset Link`}</ButtonText>
      </Button>
      <Button 
        variant='link'
        size='md'
        onPress={() => router.navigate("/auth/login")}
      >
        <ButtonText>Back to Login</ButtonText>
      </Button>
    </VStack>
  )
  
}

export default ForgotPassword