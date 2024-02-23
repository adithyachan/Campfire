import React, { useState } from 'react';
import { AddIcon, AlertCircleIcon, Button, ButtonIcon, ButtonText, FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText, HStack, Input, InputField, Text, VStack } from '@gluestack-ui/themed';
import { supabase } from 'utils/supabase';
import { router } from 'expo-router';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;

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

  const handlePasswordChanged = (password: string) => {
    setPassword(password);
    if (password == "") {
      setPasswordError("");
      return;
    }

    const passwordValid = passwordRegex.test(password);
    if (!passwordValid) {
      setPasswordError("Passwords must be 6+ characters with 1+ special characters and 1+ numbers");
      return;
    }

    setPasswordError("");
  }

  const handleResetPassword = async () => {
    console.log('reset password');
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
        <FormControlError>
          <FormControlErrorIcon
            as={AlertCircleIcon}
          />
          <FormControlErrorText>
            { emailError }
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <FormControl w="$1/2" isInvalid={passwordError != ""}>
        <FormControlLabel>
          <FormControlLabelText>New Password</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            type="password"
            value={password}
            placeholder="password"
            onChangeText={handlePasswordChanged}
          />
        </Input>
        <FormControlError>
          <FormControlErrorIcon
            as={AlertCircleIcon}
          />
          <FormControlErrorText>
            { passwordError }
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <Button
        w="$3/5"
        variant="solid"
        action="primary"
        onPress={handleResetPassword}
        isDisabled={email == "" || 
        password == ""}
      >
        <ButtonText>Update</ButtonText>
      </Button>
      <Button 
        variant='link'
        size='md'
        onPress={() => router.navigate("/auth/login")}
      >
        <ButtonText>Back to Login</ButtonText>
      </Button>
      {/* <Button
        variant='link'
        onPress={() => router.navigate("/auth/verify")}
      >
        <ButtonText>Verify</ButtonText>
      </Button> */}
    </VStack>
  )
  
}

export default ForgotPassword