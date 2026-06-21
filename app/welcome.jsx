import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
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

  // Animation Trackers
  const fadeContent = useRef(new Animated.Value(0)).current;
  const slideHeader = useRef(new Animated.Value(40)).current;
  const imageScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeContent, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
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

          {/* Floating Context Pill 1 */}
          <View style={s.floatingBadge1}>
            <Text style={s.badgeEmoji}>✈️</Text>
            <View>
              <Text style={s.badgeTitle}>120+ Countries</Text>
              <Text style={s.badgeSubtitle}>Ready to explore</Text>
            </View>
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
            <Text style={s.buttonPrimaryText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.buttonSecondary}
            activeOpacity={0.75}
            onPress={() => router.push("/loginpage")}
          >
            <Text style={s.buttonSecondaryText}>I already have an account</Text>
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
    paddingTop: height * 0.05,
    paddingBottom: height * 0.03,
    justifyContent: "space-between",
  },

  // Image Layout
  heroVisualWrapper: {
    width: "100%",
    height: height * 0.28,
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
  featIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  featIcon: { fontSize: 14 },
  featTextCol: { flex: 1 },
  featTitle: { fontSize: 12, fontWeight: "700", color: C.textMain },
  featDesc: { fontSize: 10, color: C.textMuted },

  // Actions Button Section
  actionBlock: {
    width: "100%",
  },
  buttonPrimary: {
    backgroundColor: C.primary,
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
