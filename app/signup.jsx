import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from '../lib/supabase'; // Adjust path as needed

const { width } = Dimensions.get("window");

// ─── THEME ────────────────────────────────────────
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

// ─── Animated floating orb ──────────────────────
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

const SignupPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const pillFade = useRef(new Animated.Value(0)).current;

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
    ]).start();
  }, []);

  const handleSignup = async () => {
    // Basic validation
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          }
        }
      });

      if (error) {
        Alert.alert('Signup Error', error.message);
        return;
      }

      if (data.user) {
        Alert.alert(
          'Success', 
          'Account created successfully! Please check your email for verification.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to login page or clear form
                setEmail('');
                setPassword('');
                setFullName('');
                router.push('/loginpage');
              }
            }
          ]
        );
      }

    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ══ HERO ══════════════════════════════ */}
        <View style={styles.hero}>
          <FloatOrb delay={0} style={styles.orbA} />
          <FloatOrb delay={600} style={styles.orbB} />
          <FloatOrb delay={300} style={styles.orbC} />

          <Animated.View
            style={[
              styles.topBar,
              { opacity: heroFade, transform: [{ translateY: heroSlide }] },
            ]}
          >
            <Animated.Text
              style={[styles.logoText, { transform: [{ scale: logoScale }] }]}
            >
              Tripzy
            </Animated.Text>
          </Animated.View>

          <Animated.View style={[styles.welcomePill, { opacity: pillFade }]}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>Let's get you started 🌍</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: heroFade,
              transform: [{ translateY: heroSlide }],
            }}
          >
            <Text style={styles.heroH1}>Create Your{"\n"}Account.</Text>
            <Text style={styles.heroSub}>Join us today and start your journey! Create an account to access exclusive features and personalized content.</Text>
          </Animated.View>
        </View>

        {/* ══ FORM SECTION ══════════════════════ */}
        <View style={styles.sectionContainer}>
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>📝 Your Details</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              placeholderTextColor={C.textMuted}
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Email Address"
              placeholderTextColor={C.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Password"
              placeholderTextColor={C.textMuted}
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSignup}
              disabled={loading}
            >
              <View style={[styles.saveBtnGradient, { backgroundColor: C.blue }, loading && styles.saveBtnDisabled]}>
                <Text style={styles.saveBtnText}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Already have account */}
          <View style={styles.infoCard}>
            <View style={styles.loginRow}>
              <Text style={styles.infoText}>Already have an account? </Text>
              <Text style={styles.loginLink} onPress={() => router.replace('/loginpage')}>
                Login account
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignupPage;

// ─── STYLES ───────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Hero
  hero: {
    backgroundColor: C.white,
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 28,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },

  // Orbs
  orbA: {
    position: "absolute",
    top: -48,
    right: -48,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: C.blue,
    opacity: 0.07,
  },
  orbB: {
    position: "absolute",
    bottom: -30,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: C.blueLight,
    opacity: 0.09,
  },
  orbC: {
    position: "absolute",
    top: 110,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.blue,
    opacity: 0.05,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 46,
    fontWeight: "900",
    color: C.blue,
    fontFamily: "serif",
    letterSpacing: 1.5,
  },

  // Welcome pill
  welcomePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.blueSoft,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: C.blueMid,
    gap: 8,
  },
  pillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.blue },
  pillText: {
    color: C.blue,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Hero text
  heroH1: {
    fontSize: 40,
    fontWeight: "900",
    color: C.navy,
    lineHeight: 48,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
    marginBottom: 0,
  },

  // Section Container
  sectionContainer: {
    padding: 20,
  },

  // Form Card
  formCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: C.navy,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.navy,
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: C.blueMid,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: C.navy,
    backgroundColor: C.bg,
  },

  // Save / Submit Button
  saveBtn: {
    marginTop: 24,
  },
  saveBtnGradient: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Info Card (login link)
  infoCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 14,
    color: C.textMuted,
  },
  loginLink: {
    fontSize: 14,
    color: C.blue,
    fontWeight: '700',
  },
});