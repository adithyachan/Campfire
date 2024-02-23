import React, { useState } from 'react';
import { AddIcon, AlertCircleIcon, Button, ButtonIcon, ButtonText, FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText, Input, InputField, VStack, Text } from '@gluestack-ui/themed';
import { supabase } from 'utils/supabase';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const handlePasswordChanged = (password: string) => {
    setPassword(password);
    if (password == "") {
      setPasswordError("");
      return;
    }

    setPasswordError("");
  }

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        console.log(error.message);
        if (error.message == "Email not confirmed") {
          const { data, error } = await supabase.auth.resend({ type: "signup", email: email })
          if (error) {
            console.log(error.message);
            setPasswordError(error.message);
          }
          else {
            console.log(data);
            router.navigate({ 
              pathname: "auth/verify", 
              params: { email: email, type: "signup" } 
            });
          }
        }
        else {
          setPasswordError(error.message);
        }
      } 
      else {
        console.log('User logged in successfully:');
        console.log(data);
        // Handle successful registration, e.g., redirect to another page
        await AsyncStorage.setItem('userData', JSON.stringify(data)); // Store data in AsyncStorage
        router.replace("/(tabs)/home-feed");
      }
    }
    catch (error) {
      console.log("Log in failed with error:")
      console.log(error)
      setPasswordError(getErrorMessage(error));
    }
  };

  return (
    <VStack w="$full" h="$full" space="xl" alignItems='center' justifyContent='center'>
      <Text bold fontSize="$2xl" size="xl">Log In</Text>
      <FormControl w="$1/2" size="md" mb='$1' isInvalid={emailError != ""}>
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
        <FormControlHelper>
        </FormControlHelper>
        <FormControlError>
          <FormControlErrorIcon
            as={AlertCircleIcon}
          />
          <FormControlErrorText>
            { emailError }
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <FormControl w="$1/2" size="md" isInvalid={ passwordError != "" }>
        <FormControlLabel mb='$1'>
          <FormControlLabelText>Password</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            type="password"
            value={ password }
            placeholder="password"
            onChangeText={handlePasswordChanged}
          />
        </Input>
        <FormControlHelper>
          <Button 
            variant='link'
            size='xs'
            onPress={() => router.navigate("auth/forgotpassword")}
          >
            <ButtonText>Forgot your password?</ButtonText>
          </Button>
        </FormControlHelper>
        <FormControlError>
          <FormControlErrorIcon
            as={ AlertCircleIcon }
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
        isDisabled={email == "" || password == ""}
        onPress={handleLogin}
      >
        <ButtonText>Login</ButtonText>
      </Button>
      <Button 
        variant='link'
        onPress={() => router.navigate("/auth/register")}
      >
        <ButtonText>Don't have an account?</ButtonText>
      </Button>
    </VStack>
  );
};

export default Login;
