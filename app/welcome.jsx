import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
<<<<<<< HEAD
=======
  Easing,
>>>>>>> 3059b579aacc5567c940dd6b15aa99aa7a3ead31
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const C = {
  bg: "#F9FAFC", // Soft premium white canvas
  primary: "#1A6BFF", // Rich functional blue
  primarySubtle: "rgba(26, 107, 255, 0.05)",
  textMain: "#09152E", // Midnight slate
  textMuted: "#6B7C96", // Smooth neutral body text
  cardBg: "#FFFFFF",
  cardBorder: "#EAEFF8",
};

const FEATURES = [
  { icon: "📅", title: "Smart Paths", desc: "AI itineraries" },
  { icon: "🗺️", title: "Live Maps", desc: "Real-time sync" },
  { icon: "⛅", title: "Alerts", desc: "Live weather" },
  { icon: "💬", title: "Hub", desc: "Global chats" },
];

const Welcome = () => {
  const router = useRouter();

<<<<<<< HEAD
  // Animation Trackers
  const fadeContent = useRef(new Animated.Value(0)).current;
  const slideHeader = useRef(new Animated.Value(40)).current;
=======
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const pillFade = useRef(new Animated.Value(0)).current;
  const sloganFade = useRef(new Animated.Value(0)).current;
  const sloganSlide = useRef(new Animated.Value(16)).current;
  const imageFade = useRef(new Animated.Value(0)).current;
>>>>>>> 3059b579aacc5567c940dd6b15aa99aa7a3ead31
  const imageScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeContent, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
<<<<<<< HEAD
      Animated.stagger(100, [
        Animated.spring(slideHeader, {
          toValue: 0,
          friction: 8,
          tension: 35,
          useNativeDriver: true,
        }),
        Animated.spring(imageScale, {
          toValue: 1,
          friction: 8,
          tension: 30,
          useNativeDriver: true,
        }),
      ]),
=======
      Animated.timing(imageFade, {
        toValue: 1,
        duration: 700,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        delay: 300,
        useNativeDriver: true,
      }),
>>>>>>> 3059b579aacc5567c940dd6b15aa99aa7a3ead31
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.mainContainer}>
        {/* ── DESIGN HERO CONTAINER ────────────────── */}
        <Animated.View
          style={[
            s.heroVisualWrapper,
            { opacity: fadeContent, transform: [{ scale: imageScale }] },
          ]}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            }}
            style={s.heroImage}
            resizeMode="cover"
          />
          <View style={s.imageOverlay} />

<<<<<<< HEAD
          {/* Floating Context Pill 1 */}
          <View style={s.floatingBadge1}>
            <Text style={s.badgeEmoji}>✈️</Text>
            <View>
              <Text style={s.badgeTitle}>120+ Countries</Text>
              <Text style={s.badgeSubtitle}>Ready to explore</Text>
            </View>
=======
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
        {/* Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: imageFade,
              transform: [{ scale: imageScale }],
            },
          ]}
        >
          <Image
            source={require("C:/Users/dulas/OneDrive/Documents/GitHub/Tripzy-Application/assets/images/welcome-back.jpg")}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </Animated.View>
        

        {/* Buttons */}
        <TouchableOpacity style={styles.saveBtn} onPress={() => router.push('/loginpage')}>
          <View style={[styles.saveBtnGradient, { backgroundColor: C.blue }]}>
            <Text style={styles.saveBtnText}>Application Login</Text>
