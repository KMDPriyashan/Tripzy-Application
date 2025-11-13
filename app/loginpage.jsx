import { useRouter } from 'expo-router';
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from '../lib/supabase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    if (!email.trim()) {
      return { isValid: false, message: 'Please enter your email address' };
    }

    if (!validateEmail(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    if (!password) {
      return { isValid: false, message: 'Please enter your password' };
    }

    return { isValid: true, message: '' };
  };

  // Enhanced Error Handling for Login
  const handleAuthError = (error) => {
    const errorMessage = error.message;

    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    } else if (errorMessage.includes('Email not confirmed')) {
      return 'Please confirm your email address before logging in. Check your inbox for the confirmation link.';
    } else if (errorMessage.includes('Email rate limit exceeded')) {
      return 'Too many attempts. Please try again in a few minutes.';
    } else if (errorMessage.includes('User not found')) {
      return 'No account found with this email address. Please sign up first.';
    } else {
      return errorMessage || 'An unexpected error occurred. Please try again.';
    }
  };

  // Login Function
  const handleLogin = async () => {
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.message);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        const userFriendlyError = handleAuthError(error);
        Alert.alert('Login Error', userFriendlyError);
        return;
      }

      if (data.user && data.session) {
        console.log('Login successful !');
        
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          Alert.alert(
            'Email Not Verified',
            'Please verify your email address before logging in. Check your inbox for the verification link.',
            [
              {
                text: 'Resend Verification',
                onPress: () => resendVerificationEmail(data.user.email)
              },
              {
                text: 'OK',
                style: 'cancel'
              }
            ]
          );
          return;
        }

        // Successfully logged in with verified email
        Alert.alert(
          'Success!',
          'You have successfully logged in.',
          [
            {
              text: 'Continue',
              onPress: () => {
                resetForm();
                // Navigate to Home Page
                router.replace('/profile');
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('Unexpected login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (userEmail) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) {
        Alert.alert('Error', 'Failed to resend verification email. Please try again.');
      } else {
        Alert.alert('Success', 'Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Resend email error:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setEmail('');
    setPassword('');
  };

  // Navigate to Signup
  const navigateToSignup = () => {
    router.push('/signup');
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'myapp://auth/reset-password',
      });

      if (error) {
        Alert.alert('Error', 'Failed to send password reset email. Please try again.');
      } else {
        Alert.alert('Success', 'Password reset email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Image at the top */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('../assets/images/index_back.jpg')}
          style={styles.topImage}
          resizeMode="cover"
        />
      </View>

      {/* Heading and Paragraph Section */}
      <View style={styles.textSection}>
        <Text style={styles.heading}>Welcome Back!</Text>
        <Text style={styles.paragraph}>
          Sign in to your account to continue your journey and access your personalized travel experience.
        </Text>
      </View>

      {/* Input Fields Section */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        
        {/* Forgot Password Link */}
        <TouchableOpacity 
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity 
        style={[
          styles.loginButton, 
          loading && styles.loginButtonDisabled,
          (!email || !password) && styles.loginButtonDisabled
        ]}
        onPress={handleLogin}
        disabled={loading || !email || !password}
      >
        <Text style={styles.loginButtonText}>
          {loading ? 'Signing In...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {/* Sign up section */}
      <View style={styles.signupSection}>
        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text style={styles.signupLink} onPress={navigateToSignup}>
            Create account
          </Text>
        </Text>
      </View>
    </View>
  );
};  

export default LoginPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 30,
    borderRadius: 10,
    overflow: 'hidden',
  },
  topImage: {
    width: '100%',
    height: '100%',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  inputSection: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
  forgotPasswordText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupSection: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#666',
  },
  signupLink: {
    color: '#3091AE',
    fontWeight: 'bold',
    textDecorationLine: 'none',
  },
});