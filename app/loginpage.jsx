import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

const C = {
  navy: "#1A6BFF",
  navyMid: "#1A3A7A",
  blue: "#1A6BFF",
  gold: "#FFD166",
  teal: "#06D6A0",
  white: "#FFFFFF",
  offWhite: "#F4F7FF",
  inputBg: "#F0F4FF",
  border: "#D0E2FF",
  textMuted: "#6B80A3",
  danger: "#FF3B30",
};

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const fadeAll = useRef(new Animated.Value(0)).current;
  const slideHero = useRef(new Animated.Value(-24)).current;
  const slideForm = useRef(new Animated.Value(36)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAll, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideHero, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideForm, {
        toValue: 0,
        duration: 680,
        delay: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Validation ─────────────────────────────────
  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const validateForm = () => {
    if (!email.trim())
      return { isValid: false, message: "Please enter your email address" };
    if (!validateEmail(email))
      return { isValid: false, message: "Please enter a valid email address" };
    if (!password)
      return { isValid: false, message: "Please enter your password" };
    return { isValid: true, message: "" };
  };

  const handleAuthError = (error) => {
    const msg = error.message;
    if (msg.includes("Invalid login credentials"))
      return "Invalid email or password. Please try again.";
    if (msg.includes("Email not confirmed"))
      return "Please confirm your email before logging in.";
    if (msg.includes("Email rate limit exceeded"))
      return "Too many attempts. Try again in a few minutes.";
    if (msg.includes("User not found"))
      return "No account found with this email. Please sign up first.";
    return msg || "An unexpected error occurred. Please try again.";
  };

  // ── Login ──────────────────────────────────────
  const handleLogin = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert("Validation Error", validation.message);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        Alert.alert("Login Error", handleAuthError(error));
        return;
      }
      if (data.user && data.session) {
        if (!data.user.email_confirmed_at) {
          Alert.alert(
            "Email Not Verified",
            "Please verify your email before logging in.",
            [
              {
                text: "Resend Verification",
                onPress: () => resendVerificationEmail(data.user.email),
              },
              { text: "OK", style: "cancel" },
            ],
          );
          return;
        }
        Alert.alert("Success!", "You have successfully logged in.", [
          {
            text: "Continue",
            onPress: () => {
              setEmail("");
              setPassword("");
              router.replace("/profile");
            },
          },
        ]);
      }
    } catch (e) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (userEmail) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
      });
      Alert.alert(
        error ? "Error" : "Success",
        error
          ? "Failed to resend. Please try again."
          : "Verification email sent! Check your inbox.",
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address first");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: "myapp://auth/reset-password",
        },
      );
      Alert.alert(
        error ? "Error" : "Success",
        error
          ? "Failed to send reset email. Please try again."
          : "Password reset email sent! Check your inbox.",
      );
    } catch (e) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  const isReady = !loading && email.length > 0 && password.length > 0;

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      {/* ── HERO ─────────────────────────────────── */}
      <View style={s.hero}>
        <View style={s.orb1} />
        <View style={s.orb2} />
        <View style={s.orb3} />

        <Animated.View
          style={{ opacity: fadeAll, transform: [{ translateY: slideHero }] }}
        >
          <Text style={s.logoText}>Tripzy</Text>

          <View style={s.heroTextRow}>
            <View style={s.heroAccentBar} />
            <View>
              <Text style={s.heroTitle}>Welcome{"\n"}Back.</Text>
              <Text style={s.heroSub}>Sign in to continue your adventure</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* ── FORM ─────────────────────────────────── */}
      <ScrollView
        style={s.formScroll}
        contentContainerStyle={s.formContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAll, transform: [{ translateY: slideForm }] }}
        >
          {/* Email */}
          <Text style={s.fieldLabel}>Email Address</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>✉️</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={C.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          {/* Password */}
          <Text style={s.fieldLabel}>Password</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Enter your password"
              placeholderTextColor={C.textMuted}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
              style={s.eyeBtn}
            >
              <Text style={s.eyeText}>{showPass ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          {/* Forgot */}
          <TouchableOpacity
            style={s.forgotRow}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={s.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In button */}
          <TouchableOpacity
            style={[s.btnPrimary, !isReady && s.btnDisabled]}
            onPress={handleLogin}
            disabled={!isReady}
            activeOpacity={0.85}
          >
            <Text style={s.btnPrimaryText}>
              {loading ? "Signing In…" : "Sign In →"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divRow}>
            <View style={s.divLine} />
            <Text style={s.divText}>or</Text>
            <View style={s.divLine} />
          </View>

          {/* Sign up link */}
          <View style={s.signupRow}>
            <Text style={s.signupText}>New to Tripzy? </Text>
            <TouchableOpacity
              onPress={() => router.push("/signup")}
              disabled={loading}
            >
              <Text style={s.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.navy },

  // ── Hero ──────────────────────────────────────
  hero: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 36,
    overflow: "hidden",
  },
  orb1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: C.blue,
    opacity: 0.22,
    top: -70,
    right: -60,
  },
  orb2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: C.teal,
    opacity: 0.12,
    bottom: 0,
    left: -30,
  },
  orb3: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: C.gold,
    opacity: 0.15,
    top: 100,
    right: 50,
  },

  logoText: {
    fontSize: 28,
    fontWeight: "900",
    color: "rgba(255,255,255,0.55)",
    fontFamily: "serif",
    letterSpacing: 2,
    marginBottom: 22,
  },

  heroTextRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  heroAccentBar: {
    width: 5,
    height: 80,
    borderRadius: 3,
    backgroundColor: C.gold,
    marginTop: 4,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: "900",
    color: C.white,
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 20,
  },

  // ── Form ──────────────────────────────────────
  formScroll: {
    backgroundColor: C.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.navy,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 18,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.navy,
    paddingVertical: 14,
  },
  eyeBtn: { padding: 6 },
  eyeText: { fontSize: 16 },

  forgotRow: { alignItems: "flex-end", marginTop: 10, marginBottom: 24 },
  forgotText: { fontSize: 13, color: C.blue, fontWeight: "700" },

  btnPrimary: {
    backgroundColor: C.navy,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.45 },
  btnPrimaryText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  divRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 22,
  },
  divLine: { flex: 1, height: 1, backgroundColor: C.border },
  divText: { fontSize: 13, color: C.textMuted, fontWeight: "600" },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: { fontSize: 14, color: C.textMuted },
  signupLink: { fontSize: 14, color: C.blue, fontWeight: "800" },
});
