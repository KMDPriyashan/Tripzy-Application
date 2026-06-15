import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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

const Welcome = () => {
  const router = useRouter();

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const pillFade = useRef(new Animated.Value(0)).current;
  const sloganFade = useRef(new Animated.Value(0)).current;
  const sloganSlide = useRef(new Animated.Value(16)).current;

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
      Animated.timing(sloganFade, {
        toValue: 1,
        duration: 650,
        delay: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sloganSlide, {
        toValue: 0,
        duration: 650,
        delay: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

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
          <Text style={styles.pillText}>Welcome aboard 🌍</Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: sloganFade,
            transform: [{ translateY: sloganSlide }],
          }}
        >
          <Text style={styles.heroSlogan}>Travel Far. Travel Smart.</Text>
          <Text style={styles.heroSub}>Tripzy helps you plan, book, and enjoy every trip with ease.</Text>
        </Animated.View>
      </View>

      {/* ══ CONTENT ══════════════════════════════ */}
      <View style={styles.sectionContainer}>
        {/* Heading & Paragraph */}
        <View style={styles.infoCard}>
          <Text style={styles.mainHeading}>Manage Your{"\n"}Traveling Journey</Text>
          <Text style={styles.paragraphText}>
            Discover your next adventure with ease—use our app to unlock exciting
            new travel deals and journey smarter!
          </Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.saveBtn} onPress={() => router.push('/loginpage')}>
          <View style={[styles.saveBtnGradient, { backgroundColor: C.blue }]}>
            <Text style={styles.saveBtnText}>Application Login</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/signup')}>
          <Text style={styles.secondaryButtonText}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Welcome;

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

  // Hero slogan & subtext
  heroSlogan: {
    fontSize: 28,
    fontWeight: "900",
    color: C.navy,
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 8,
    marginTop : 20,
  },
  heroSub: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
  },

  // Section Container
  sectionContainer: {
    padding: 20,
  },

  // Info Card
  infoCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '900',
    color: C.navy,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  paragraphText: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Buttons
  saveBtn: {
    marginBottom: 14,
  },
  saveBtnGradient: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: C.white,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.blueMid,
  },
  secondaryButtonText: {
    color: C.blue,
    fontSize: 16,
    fontWeight: '700',
  },
});