import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// ── Pull in the EXISTING NotificationContext ──────
import { useNotification } from "./context/NotificationContext";

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
  success: "#0CB870",
  orange: "#FF9800",
  purple: "#6C47FF",
};

// ─── Sample recent notifications ─────────────────
// In a real app these would come from your backend / push history.
const RECENT_NOTIFS = [
  {
    id: "1",
    type: "plan",
    title: "Trip to Bali — Tomorrow!",
    body: "Your Bali itinerary starts tomorrow. Tap to review your plans.",
    time: "2 hrs ago",
    read: false,
  },
  {
    id: "2",
    type: "success",
    title: "Itinerary Saved",
    body: '"Paris in 5 Days" has been saved to My Itineraries.',
    time: "Yesterday",
    read: true,
  },
  {
    id: "3",
    type: "appUpdate",
    title: "New Feature: Travel Guide",
    body: "Explore curated local guides for 50+ destinations — check it out!",
    time: "2 days ago",
    read: true,
  },
  {
    id: "4",
    type: "budget",
    title: "Budget Alert",
    body: "You've reached 80% of your Tokyo trip budget.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "5",
    type: "packing",
    title: "Packing Reminder",
    body: "Your Maldives trip is in 3 days. Don't forget to check your packing list!",
    time: "4 days ago",
    read: true,
  },
];

// ─── Icon mapping (mirrors existing NotificationContext) ──
const TYPE_META = {
  plan: { icon: "map-outline", color: C.blue, bg: C.blueSoft },
  success: {
    icon: "checkmark-circle-outline",
    color: C.success,
    bg: "#E6F9F1",
  },
  budget: { icon: "wallet-outline", color: C.orange, bg: "#FFF3E0" },
  packing: { icon: "bag-outline", color: C.purple, bg: "#EDE8FF" },
  appUpdate: { icon: "sparkles-outline", color: C.blueLight, bg: "#EAF4FF" },
  default: { icon: "notifications-outline", color: C.blue, bg: C.blueSoft },
};

const metaFor = (type) => TYPE_META[type] || TYPE_META.default;

