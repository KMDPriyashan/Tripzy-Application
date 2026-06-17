import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Theme ────────────────────────────────────────
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
  whatsapp: "#25D366",
  whatsappSoft: "#E8FBF0",
};

const WHATSAPP_NUMBER = "+94 77 123 4567"; // ← update to your real number
const WHATSAPP_RAW = "94771234567"; // ← digits only (no + or spaces)

const FAQ_ITEMS = [
  {
    q: "How do I create a new trip itinerary?",
    a: 'Tap the "Plan a Trip" button on the Home page, then follow the step-by-step wizard to add destinations, dates, and activities.',
  },
  {
    q: "Can I share my itinerary with friends?",
    a: "Yes! Open any saved itinerary, tap the share icon in the top-right corner, and choose how you want to share it.",
  },
  {
    q: "How do I change my profile information?",
    a: "Go to Settings & Privacy → Edit Profile to update your name, photo, and personal details.",
  },
  {
    q: "Is my location data stored?",
    a: "Location data is only used in-session to show nearby content. You can manage location sharing under Settings & Privacy → Location Sharing.",
  },
  {
    q: "How do I delete my account?",
    a: "Navigate to Settings & Privacy → Danger Zone → Delete Account. Note: this action is permanent and cannot be undone.",
  },
];

// ─── Expandable FAQ row ───────────────────────────
const FaqRow = ({ item, last }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.faqRow, last && styles.faqRowLast]}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQText}>{item.q}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={C.blue}
        />
      </TouchableOpacity>
      {open && <Text style={styles.faqAnswer}>{item.a}</Text>}
    </View>
  );
};

// ─── Main screen ──────────────────────────────────
const HelpSupportPage = () => {
  const router = useRouter();

  const openWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_RAW}?text=Hi%20Tripzy%20Support%2C%20I%20need%20help%20with...`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) Linking.openURL(url);
        else Linking.openURL(`https://wa.me/${WHATSAPP_RAW}`);
      })
      .catch(() => Linking.openURL(`https://wa.me/${WHATSAPP_RAW}`));
  };

  const openEmail = () =>
    Linking.openURL("mailto:support@tripzy.app?subject=Support%20Request");

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={C.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Hero banner ── */}
        <View style={styles.heroBanner}>
          <View style={styles.heroOrb} />
          <View style={styles.heroBadge}>
            <Ionicons name="headset-outline" size={32} color={C.blue} />
          </View>
          <Text style={styles.heroTitle}>We're here to help</Text>
          <Text style={styles.heroSub}>
            Reach our support team or browse answers to common questions below.
          </Text>
        </View>

        {/* ── Contact cards ── */}
        <Text style={styles.sectionLabel}>CONTACT US</Text>

        {/* WhatsApp */}
        <TouchableOpacity
          style={styles.contactCard}
          onPress={openWhatsApp}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.contactIconWrap,
              { backgroundColor: C.whatsappSoft },
            ]}
          >
            <Ionicons name="logo-whatsapp" size={26} color={C.whatsapp} />
          </View>
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>WhatsApp Support</Text>
            <Text style={styles.contactSub}>{WHATSAPP_NUMBER}</Text>
            <View style={styles.contactBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.contactBadgeText}>
                Usually replies in minutes
              </Text>
            </View>
          </View>
          <View
            style={[styles.contactArrow, { backgroundColor: C.whatsappSoft }]}
          >
            <Ionicons name="arrow-forward" size={16} color={C.whatsapp} />
          </View>
        </TouchableOpacity>

        {/* Email */}
        <TouchableOpacity
          style={styles.contactCard}
          onPress={openEmail}
          activeOpacity={0.85}
        >
          <View
            style={[styles.contactIconWrap, { backgroundColor: C.blueSoft }]}
          >
            <Ionicons name="mail-outline" size={24} color={C.blue} />
          </View>
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactSub}>support@tripzy.app</Text>
            <View style={styles.contactBadge}>
              <View
                style={[styles.onlineDot, { backgroundColor: C.blueLight }]}
              />
              <Text style={styles.contactBadgeText}>
                Response within 24 hours
              </Text>
            </View>
          </View>
          <View style={[styles.contactArrow, { backgroundColor: C.blueSoft }]}>
            <Ionicons name="arrow-forward" size={16} color={C.blue} />
          </View>
        </TouchableOpacity>

        {/* ── FAQ ── */}
        <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqCard}>
          {FAQ_ITEMS.map((item, idx) => (
            <FaqRow key={idx} item={item} last={idx === FAQ_ITEMS.length - 1} />
          ))}
        </View>

        {/* ── Footer note ── */}
        <View style={styles.footer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={C.textMuted}
          />
          <Text style={styles.footerText}>
            Support is available Monday–Saturday, 9 AM – 6 PM (IST).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpSupportPage;

// ─── STYLES ───────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.blueMid,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.navy,
    letterSpacing: 0.2,
  },

  // Hero
  heroBanner: {
    margin: 16,
    marginTop: 20,
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.blueMid,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  heroOrb: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: C.blue,
    opacity: 0.06,
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: C.blueMid,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.navy,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 19,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },

  // Contact cards
  contactCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: C.blueMid,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: { flex: 1, gap: 3 },
  contactTitle: { fontSize: 15, fontWeight: "700", color: C.navy },
  contactSub: { fontSize: 13, color: C.textMuted, fontWeight: "500" },
  contactBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#25D366",
  },
  contactBadgeText: { fontSize: 11, color: C.textMuted, fontWeight: "600" },
  contactArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // FAQ
  faqCard: {
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.blueMid,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: C.blueMid,
  },
  faqRowLast: { borderBottomWidth: 0 },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  faqQText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: C.navy,
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 20,
    marginTop: 10,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 20,
  },
  footerText: { flex: 1, fontSize: 12, color: C.textMuted, lineHeight: 18 },
});
