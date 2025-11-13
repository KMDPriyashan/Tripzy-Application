import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    handleEmailConfirmation();
  }, []);

  const handleEmailConfirmation = async () => {
    try {
      // Get the session from URL (for email confirmation)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session) {
        // Email confirmed successfully
        Alert.alert(
          'Email Verified!',
          'Your email has been successfully verified. You can now log in to your account.',
          [
            {
              text: 'Continue to Login',
              onPress: () => {
                // Sign out to ensure clean login flow
                supabase.auth.signOut();
                router.replace('/login');
              }
            }
          ]
        );
      } else {
        // No session found, redirect to login
        Alert.alert(
          'Verification Complete',
          'Your email has been verified. Please log in to continue.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Email confirmation error:', error);
      Alert.alert(
        'Verification Error',
        'There was an issue verifying your email. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]
      );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#000000" />
      <Text style={{ marginTop: 10 }}>Verifying your email...</Text>
    </View>
  );
}