// ─── Single notification row ──────────────────────
const NotifRow = ({ item, last }) => {
  const m = metaFor(item.type);
  return (
    <TouchableOpacity
      style={[
        styles.notifRow,
        last && styles.notifRowLast,
        !item.read && styles.notifRowUnread,
      ]}
      activeOpacity={0.75}
    >
      <View style={[styles.notifIcon, { backgroundColor: m.bg }]}>
        <Ionicons name={m.icon} size={20} color={m.color} />
      </View>
      <View style={styles.notifBody}>
        <View style={styles.notifTop}>
          <Text
            style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifText} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Toggle row ───────────────────────────────────
const ToggleRow = ({
  icon,
  iconBg,
  iconColor,
  label,
  subtitle,
  value,
  onChange,
  last,
  disabled,
}) => (
  <View
    style={[
      styles.toggleRow,
      last && styles.toggleRowLast,
      disabled && styles.toggleRowDisabled,
    ]}
  >
    <View style={[styles.toggleIcon, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={styles.toggleText}>
      <Text
        style={[styles.toggleLabel, disabled && styles.toggleLabelDisabled]}
      >
        {label}
      </Text>
      {subtitle ? <Text style={styles.toggleSub}>{subtitle}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{ false: "#D1D1D6", true: C.blue + "55" }}
      thumbColor={value ? C.blue : "#F2F2F7"}
      ios_backgroundColor="#D1D1D6"
    />
  </View>
);

// ─── Main screen ──────────────────────────────────
const NotificationsPage = () => {
  const router = useRouter();

  // Pull settings + updater from the EXISTING NotificationContext
  const { notifSettings, updateNotifSetting, showNotification } =
    useNotification();

  const [notifs, setNotifs] = useState(RECENT_NOTIFS);

  const masterOff = !notifSettings.pushEnabled;

  // Demo: trigger a test banner using the existing showNotification
  const sendTestNotification = () => {
    showNotification(
      "plan",
      "Test Notification",
      "Push notifications are working correctly! ✈️",
    );
  };

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const unreadCount = notifs.filter((n) => !n.read).length;

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
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Push settings ── */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.card}>
          <ToggleRow
            icon="notifications-outline"
            iconBg={C.blueSoft}
            iconColor={C.blue}
            label="Push Notifications"
            subtitle="Master switch for all in-app alerts"
            value={notifSettings.pushEnabled}
            onChange={(v) => updateNotifSetting("pushEnabled", v)}
          />
          <ToggleRow
            icon="sparkles-outline"
            iconBg="#EAF4FF"
            iconColor={C.blueLight}
            label="App Updates"
            subtitle="New features and announcements"
            value={notifSettings.appUpdates}
            onChange={(v) => updateNotifSetting("appUpdates", v)}
            disabled={masterOff}
          />
          <ToggleRow
            icon="airplane-outline"
            iconBg="#E6F9F1"
            iconColor={C.success}
            label="Travel Alerts"
            subtitle="Trip reminders & destination tips"
            value={notifSettings.travelAlerts}
            onChange={(v) => updateNotifSetting("travelAlerts", v)}
            disabled={masterOff}
            last
          />
        </View>

        {/* Master-off banner */}
        {masterOff && (
          <View style={styles.offBanner}>
            <Ionicons
              name="notifications-off-outline"
              size={16}
              color={C.textMuted}
            />
            <Text style={styles.offBannerText}>
              Push notifications are disabled. Enable the master toggle above to
              receive alerts.
            </Text>
          </View>
        )}

        {/* Test button */}
        {!masterOff && (
          <TouchableOpacity
            style={styles.testBtn}
            onPress={sendTestNotification}
            activeOpacity={0.8}
          >
            <Ionicons name="paper-plane-outline" size={16} color={C.blue} />
            <Text style={styles.testBtnText}>Send Test Notification</Text>
          </TouchableOpacity>
        )}

        {/* ── Recent notifications ── */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionLabel}>RECENT</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          {notifs.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons
                name="notifications-off-outline"
                size={36}
                color={C.blueMid}
              />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : (
            notifs.map((n, i) => (
              <NotifRow key={n.id} item={n} last={i === notifs.length - 1} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsPage;

// ─── STYLES ───────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header
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
  markAllText: { fontSize: 13, fontWeight: "700", color: C.blue },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 8,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 20,
  },
  badge: {
    backgroundColor: C.blue,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: C.white, fontSize: 11, fontWeight: "700" },

  // Card
  card: {
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

  // Toggle rows
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: C.blueMid,
  },
  toggleRowLast: { borderBottomWidth: 0 },
  toggleRowDisabled: { opacity: 0.45 },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleText: { flex: 1 },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: C.navy,
    marginBottom: 2,
  },
  toggleLabelDisabled: { color: C.textMuted },
  toggleSub: { fontSize: 12, color: C.textMuted },

  // Off banner
  offBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    backgroundColor: "#FFF8E6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE9A0",
  },
  offBannerText: { flex: 1, fontSize: 12, color: "#7A6000", lineHeight: 18 },

  // Test button
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.blueSoft,
    borderWidth: 1,
    borderColor: C.blueMid,
  },
  testBtnText: { fontSize: 14, fontWeight: "700", color: C.blue },

  // Notification rows
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: C.blueMid,
  },
  notifRowLast: { borderBottomWidth: 0 },
  notifRowUnread: { backgroundColor: "#F5F9FF" },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  notifBody: { flex: 1 },
  notifTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 13,
  },
  notifTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: C.textMuted },
  notifTitleUnread: { color: C.navy, fontWeight: "700" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.blue },
  notifText: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: { fontSize: 11, color: C.blueLight, fontWeight: "600" },

  // Empty
  empty: { padding: 32, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14, color: C.textMuted, fontWeight: "600" },
});
