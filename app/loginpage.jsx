import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get("window");

// ─── THEME (matches HomePage) ─────────────────────
const C = {
  bg: "#F4F7FF",
  white: "#FFFFFF",
  navy: "#0A1F44",
  blue: "#1877f2",
  blueSoft: "#EAF0FF",
  blueLight: "#5B9BFF",
  blueMid: "#D0E2FF",
  text: "#0A1F44",
  textMuted: "#6B80A3",
};

// ─── Animated floating orb (matches HomePage) ─────
const FloatOrb = ({ style, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });
  return <Animated.View style={[style, { transform: [{ translateY }] }]} />;
};

// ─── Main ─────────────────────────────────────────
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const pillFade = useRef(new Animated.Value(0)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.timing(pillFade, {
        toValue: 1,
        duration: 600,
        delay: 380,
        useNativeDriver: true,
      }),
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 600,
        delay: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 600,
        delay: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Validation ──────────────────────────────────
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    if (!email.trim()) return { isValid: false, message: 'Please enter your email address' };
    if (!validateEmail(email)) return { isValid: false, message: 'Please enter a valid email address' };
    if (!password) return { isValid: false, message: 'Please enter your password' };
    return { isValid: true, message: '' };
  };

  const handleAuthError = (error) => {
    const msg = error.message;
    if (msg.includes('Invalid login credentials')) return 'Invalid email or password. Please try again.';
    if (msg.includes('Email not confirmed')) return 'Please confirm your email address before logging in.';
    if (msg.includes('Email rate limit exceeded')) return 'Too many attempts. Please try again in a few minutes.';
    if (msg.includes('User not found')) return 'No account found with this email. Please sign up first.';
    return msg || 'An unexpected error occurred. Please try again.';
  };

  // ── Login ────────────────────────────────────────
  const handleLogin = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.message);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) { Alert.alert('Login Error', handleAuthError(error)); return; }
      if (data.user && data.session) {
        if (!data.user.email_confirmed_at) {
          Alert.alert('Email Not Verified',
            'Please verify your email address before logging in.',
            [
              { text: 'Resend Verification', onPress: () => resendVerificationEmail(data.user.email) },
              { text: 'OK', style: 'cancel' }
            ]
          );
          return;
        }
        Alert.alert('Success!', 'You have successfully logged in.', [
          { text: 'Continue', onPress: () => { setEmail(''); setPassword(''); router.replace('/profile'); } }
        ]);
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (userEmail) => {
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: userEmail });
      Alert.alert(error ? 'Error' : 'Success',
        error ? 'Failed to resend. Please try again.' : 'Verification email sent! Check your inbox.');
    } catch (e) { console.error(e); }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { Alert.alert('Error', 'Please enter your email address first'); return; }
    if (!validateEmail(email)) { Alert.alert('Error', 'Please enter a valid email address'); return; }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'myapp://auth/reset-password',
      });
      Alert.alert(error ? 'Error' : 'Success',
        error ? 'Failed to send reset email. Please try again.' : 'Password reset email sent! Check your inbox.');
    } catch (e) { Alert.alert('Error', 'An unexpected error occurred. Please try again.'); }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* ══ HERO (mirrors HomePage hero) ══════════════ */}
      <View style={styles.hero}>
        <FloatOrb delay={0} style={styles.orbA} />
        <FloatOrb delay={600} style={styles.orbB} />
        <FloatOrb delay={300} style={styles.orbC} />

        {/* Logo */}
        <Animated.Text style={[styles.logoText, {
          opacity: heroFade,
          transform: [{ scale: logoScale }]
        }]}>
          Tripzy
        </Animated.Text>

        {/* Welcome pill */}
        <Animated.View style={[styles.welcomePill, { opacity: pillFade }]}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>Your journey starts here ✈️</Text>
        </Animated.View>

        {/* Hero text */}
        <Animated.View style={{ opacity: heroFade, transform: [{ translateY: heroSlide }] }}>
          <Text style={styles.heroH1}>Welcome{"\n"}Back.</Text>
          <Text style={styles.heroSub}>Sign in to continue your adventure.</Text>
        </Animated.View>
      </View>

      {/* ══ LOGIN CARD ════════════════════════════════ */}
      <Animated.View style={[styles.card, {
        opacity: cardFade,
        transform: [{ translateY: cardSlide }]
      }]}>

        {/* Email */}
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={C.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        {/* Password */}
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor={C.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        {/* Forgot password */}
        <TouchableOpacity
          style={styles.forgotRow}
          onPress={handleForgotPassword}
          disabled={loading}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity
          style={[styles.loginBtn, (loading || !email || !password) && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading || !email || !password}
          activeOpacity={0.85}
        >
          <Text style={styles.loginBtnText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sign up */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')} disabled={loading}>
            <Text style={styles.signupLink}>Create account</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// ─── STYLES ───────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Hero ──────────────────────────────────────
  hero: {
    backgroundColor: C.white,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    overflow: 'hidden',
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },

  // Orbs
  orbA: {
    position: 'absolute', top: -48, right: -48,
    width: 210, height: 210, borderRadius: 105,
    backgroundColor: C.blue, opacity: 0.07,
  },
  orbB: {
    position: 'absolute', bottom: -30, left: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: C.blueLight, opacity: 0.09,
  },
  orbC: {
    position: 'absolute', top: 110, right: 20,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.blue, opacity: 0.05,
  },

  logoText: {
    fontSize: 46,
    fontWeight: '900',
    color: C.blue,
    fontFamily: 'serif',
    letterSpacing: 1.5,
    marginBottom: 20,
  },

  welcomePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.blueSoft,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: C.blueMid,
    gap: 8,
  },
  pillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.blue },
  pillText: { color: C.blue, fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },

  heroH1: {
    fontSize: 40,
    fontWeight: '900',
    color: C.navy,
    lineHeight: 48,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
  },

  // ── Login card ────────────────────────────────
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 28,
    padding: 24,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.navy,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: C.bg,
    borderWidth: 1.5,
    borderColor: C.blueMid,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: C.navy,
    marginBottom: 16,
  },

  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -8,
    marginBottom: 20,
  },
  forgotText: {
    color: C.blue,
    fontSize: 13,
    fontWeight: '600',
  },

  loginBtn: {
    backgroundColor: C.blue,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtnDisabled: {
    backgroundColor: C.blueLight,
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  loginBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.blueMid },
  dividerText: { fontSize: 13, color: C.textMuted, fontWeight: '600' },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: { fontSize: 14, color: C.textMuted },
  signupLink: {
    fontSize: 14,
    color: C.blue,
    fontWeight: '700',
  },
});

export default LoginPage;