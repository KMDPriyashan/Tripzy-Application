import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

// ─── Theme (matches HomePage) ─────────────────────
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
  success: "#0CB870",
  successSoft: "#E6F9F1",
};

// ─── Reusable section header ──────────────────────
const SectionLabel = ({ label }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
);

// ─── Row item (navigates or toggles) ─────────────
const SettingRow = ({
  icon,
  iconBg,
  label,
  subtitle,
  onPress,
  last = false,
  destructive = false,
}) => (
  <TouchableOpacity
    style={[styles.row, last && styles.rowLast]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.rowIcon, { backgroundColor: iconBg || C.blueSoft }]}>
      <Ionicons name={icon} size={18} color={destructive ? C.danger : C.blue} />
    </View>
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, destructive && { color: C.danger }]}>
        {label}
      </Text>
      {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
    </View>
    <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
  </TouchableOpacity>
);

// ─── Change Password Modal content (inline sheet) ─
const ChangePasswordSheet = ({ onClose }) => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurr, setShowCurr] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const handleChange = async () => {
    if (!next || !confirm)
      return Alert.alert("Missing fields", "Please fill in all fields.");
    if (next.length < 8)
      return Alert.alert(
        "Too short",
        "Password must be at least 8 characters.",
      );
    if (next !== confirm)
      return Alert.alert("Mismatch", "New passwords do not match.");

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
      Alert.alert(
        "✅ Password Updated",
        "Your password has been changed successfully.",
        [{ text: "OK", onPress: onClose }],
      );
    } catch (e) {
      Alert.alert(
        "Error",
        e.message || "Failed to update password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, onChange, show, toggleShow, placeholder }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={toggleShow} style={styles.eyeBtn}>
          <Ionicons
            name={show ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={C.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.sheet}>
      {/* Sheet handle */}
      <View style={styles.sheetHandle} />

      <View style={styles.sheetHeader}>
        <View style={[styles.sheetIconCircle, { backgroundColor: C.blueSoft }]}>
          <Ionicons name="lock-closed-outline" size={22} color={C.blue} />
        </View>
        <View>
          <Text style={styles.sheetTitle}>Change Password</Text>
          <Text style={styles.sheetSub}>Min 8 characters</Text>
        </View>
      </View>

      <Field
        label="Current Password"
        value={current}
        onChange={setCurrent}
        show={showCurr}
        toggleShow={() => setShowCurr((v) => !v)}
        placeholder="Enter current password"
      />
      <Field
        label="New Password"
        value={next}
        onChange={setNext}
        show={showNext}
        toggleShow={() => setShowNext((v) => !v)}
        placeholder="Enter new password"
      />
      <Field
        label="Confirm New Password"
        value={confirm}
        onChange={setConfirm}
        show={showConf}
        toggleShow={() => setShowConf((v) => !v)}
        placeholder="Re-enter new password"
      />

      <TouchableOpacity
        style={[styles.sheetBtn, loading && { opacity: 0.7 }]}
        onPress={handleChange}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={C.white} />
        ) : (
          <Text style={styles.sheetBtnText}>Update Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.sheetCancel}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Text style={styles.sheetCancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Main screen ──────────────────────────────────
const SettingsPrivacyPage = () => {
  const router = useRouter();
  const [showPwSheet, setShowPwSheet] = useState(false);

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
        <Text style={styles.headerTitle}>Settings & Privacy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Account */}
        <SectionLabel label="ACCOUNT" />
        <View style={styles.card}>
          <SettingRow
            icon="lock-closed-outline"
            iconBg={C.blueSoft}
            label="Change Password"
            subtitle="Update your account password"
            onPress={() => setShowPwSheet(true)}
          />
          <SettingRow
            icon="person-outline"
            iconBg={C.blueSoft}
            label="Edit Profile"
            subtitle="Name, photo and personal info"
            onPress={() => router.push("/app-pages/profileHome")}
            last
          />
        </View>

        {/* Privacy */}
        <SectionLabel label="PRIVACY" />
        <View style={styles.card}>
          <SettingRow
            icon="eye-off-outline"
            iconBg="#EDE8FF"
            label="Profile Visibility"
            subtitle="Control who sees your profile"
            onPress={() => {}}
          />
          <SettingRow
            icon="location-outline"
            iconBg="#E6F9F8"
            label="Location Sharing"
            subtitle="Manage location permissions"
            onPress={() => {}}
            last
          />
        </View>

        {/* Security */}
        <SectionLabel label="SECURITY" />
        <View style={styles.card}>
          <SettingRow
            icon="shield-checkmark-outline"
            iconBg={C.successSoft}
            label="Two-Factor Authentication"
            subtitle="Add an extra layer of security"
            onPress={() => {}}
          />
          <SettingRow
            icon="phone-portrait-outline"
            iconBg={C.blueSoft}
            label="Trusted Devices"
            subtitle="Manage your signed-in devices"
            onPress={() => {}}
            last
          />
        </View>

        {/* Danger zone */}
        <SectionLabel label="DANGER ZONE" />
        <View style={styles.card}>
          <SettingRow
            icon="trash-outline"
            iconBg={C.dangerSoft}
            label="Delete Account"
            subtitle="Permanently remove your account"
            onPress={() =>
              Alert.alert(
                "Delete Account",
                "This will permanently delete your account and all data. This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => {} },
                ],
              )
            }
            last
            destructive
          />
        </View>
      </ScrollView>

      {/* ── Change Password bottom sheet ── */}
      {showPwSheet && (
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowPwSheet(false)}
          />
          <ChangePasswordSheet onClose={() => setShowPwSheet(false)} />
        </View>
      )}
    </View>
  );
};

export default SettingsPrivacyPage;

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

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },

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

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: C.blueMid,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: "600", color: C.navy, marginBottom: 2 },
  rowSub: { fontSize: 12, color: C.textMuted },

  // Bottom sheet
  sheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,31,68,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.blueMid,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  sheetIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: C.navy },
  sheetSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  // Fields
  fieldWrap: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.blueMid,
    borderRadius: 12,
    backgroundColor: C.bg,
    paddingHorizontal: 14,
  },
  fieldInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: C.navy },
  eyeBtn: { padding: 4 },

  // Sheet button
  sheetBtn: {
    backgroundColor: C.blue,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  sheetBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  sheetCancel: { alignItems: "center", paddingTop: 14 },
  sheetCancelText: { color: C.textMuted, fontSize: 14, fontWeight: "600" },
});
