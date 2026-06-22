import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Modal,
  Pressable,
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
  danger: "#FF3B30",
  dangerSoft: "#FFF0EF",
};

// ─── Feature data — now with a themed photo + colored gradient per card ──
const featureCardsData = [
  {
    name: "Trip Planning",
    description: "Craft the perfect journey, stop by stop.",
    icon: "📅",
    target: "/app-pages/plan",
    accentIcon: "#1A6BFF",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
    gradient: ["transparent", "rgba(26,107,255,0.55)", "rgba(10,31,68,0.92)"],
  },
  {
    name: "Travel Map",
    description: "Pin your world. Own your adventures.",
    icon: "🗺️",
    target: "/app-pages/map",
    accentIcon: "#0CB8B0",
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80",
    gradient: ["transparent", "rgba(12,184,176,0.55)", "rgba(10,31,68,0.92)"],
  },
  {
    name: "Travel Feed",
    description: "Stories that inspire your next escape.",
    icon: "🔖",
    target: "/app-pages/feed",
    accentIcon: "#6C47FF",
    image:
      "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80",
    gradient: ["transparent", "rgba(108,71,255,0.55)", "rgba(10,31,68,0.92)"],
  },
  {
    name: "Travel Guide",
    description: "Local wisdom, curated for you.",
    icon: "📖",
    target: "/app-pages/TourGuide",
    accentIcon: "#1A6BFF",
    image:
      "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&q=80",
    gradient: ["transparent", "rgba(26,107,255,0.55)", "rgba(10,31,68,0.92)"],
  },
  {
    name: "Community",
    description: "Find your tribe across the globe.",
    icon: "💬",
    target: "/app-pages/community",
    accentIcon: "#0CB870",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
    gradient: ["transparent", "rgba(12,184,112,0.55)", "rgba(10,31,68,0.92)"],
  },
  {
    name: "Weather",
    description: "Pack smart. Travel confident.",
    icon: "⛅",
    target: "/app-pages/weather",
    accentIcon: "#3B9EFF",
    image:
      "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=600&q=80",
    gradient: ["transparent", "rgba(59,158,255,0.55)", "rgba(10,31,68,0.92)"],
  },
];

