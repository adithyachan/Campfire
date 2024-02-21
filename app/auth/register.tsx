import React, { useState } from 'react';
import { AddIcon, AlertCircleIcon, Button, ButtonIcon, ButtonText, FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText, Input, InputField, VStack } from '@gluestack-ui/themed';
import { supabase } from 'utils/supabase';
import { router } from 'expo-router';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState<string | undefined>('');
  const [passwordError, setPasswordError] = useState<string | undefined>('');

  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;

  const handleRegister = async () => {
    setEmailError("");
    setPasswordError("");

    const emailValid = emailRegex.test(email) && email != "";
    const passwordValid = passwordRegex.test(password) && password != "";

    setEmailInvalid(!emailValid)
    setPasswordInvalid(!passwordValid)

    if (!emailValid) {
      setEmailError("Invalid email format");
    }

    if (!passwordValid) {
      setPasswordError("Passwords must be 6+ characters with 1+ special characters and 1+ numbers");
    }

    if (!emailValid || !passwordValid) {
      return;
    }


    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setPasswordError(error.message);
        console.log(error)
      } else {
        console.log('User signed up successfully:');
        console.log(data);
        router.navigate({
          pathname: "/auth/verify",
          params: { email: email }
        })
      }
    }
    catch (error) {
      console.log("Registration failed with error:")
      console.log(error)
    }
  };

  return (
    <VStack w="$full" h="$3/4" space="md" alignItems='center' justifyContent='center'>
      <FormControl w="$48" size="md" mb='$1' isInvalid={emailInvalid}>
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
            { emailError }
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <FormControl w="$48" size="md" isInvalid={passwordInvalid}>
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
        onPress={handleRegister}
      >
        <ButtonText>Register</ButtonText>
      </Button>
      <Button 
        variant='link'
        size='md'
        onPress={() => router.navigate("/auth/login")}
      >
        <ButtonText>Already have an account?</ButtonText>
      </Button>
      {/* <Button
        variant='link'
        onPress={() => router.navigate("/auth/verify")}
      >
        <ButtonText>Verify</ButtonText>
      </Button> */}
    </VStack>
  );
};

export default Register;
