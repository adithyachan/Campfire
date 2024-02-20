import React, { useState } from 'react';
import { AddIcon, AlertCircleIcon, Button, ButtonIcon, ButtonText, FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText, Input, InputField, VStack } from '@gluestack-ui/themed';
import { supabase } from 'utils/supabase'; // Import supabase instance

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>('');

  const handleRegister = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        console.log('User signed up successfully:');
        console.log(data);
        // Handle successful registration, e.g., redirect to another page
      }
    }
    catch (error) {
      console.log("Registration failed with error:")
      console.log(error)
    }
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        console.log('User signed up successfully:');
        console.log(data);
        // Handle successful registration, e.g., redirect to another page
      }
    }
    catch (error) {
      console.log("Registration failed with error:")
      console.log(error)
    }
  };

  return (
    <VStack w="$full" h="$3/4" space="md" alignItems='center' justifyContent='center'>
      <FormControl w="$48" size="md" mb='$1'>
        <FormControlLabel mb='$1'>
          <FormControlLabelText>Email</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            type="text"
            value={email}
            placeholder="email"
            onChangeText={text => {
              setEmail(text.toLowerCase())
            }}
          />
        </Input>
        <FormControlHelper>
        </FormControlHelper>
        <FormControlError>
          <FormControlErrorIcon
            as={AlertCircleIcon}
          />
          <FormControlErrorText>
            Invalid Email
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <FormControl w="$48" size="md" isDisabled={false} isInvalid={false} isReadOnly={false} isRequired={false} >
        <FormControlLabel mb='$1'>
          <FormControlLabelText>Password</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            type="password"
            value={password}
            placeholder="password"
            onChangeText={text => setPassword(text)}
          />
        </Input>
        <FormControlHelper>
          <FormControlHelperText>
            Must be at least 6 characters.
          </FormControlHelperText>
        </FormControlHelper>
        <FormControlError>
          <FormControlErrorIcon
            as={AlertCircleIcon}
          />
          <FormControlErrorText>
            At least 6 characters are required.
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <Button
        size="md"
        variant="solid"
        action="primary"
        isDisabled={false}
        isFocusVisible={false}
        onPress={handleRegister}
      >
        <ButtonText>Register</ButtonText>
      </Button>
    </VStack>
  );
};

export default Auth;
