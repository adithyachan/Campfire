import React, { useState } from 'react';
import { AddIcon, AlertCircleIcon, Button, ButtonIcon, ButtonText, FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText, HStack, Input, InputField, Text, VStack } from '@gluestack-ui/themed';
import { supabase } from 'utils/supabase';
import { router } from 'expo-router';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;

  const handleNewPasswordChanged = (password: string) => {
    setNewPassword(password);
    if (password == "") {
      setNewPasswordError("");
      return;
    }

    const passwordValid = passwordRegex.test(password);
    if (!passwordValid) {
      setNewPasswordError("Passwords must be 6+ characters with 1+ special characters and 1+ numbers");
      return;
    }

    setNewPasswordError("");
  }

  const handleConfirmPasswordChanged = (password: string) => {
    setConfirmPassword(password);
    if (password == "") {
      setConfirmPasswordError("");
      return;
    }
    if (password != newPassword) {
      setConfirmPasswordError("Passwords must match");
      return;
    }

    const passwordValid = passwordRegex.test(password);
    if (!passwordValid) {
      setConfirmPasswordError("Passwords must be 6+ characters with 1+ special characters and 1+ numbers");
      return;
    }

    setConfirmPasswordError("");
  }

  const handleResetPassword = async () => {
    console.log('reset password');
  }
  return(
    <VStack w="$full" h="$full" space="xl" alignItems='center' justifyContent='center'>
      <Text bold fontSize="$2xl" size="xl">Password Reset</Text>
      <FormControl w="$1/2" isInvalid={newPasswordError != ""}>
        <FormControlLabel mb='$1'>
          <FormControlLabelText>New Password</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            type="text"
            value={newPassword}
            placeholder="New Password"
            onChangeText={handleNewPasswordChanged}
          />
        </Input>
        <FormControlError>
          <FormControlErrorIcon
            as={AlertCircleIcon}
          />
          <FormControlErrorText>
            { newPasswordError }
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <FormControl w="$1/2" isInvalid={confirmPasswordError != ""}>
        <FormControlLabel mb='$1'>
          <FormControlLabelText>Confirm Password</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            type="text"
            value={confirmPassword}
            placeholder="Confirm Password"
            onChangeText={handleConfirmPasswordChanged}
          />
        </Input>
        <FormControlError>
          <FormControlErrorIcon
            as={AlertCircleIcon}
          />
          <FormControlErrorText>
            { newPasswordError }
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <Button
        w="$3/5"
        variant="solid"
        action="primary"
        onPress={handleResetPassword}
        isDisabled={newPassword == "" || 
        confirmPassword == "" || newPassword != confirmPassword}
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

export default ResetPassword