// ─── Three-dot menu items ─────────────────────────
const MENU_ITEMS = [
  {
    label: "Notifications",
    icon: "notifications-outline",
    target: "/app-pages/Notifications",
    color: C.navy,
  },
  {
    label: "Settings & Privacy",
    icon: "settings-outline",
    target: "/app-pages/SettingsPrivacy",
    color: C.navy,
  },
  {
    label: "Help & Support",
    icon: "help-circle-outline",
    target: "/app-pages/HelpSupport",
    color: C.navy,
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

// ─── Feature Card (now photo-backed, gradient overlay, press-scale) ──────
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
        activeOpacity={0.92}
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
        <View style={styles.card}>
          <ImageBackground
            source={{ uri: feature.image }}
            style={styles.cardImageBg}
            imageStyle={styles.cardImageRadius}
          >
            {/* Colorful gradient overlay — keeps the title readable on any photo */}
            <LinearGradient
              colors={feature.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.cardGradient}
            />

            {/* Floating icon badge */}
            <View style={styles.iconWrap}>
              <Text style={styles.cardIcon}>{feature.icon}</Text>
            </View>

            {/* Title / description / chip sit on top of the gradient */}
            <View style={styles.cardBottomContent}>
              <Text style={styles.cardName}>{feature.name}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {feature.description}
              </Text>
              <View style={styles.cardChip}>
                <Text style={styles.cardChipText}>Explore →</Text>
              </View>
            </View>
          </ImageBackground>
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

  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

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

  const handleMenuItemPress = (target) => {
    setMenuVisible(false);
    router.push(target);
  };

  const handleLogoutPress = () => {
    setMenuVisible(false);
    // Small delay so the dropdown closes before the dialog appears
    setTimeout(() => setLogoutVisible(true), 150);
  };

  const confirmLogout = async () => {
    setLogoutVisible(false);
    await supabase.auth.signOut();
    // onAuthStateChange above will fire SIGNED_OUT and redirect
  };

  // ── Splash / loading ──
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
          <FloatOrb delay={0} style={styles.orbA} />
          <FloatOrb delay={600} style={styles.orbB} />
          <FloatOrb delay={300} style={styles.orbC} />

          {/* ── Top bar ─────────────────────── */}
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

            {/* ── Three-dot menu button (replaces profile emoji) ── */}
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={C.blue} />
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

      {/* ══ DROPDOWN MENU ════════════════════════════════════════════════ */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.dropdown}>
            {/* Decorative accent bar at top */}
            <View style={styles.dropdownAccent} />

            {MENU_ITEMS.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.dropdownRow,
                  idx < MENU_ITEMS.length - 1 && styles.dropdownRowBorder,
                ]}
                onPress={() => handleMenuItemPress(item.target)}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownIconWrap}>
                  <Ionicons name={item.icon} size={19} color={C.blue} />
                </View>
                <Text style={styles.dropdownLabel}>{item.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color={C.textMuted}
                />
              </TouchableOpacity>
            ))}

            <View style={styles.dropdownDivider} />

            {/* Logout row */}
            <TouchableOpacity
              style={styles.dropdownRow}
              onPress={handleLogoutPress}
              activeOpacity={0.7}
            >
              <View
                style={[styles.dropdownIconWrap, styles.dropdownIconDanger]}
              >
                <Ionicons name="log-out-outline" size={19} color={C.danger} />
              </View>
              <Text style={[styles.dropdownLabel, styles.dropdownLabelDanger]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ══ LOGOUT CONFIRMATION ══════════════════════════════════════════ */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconCircle}>
              <Ionicons name="log-out-outline" size={28} color={C.danger} />
            </View>
            <Text style={styles.confirmTitle}>Log Out</Text>
            <Text style={styles.confirmMsg}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.cancelBtn]}
                onPress={() => setLogoutVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, styles.logoutBtn]}
                onPress={confirmLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── STYLES ───────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Splash
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

  // ── Three-dot button — same sizing/shape as the original profileBtn ──
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.blueMid,
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

  // Section
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

  // ── Photo-backed cards ──────────────────────────────────────────────
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
  },
  cardImageBg: {
    width: "100%",
    height: 190,
    justifyContent: "space-between",
  },
  cardImageRadius: {
    borderRadius: 20,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    margin: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  cardIcon: { fontSize: 17 },
  cardBottomContent: {
    padding: 14,
    paddingTop: 0,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 0.1,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardDesc: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 16,
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  cardChipText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: "#FFFFFF",
  },

  // ── Dropdown ──────────────────────────────────────────────────────────
  menuOverlay: { flex: 1, backgroundColor: "rgba(10,31,68,0.18)" },
  dropdown: {
    position: "absolute",
    top: 72, // just below the top bar
    right: 20,
    width: 230,
    backgroundColor: C.white,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1,
    borderColor: C.blueMid,
  },
  dropdownAccent: { height: 4, backgroundColor: C.blue },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownRowBorder: { borderBottomWidth: 0.5, borderBottomColor: C.blueMid },
  dropdownIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownIconDanger: { backgroundColor: C.dangerSoft },
  dropdownLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: C.navy,
    letterSpacing: 0.1,
  },
  dropdownLabelDanger: { color: C.danger },
  dropdownDivider: {
    height: 0.5,
    backgroundColor: C.blueMid,
    marginHorizontal: 16,
  },

  // ── Logout confirmation ───────────────────────────────────────────────
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(10,31,68,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  confirmCard: {
    width: "100%",
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 26,
    alignItems: "center",
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: C.blueMid,
  },
  confirmIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.navy,
    marginBottom: 6,
  },
  confirmMsg: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 20,
  },
  confirmBtnRow: { flexDirection: "row", gap: 12, width: "100%" },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: C.blueSoft,
    borderWidth: 1.5,
    borderColor: C.blueMid,
  },
  cancelBtnText: { color: C.navy, fontWeight: "700", fontSize: 15 },
  logoutBtn: { backgroundColor: C.danger },
  logoutBtnText: { color: C.white, fontWeight: "700", fontSize: 15 },
});

export default HomePage;
