import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

// ─── THEME ────────────────────────────────────────
const C = {
  bg: "#F4F7FF",
  white: "#FFFFFF",
  navy: "#0A1F44",
  blue: "#1A6BFF",
  blueSoft: "#EAF0FF",
  blueLight: "#5B9BFF",
  blueMid: "#D0E2FF",
  text: "#0A1F44",
  textMuted: "#6B80A3",
};

const featureCardsData = [
  {
    name: "Trip Planning",
    description: "Craft the perfect journey, stop by stop.",
    icon: "📅",
    target: "/app-pages/plan",
    accentBg: "#EAF0FF",
    accentIcon: "#1A6BFF",
  },
  {
    name: "Travel Map",
    description: "Pin your world. Own your adventures.",
    icon: "🗺️",
    target: "/app-pages/map",
    accentBg: "#E6F9F8",
    accentIcon: "#0CB8B0",
  },
  {
    name: "Travel Feed",
    description: "Stories that inspire your next escape.",
    icon: "🔖",
    target: "/app-pages/feed",
    accentBg: "#EDE8FF",
    accentIcon: "#6C47FF",
  },
  {
    name: "Travel Guide",
    description: "Local wisdom, curated for you.",
    icon: "📖",
    target: "/app-pages/TourGuide",
    accentBg: "#E8F5FF",
    accentIcon: "#1A6BFF",
  },
  {
    name: "Community",
    description: "Find your tribe across the globe.",
    icon: "💬",
    target: "/app-pages/community",
    accentBg: "#E6F9F1",
    accentIcon: "#0CB870",
  },
  {
    name: "Weather",
    description: "Pack smart. Travel confident.",
    icon: "⛅",
    target: "/app-pages/weather",
    accentBg: "#E8F2FF",
    accentIcon: "#3B9EFF",
  },
];

// ─── Animated floating orb ────────────────────────
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

