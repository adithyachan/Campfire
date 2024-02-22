import React, { useState } from 'react';
import { AddIcon, AlertCircleIcon, Button, ButtonIcon, ButtonText, FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText, HStack, Input, InputField, Text, VStack } from '@gluestack-ui/themed';
import { supabase } from 'utils/supabase';
import { router } from 'expo-router';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('')

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');


  const nameRegex = /^[A-Za-z]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
  const phoneNumberRegex = /^(\d{3})(\d{3})(\d{4})$/;

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message
    return String(error)
  }

  const createProfileEntry = async (id: string) => {
    try {
      const { error: e2 } = await supabase
      .from('profiles')
      .insert({ user_id: id, first_name: firstName, last_name: lastName, email: email, phone_number: phoneNumber })
      if (e2) {
        console.log(e2);
        setPasswordError(e2.message)
      }
      else {
        console.log("Successfully created new user profile entry")
      }
    } catch (error) {
      console.log(error);
      setPasswordError(getErrorMessage(error))
    }
  }

  const handleFirstNameChanged = (firstName: string) => {
    setFirstName(firstName);
    if (firstName == "") {
      setFirstNameError("");
      return;
    }

    if (!nameRegex.test(firstName)) {
      setFirstNameError("Invalid first name")
      return;
    }
    setFirstNameError("");
  }

  const handleLastNameChanged = (lastName: string) => {
    setLastName(lastName);
    if (lastName == "") {
      setLastNameError("");
      return;
    }

    if (!nameRegex.test(lastName)) {
      setLastNameError("Invalid last name")
      return;
    }

    setLastNameError("");
  }

  const handlePhoneNumberChanged = (phoneNumber: string) => {
    setPhoneNumber(phoneNumber.replace(/\D/g, ''));

    if (phoneNumber == "") {
      setPhoneNumberError("");
      return;
    }

    if (!phoneNumberRegex.test(phoneNumber)) {
      setPhoneNumberError("Invalid phone number");
      return;
    }

    setPhoneNumber(phoneNumber.replace(phoneNumberRegex, "($1) $2-$3"));
    setPhoneNumberError("");
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

    const passwordValid = passwordRegex.test(password);
    if (!passwordValid) {
      setPasswordError("Passwords must be 6+ characters with 1+ special characters and 1+ numbers");
      return;
    }

    setPasswordError("");
  }

  const handleRegister = async () => {
    // console.log(firstName);
    // console.log(lastName);
    // console.log(phoneNumber);
    // console.log(email);
    // console.log(password);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        phone: phoneNumber
      });
      if (error) {
        setPasswordError(error.message);
        console.log(error)
      } else {
        console.log('User signed up successfully:');
        console.log(data);

        await createProfileEntry(data.user?.id!);

        router.navigate({
          pathname: "/auth/verify",
          params: { email: email }
        })
      }
    }
    catch (error) {
      console.log("Registration failed with error:")
      console.log(error)
      setPasswordError(getErrorMessage(error))
    }
  };

  return (
    <VStack w="$full" h="$full" space="xl" alignItems='center' justifyContent='center'>
      <Text bold fontSize="$2xl" size="xl">Sign Up</Text>
      <FormControl w="$1/2" isInvalid={firstNameError != ""}>
        <FormControlLabelText>First Name</FormControlLabelText>
        <Input>
          <InputField
            type="text"
            value={firstName}
            placeholder="First Name"
            onChangeText={handleFirstNameChanged}
          />
        </Input>
        <FormControlError>
          <FormControlErrorIcon
            as={AlertCircleIcon}
          />
          <FormControlErrorText>
            { firstNameError }
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <FormControl w="$1/2" isInvalid={lastNameError != ""}>
        <FormControlLabelText>Last Name</FormControlLabelText>
        <Input>
          <InputField
            type="text"
            value={lastName}
            placeholder="Last Name"
            onChangeText={handleLastNameChanged}
          />
        </Input>
        <FormControlError>
          <FormControlErrorIcon
            as={AlertCircleIcon}
          />
          <FormControlErrorText>
            { lastNameError }
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <FormControl w="$1/2" isInvalid={phoneNumberError != ""}>
        <FormControlLabelText>Phone Number</FormControlLabelText>
        <Input>
          <InputField
            type="text"
            value={phoneNumber}
            placeholder="123456789"
            onChangeText={handlePhoneNumberChanged}
          />
        </Input>
        <FormControlError>
          <FormControlErrorIcon
            as={AlertCircleIcon}
          />
          <FormControlErrorText>
            { phoneNumberError }
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
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
          <FormControlLabelText>Password</FormControlLabelText>
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
        onPress={handleRegister}
        isDisabled={firstName == "" || 
        lastName == "" || 
        phoneNumber == "" ||
        email == "" ||
        password == ""}
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
      <Button
        variant='link'
        onPress={() => router.navigate("/auth/verify")}
      >
        <ButtonText>Verify</ButtonText>
      </Button>
    </VStack>
  );
};

export default Register;