>>>>>>> 3059b579aacc5567c940dd6b15aa99aa7a3ead31
          </View>

          {/* Floating Context Pill 2 */}
          <View style={s.floatingBadge2}>
            <Text style={s.badgeEmoji}>⭐</Text>
            <Text style={s.badgeTitle}>4.9 Rating</Text>
          </View>
        </Animated.View>

        {/* ── TYPOGRAPHY TEXT LAYERS ────────────────── */}
        <Animated.View
          style={[
            s.textBlock,
            { opacity: fadeContent, transform: [{ translateY: slideHeader }] },
          ]}
        >
          <View style={s.pillWrapper}>
            <View style={s.appPill}>
              <Text style={s.appPillText}>WELCOME TO TRIPZY</Text>
            </View>
          </View>

          <Text style={s.heroTitle}>
            The world is waiting,{"\n"}discover your{" "}
            <Text style={s.accentText}>story.</Text>
          </Text>
          <Text style={s.heroSubtitle}>
            Plan smart routes, track shifts instantly, and map your global
            adventures alongside an open community.
          </Text>
        </Animated.View>

        {/* ── MODERN FEATURE GRID ────────────────── */}
        <Animated.View
          style={[
            s.featuresGrid,
            { opacity: fadeContent, transform: [{ translateY: slideHeader }] },
          ]}
        >
          {FEATURES.map((feat, index) => (
            <View key={index} style={s.featureBox}>
              <View style={s.featIconBg}>
                <Text style={s.featIcon}>{feat.icon}</Text>
              </View>
              <View style={s.featTextCol}>
                <Text style={s.featTitle}>{feat.title}</Text>
                <Text style={s.featDesc}>{feat.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* ── FUNCTION BUTTON ACTIONS FOOTER ────────────── */}
        <Animated.View
          style={[
            s.actionBlock,
            { opacity: fadeContent, transform: [{ translateY: slideHeader }] },
          ]}
        >
          <TouchableOpacity
            style={s.buttonPrimary}
            activeOpacity={0.88}
            onPress={() => router.push("/signup")}
          >
            <Text style={s.buttonPrimaryText}>Get Started — It's Free</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.buttonSecondary}
            activeOpacity={0.75}
            onPress={() => router.push("/loginpage")}
          >
            <Text style={s.buttonSecondaryText}>I Already Have an Account</Text>
          </TouchableOpacity>

          <Text style={s.legalFootnote}>
            By continuing, you agree to our standard Terms & Privacy Policy.
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default Welcome;

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 24,
<<<<<<< HEAD
    paddingTop: height * 0.05, // Screen එකේ උස අනුව dynamic padding
    paddingBottom: height * 0.03,
    justifyContent: "space-between", // Elements ටික screen එක පුරා සමානව බෙදී යයි
=======
    paddingTop: 58,
    paddingBottom: 28,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    marginBottom: 8,
    overflow: "hidden",
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
>>>>>>> 3059b579aacc5567c940dd6b15aa99aa7a3ead31
  },

  // Image Layout
  heroVisualWrapper: {
    width: "100%",
    height: height * 0.28, // Scroll නොවීමට image එක මදක් කුඩා කර ඇත
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9, 21, 46, 0.03)",
    borderRadius: 28,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  // Badges
  floatingBadge1: {
    position: "absolute",
    bottom: -8,
    left: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
    elevation: 4,
    shadowColor: C.textMain,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  floatingBadge2: {
    position: "absolute",
    top: 14,
    right: -6,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
    elevation: 4,
    shadowColor: C.textMain,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  badgeEmoji: { fontSize: 16 },
  badgeTitle: { fontSize: 12, fontWeight: "700", color: C.textMain },
  badgeSubtitle: { fontSize: 10, color: C.textMuted },

  // Typography
  textBlock: {
    marginTop: 12,
  },
  pillWrapper: {
    flexDirection: "row",
    marginBottom: 8,
  },
  appPill: {
    backgroundColor: C.primarySubtle,
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  appPillText: {
    color: C.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: C.textMain,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  accentText: { color: C.primary },
  heroSubtitle: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 20,
    marginTop: 8,
  },

  // Grid Layout
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginVertical: 12,
  },
  featureBox: {
    width: "48%",
    backgroundColor: C.cardBg,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 16,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
<<<<<<< HEAD
  featIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
=======
  pillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.blue },
  pillText: {
    color: C.blue,
    fontSize: 13,
    fontWeight: "700",
    letterSpecing: 0.3,
>>>>>>> 3059b579aacc5567c940dd6b15aa99aa7a3ead31
  },
  featIcon: { fontSize: 14 },
  featTextCol: { flex: 1 },
  featTitle: { fontSize: 12, fontWeight: "700", color: C.textMain },
  featDesc: { fontSize: 10, color: C.textMuted },

<<<<<<< HEAD
  // Actions Button Section
  actionBlock: {
    width: "100%",
  },
  buttonPrimary: {
    backgroundColor: C.primary,
=======
  // Hero slogan & subtext
  heroSlogan: {
    fontSize: 28,
    fontWeight: "900",
    color: C.navy,
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  heroSub: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
  },

  // Section Container
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
    flex: 1,
  },

  // Image Container
  imageContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 440,
    backgroundColor: C.blueSoft,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },

  // Info Card
  infoCard: {
    backgroundColor: C.white,
>>>>>>> 3059b579aacc5567c940dd6b15aa99aa7a3ead31
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonSecondaryText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  legalFootnote: {
    fontSize: 10,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 14,
    marginTop: 8,
    opacity: 0.7,
  },
});