// ─── Feature Card ─────────────────────────────────
const FeatureCard = ({ feature, index, onPress }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(28)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        delay: 200 + index * 95,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 500,
        delay: 200 + index * 95,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fade,
        transform: [{ translateY: slide }, { scale }],
        width: (width - 52) / 2,
        marginBottom: 14,
        marginRight: index % 2 === 0 ? 12 : 0,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onPress(feature.target)}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }).start()
        }
      >
        <View style={[styles.card, { borderColor: feature.accentIcon + "28" }]}>
          <View
            style={[styles.cardStripe, { backgroundColor: feature.accentIcon }]}
          />
          <View
            style={[styles.iconWrap, { backgroundColor: feature.accentBg }]}
          >
            <Text style={styles.cardIcon}>{feature.icon}</Text>
          </View>
          <Text style={styles.cardName}>{feature.name}</Text>
          <Text style={styles.cardDesc}>{feature.description}</Text>
          <View
            style={[
              styles.cardChip,
              { backgroundColor: feature.accentIcon + "15" },
            ]}
          >
            <Text style={[styles.cardChipText, { color: feature.accentIcon }]}>
              Explore →
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main ─────────────────────────────────────────
const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const pillFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCurrentUser();
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) setUser(session.user);
      else if (event === "SIGNED_OUT") {
        setUser(null);
        router.replace("/loginpage");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const getCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>Tripzy</Text>
        <View style={styles.splashDots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.splashDot, { opacity: 0.25 + i * 0.38 }]}
            />
          ))}
        </View>
      </View>
    );

  if (!user)
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>Tripzy</Text>
        <TouchableOpacity
          style={styles.splashBtn}
          onPress={() => router.push("/loginpage")}
        >
          <Text style={styles.splashBtnText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );

  const firstName = (user.user_metadata?.full_name || "Traveler").split(" ")[0];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ══ HERO ══════════════════════════════ */}
        <View style={styles.hero}>
          {/* Decorative orbs — blue tints only */}
          <FloatOrb delay={0} style={styles.orbA} />
          <FloatOrb delay={600} style={styles.orbB} />
          <FloatOrb delay={300} style={styles.orbC} />

          {/* Top bar: TRIPZY logo + profile */}
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
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push("/app-pages/profile")}
            >
              <Text style={styles.profileEmoji}>👤</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Welcome pill */}
          <Animated.View style={[styles.welcomePill, { opacity: pillFade }]}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>Welcome back, {firstName}! 🌍</Text>
          </Animated.View>

          {/* Headline */}
          <Animated.View
            style={{
              opacity: heroFade,
              transform: [{ translateY: heroSlide }],
            }}
          >
            <Text style={styles.heroH1}>The World{"\n"}is Yours.</Text>
            <Text style={styles.heroSub}>
              Travel light. Feel deep.{"\n"}Your next adventure starts here.
            </Text>
          </Animated.View>

          {/* CTA buttons */}
          <Animated.View style={[styles.ctaRow, { opacity: pillFade }]}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={() => router.push("/app-pages/plan")}
            >
              <Text style={styles.ctaPrimaryText}>＋ Plan a Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaSecondary}
              onPress={() => router.push("/app-pages/feed")}
            >
              <Text style={styles.ctaSecondaryText}>Explore</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats strip */}
          <Animated.View style={[styles.statsRow, { opacity: pillFade }]}>
            {[
              ["🌏", "120+ Destinations"],
              ["✈️", "Smart Itineraries"],
              ["👥", "Live Community"],
            ].map(([icon, label]) => (
              <View key={label} style={styles.statItem}>
                <Text style={styles.statIcon}>{icon}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* ══ SECTION HEADER ══════════════════ */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.sectionPill}>
            <Text style={styles.sectionPillText}>All</Text>
          </View>
        </View>

        {/* ══ FEATURE GRID ══════════════════════ */}
        <View style={styles.grid}>
          {featureCardsData.map((f, i) => (
            <FeatureCard
              key={f.name}
              feature={f}
              index={i}
              onPress={(p) => router.push(p)}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
};

// ─── STYLES ───────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Splash / loading
  splash: {
    flex: 1,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  splashLogo: {
    fontSize: 58,
    fontWeight: "900",
    color: C.blue,
    fontFamily: "serif",
    letterSpacing: 2,
  },
  splashDots: { flexDirection: "row", gap: 8 },
  splashDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.blue },
  splashBtn: {
    backgroundColor: C.blue,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 50,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  splashBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  // Hero
  hero: {
    backgroundColor: C.white,
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 28,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    marginBottom: 4,
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
    textShadowColor: C.blue + "35",
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.blueMid,
  },
  profileEmoji: { fontSize: 19 },

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
    fontSize: 46,
    fontWeight: "900",
    color: C.navy,
    lineHeight: 52,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 15,
    color: C.textMuted,
    lineHeight: 23,
    fontStyle: "italic",
    marginBottom: 26,
  },

  // CTAs
  ctaRow: { flexDirection: "row", gap: 12, marginBottom: 22 },
  ctaPrimary: {
    flex: 1,
    backgroundColor: C.blue,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 7,
  },
  ctaPrimaryText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  ctaSecondary: {
    flex: 1,
    borderWidth: 2,
    borderColor: C.blueMid,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: C.blueSoft,
  },
  ctaSecondaryText: {
    color: C.blue,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    backgroundColor: C.bg,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    justifyContent: "space-around",
    borderWidth: 1.5,
    borderColor: C.blueMid,
  },
  statItem: { alignItems: "center", gap: 4 },
  statIcon: { fontSize: 18 },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textAlign: "center",
    letterSpacing: 0.2,
  },

  // Section header
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.navy,
    letterSpacing: -0.3,
  },
  sectionPill: {
    backgroundColor: C.blueSoft,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: C.blueMid,
  },
  sectionPillText: { color: C.blue, fontSize: 12, fontWeight: "700" },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20 },

  // Cards
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3.5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  cardIcon: { fontSize: 22 },
  cardName: {
    fontSize: 14,
    fontWeight: "800",
    color: C.navy,
    marginBottom: 5,
    letterSpacing: 0.1,
  },
  cardDesc: {
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 17,
    marginBottom: 12,
  },
  cardChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardChipText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },

  // Quote banner
  quoteBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    borderColor: C.blueMid,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  quoteBar: {
    width: 36,
    height: 4,
    backgroundColor: C.blue,
    borderRadius: 4,
    marginBottom: 14,
  },
  quoteText: {
    fontSize: 15,
    color: C.navy,
    fontStyle: "italic",
    lineHeight: 23,
    fontWeight: "500",
    marginBottom: 10,
  },
  quoteAuthor: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "700",
    letterSpacing: 1,
  },
});

export default HomePage;
