import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Button,
  ButtonText,
  Divider,
  Text,
  Avatar,
  AvatarFallbackText,
} from '@gluestack-ui/themed';

// FROM PARAM
// TODO: 
// have the avatar be loaded as a letter fallback text if there is not a profile photo set
// implement table backend for all information shown on screen
// do change psswd button
// do change bio button
// do change avatar photo button (S3 Bucket)

export default function AccountScreen() {
    return (
        <View style={styles.container}>
            <Avatar bgColor='$amber600' size="2xl" borderRadius="$full" >
                <AvatarFallbackText>Sandeep Srivastava</AvatarFallbackText>
            </Avatar>
            
            <Text style={styles.bio}>
                This is an example bio. Here you can add your personal info or description.
            </Text>
            
            <Divider style={styles.divider} />
            
            <Button
              size="md"
              variant="solid"
              action="primary"
              onPress={() => console.log('Reset Password')}
              style={styles.button}
            >
              <ButtonText>Reset Password</ButtonText>
            </Button>
            
            <Button
              size="md"
              variant="solid"
              action="secondary"
              onPress={() => console.log('Change Bio')}
              style={styles.button}
            >
              <ButtonText>Change Bio</ButtonText>
            </Button>
            
            <Button
              size="md"
              variant="solid"
              onPress={() => console.log('Change Profile Photo')}
              style={styles.button}
            >
              <ButtonText>Change Profile Photo</ButtonText>
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    bio: {
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20, // Added spacing between the avatar and the bio
    },
    divider: {
        width: '100%',
        marginBottom: 20,
    },
    button: {
        marginVertical: 5,
    },
});
