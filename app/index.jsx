import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const C = {
  bg: "#EBF1FA", // Matte Premium Slate-Tint Canvas (No more stark white)
  cardBg: "#FFFFFF", // Clean white reserved only for structural components
  primary: "#1A6BFF", // Active Tripzy brand blue
  primarySubtle: "rgba(26, 107, 255, 0.06)",
  waveColor1: "#D3E4FF", // Richer contrasting blue wave depth
  waveColor2: "#C5DCFF", // Deepest accent wave structure to break empty space
  textMain: "#0A162F", // Luxurious deep navy
  textMuted: "#4A5568", // Strong visible gray for descriptions
  accentGold: "#FFB800", // Luxury warm accent trace
};

const Index = () => {
  const router = useRouter();

  // Animations States
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;

  // Wave floating loops to continually warp background emptiness
  const waveMove1 = useRef(new Animated.Value(0)).current;
  const waveMove2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance Anim
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start();

    // Responsive Background Flow
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(waveMove1, {
            toValue: 18,
            duration: 4500,
            useNativeDriver: true,
          }),
          Animated.timing(waveMove1, {
            toValue: 0,
            duration: 4500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(waveMove2, {
            toValue: -14,
            duration: 3800,
            useNativeDriver: true,
          }),
          Animated.timing(waveMove2, {
            toValue: 0,
            duration: 3800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    // Infinite Micro Pulsing for the Center Core Node
    const runPulse = () => {
      Animated.loop(
        Animated.stagger(600, [
          Animated.sequence([
            Animated.timing(pulse1, {
              toValue: 1.4,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulse1, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulse2, {
              toValue: 1.4,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulse2, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };

    runPulse();
  }, []);

  const opacity1 = pulse1.interpolate({
    inputRange: [1, 1.4],
    outputRange: [0.4, 0],
  });
  const opacity2 = pulse2.interpolate({
    inputRange: [1, 1.4],
    outputRange: [0.4, 0],
  });

  return (
    <View style={s.root}>
      {/* Set status bar to dark content over premium gray backdrop */}
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── HIGH-CONTRAST BALANCED BACKGROUND ARCHITECTURE ── */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Soft Contrast Top Mask */}
        <View style={s.topWaveDesign} />

        {/* Animated Solid Wave 1 (Deep base contrast) */}
        <Animated.View
          style={[s.waveBase, { transform: [{ translateY: waveMove1 }] }]}
        />

        {/* Animated Solid Wave 2 (Middle balance contrast) */}
        <Animated.View
          style={[s.waveOverlay, { transform: [{ translateY: waveMove2 }] }]}
        />

        {/* Left Side Ambient Bubble */}
        <View style={s.accentCircleLeft} />
      </View>

      <View style={s.mainWrapper}>
        {/* ── CENTRAL ARTWORK SECTION (HIGHLY ATTRACTIVE) ── */}
        <View style={s.artContainer}>
          {/* Animated Pulse Waves */}
          <Animated.View
            style={[
              s.pulseRing,
              { transform: [{ scale: pulse1 }], opacity: opacity1 },
            ]}
          />
          <Animated.View
            style={[
              s.pulseRing,
              { transform: [{ scale: pulse2 }], opacity: opacity2 },
            ]}
          />

          {/* Main Hero Circle */}
          <Animated.View style={[s.coreCircle, { opacity: fadeAnim }]}>
            <Text style={s.mainIcon}>🌍</Text>
          </Animated.View>

          {/* Luxury Floating UI Badges overlapping the core */}
          <Animated.View
            style={[
              s.floatBadge,
              s.badgeLeft,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={s.badgeEmoji}>✨</Text>
            <Text style={s.badgeTxt}>Explore</Text>
          </Animated.View>

          <Animated.View
            style={[
              s.floatBadge,
              s.badgeRight,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={s.badgeEmoji}>📍</Text>
            <Text style={s.badgeTxt}>Routes</Text>
          </Animated.View>

          <Animated.View
            style={[
              s.floatBadge,
              s.badgeBottom,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={s.badgeEmoji}>✈️</Text>
            <Text style={s.badgeTxt}>Tripzy Life</Text>
          </Animated.View>
        </View>

        {/* ── TYPOGRAPHY & APP ESSENCE SECTION ── */}
        <Animated.View
          style={[
            s.infoContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={s.tagRow}>
            <View style={s.brandTag}>
              <Text style={s.brandTagTxt}>YOUR GLOBAL COMPANION</Text>
            </View>
          </View>

          <Text style={s.title}>
            Discover paths,{"\n"}define your{" "}
            <Text style={s.blueTxt}>adventure.</Text>
          </Text>

          <Text style={s.subtitle}>
            Welcome to Tripzy. The seamless ecosystem built to map steps, sync
            live tracking, and create timeless memories worldwide.
          </Text>
        </Animated.View>

        {/* ── FUNCTIONAL ACTION BAR FOOTER ── */}
        <Animated.View style={[s.footerContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={s.btnMain}
            activeOpacity={0.9}
            onPress={() => router.push("/welcome")}
          >
            <Text style={s.btnMainTxt}>Let's Go</Text>
            <View style={s.arrowBubble}>
              <Text style={s.arrowTxt}>➔</Text>
            </View>
          </TouchableOpacity>

          <Text style={s.versionFlag}>
            Version 1.1.0 • Built for Modern Travelers
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default Index;

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg, // Uses the solid matte gray-blue foundation
  },
  mainWrapper: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.03,
    justifyContent: "space-between",
  },

  // Deep contrasting shapes to safely kill white emptiness
  topWaveDesign: {
    position: "absolute",
    top: -height * 0.15,
    right: -width * 0.2,
    width: width * 1.4,
    height: height * 0.48,
    borderRadius: width * 0.7,
    backgroundColor: "#DCE7F7", // Darker sub-tone slate for the top section
  },
  waveBase: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    bottom: height * 0.1,
    right: -width * 0.25,
    backgroundColor: C.waveColor1,
    opacity: 0.85,
  },
  waveOverlay: {
    position: "absolute",
    width: width * 1.0,
    height: width * 1.0,
    borderRadius: (width * 1.0) / 2,
    bottom: height * 0.05,
    left: -width * 0.2,
    backgroundColor: C.waveColor2,
    opacity: 0.9,
  },
  accentCircleLeft: {
    position: "absolute",
    bottom: height * 0.35,
    left: -width * 0.15,
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: (width * 0.45) / 2,
    backgroundColor: "rgba(255, 184, 0, 0.06)", // Vibrant gold particle flash
  },

  // Central Core Section
  artContainer: {
    height: height * 0.38,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 20,
    zIndex: 10,
  },
  coreCircle: {
    width: width * 0.38,
    height: width * 0.38,
    borderRadius: (width * 0.38) / 2,
    backgroundColor: C.cardBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(26, 107, 255, 0.1)",
    elevation: 10,
    shadowColor: C.textMain,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    zIndex: 10,
  },
  mainIcon: { fontSize: 56 },
  pulseRing: {
    position: "absolute",
    width: width * 0.38,
    height: width * 0.38,
    borderRadius: (width * 0.38) / 2,
    borderWidth: 2,
    borderColor: C.primary,
    zIndex: 1,
  },

  // Floating Luxe Badges System (Popping out cleanly over dark waves)
  floatBadge: {
    position: "absolute",
    backgroundColor: C.cardBg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
    elevation: 8,
    shadowColor: C.textMain,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    zIndex: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  badgeEmoji: { fontSize: 13 },
  badgeTxt: { fontSize: 12, fontWeight: "700", color: C.textMain },
  badgeLeft: { top: "22%", left: "4%" },
  badgeRight: { top: "34%", right: "2%" },
  badgeBottom: { bottom: "16%", left: "26%" },

  // Typography Text Section
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 10,
    zIndex: 10,
  },
  tagRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  brandTag: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(26, 107, 255, 0.15)",
  },
  brandTagTxt: {
    color: C.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    color: C.textMain,
    lineHeight: 46,
    letterSpacing: -0.6,
  },
  blueTxt: { color: C.primary },
  subtitle: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
    marginTop: 14,
    fontWeight: "500",
  },

  // Bottom Interactive Bar System
  footerContainer: {
    width: "100%",
    zIndex: 10,
  },
  btnMain: {
    backgroundColor: C.primary,
    borderRadius: 22,
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 24,
    paddingRight: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  btnMainTxt: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  arrowBubble: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowTxt: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  versionFlag: {
    fontSize: 11,
    color: C.textMuted,
    textAlign: "center",
    marginTop: 16,
    opacity: 0.6,
    fontWeight: "600",
  },
});
