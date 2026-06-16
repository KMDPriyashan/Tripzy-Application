import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Storage key ──────────────────────────────────
const NOTIF_SETTINGS_KEY = "@tripzy_notification_settings";

// ─── Default notification preferences ────────────
export const DEFAULT_NOTIF_SETTINGS = {
  pushEnabled: true, // master toggle
  appUpdates: true, // feature / update announcements
  travelAlerts: true, // trip reminders & destination alerts
};

// ─── Context ──────────────────────────────────────
const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn(
      "useNotification must be used within a NotificationProvider. Returning dummy.",
    );
    return {
      showNotification: () => {},
      notifSettings: DEFAULT_NOTIF_SETTINGS,
      updateNotifSetting: () => {},
    };
  }
  return context;
};

// ─── Provider ─────────────────────────────────────
export const NotificationProvider = ({ children }) => {
  // ── Banner state (existing) ──
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef(null);
  const router = useRouter();

  // ── Settings state (new) ────
  const [notifSettings, setNotifSettings] = useState(DEFAULT_NOTIF_SETTINGS);

  // Load persisted settings once on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
        if (stored)
          setNotifSettings({
            ...DEFAULT_NOTIF_SETTINGS,
            ...JSON.parse(stored),
          });
      } catch (e) {
        console.warn("Failed to load notification settings:", e);
      }
    })();
  }, []);

  // Persist a single setting key
  const updateNotifSetting = async (key, value) => {
    const updated = { ...notifSettings, [key]: value };
    setNotifSettings(updated);
    try {
      await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save notification settings:", e);
    }
  };

  // ── Pan-swipe dismiss (existing) ──
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        if (g.dy < 0) slideAnim.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -50) {
          dismissNotification();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  // ── Show banner ──────────────────────────────────
  // Respects the master pushEnabled toggle; individual type checks left to
  // call-sites via the helper exported below.
  const showNotification = (type, title, message, data = {}) => {
    if (!notifSettings.pushEnabled) return; // master switch off → silent

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setNotification({ type, title, message, data });
    setVisible(true);

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();

    timeoutRef.current = setTimeout(dismissNotification, 5000);
  };

  const dismissNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setNotification(null);
    });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleNotificationPress = () => {
    if (notification?.data?.planId) {
      dismissNotification();
      router.push({
        pathname: "/app-pages/myItineraries",
        params: { highlightPlan: notification.data.planId },
      });
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#4CAF50" };
      case "plan":
        return { name: "map", color: "#1A6BFF" };
      case "budget":
        return { name: "wallet", color: "#FF9800" };
      case "packing":
        return { name: "bag", color: "#9C27B0" };
      default:
        return { name: "notifications", color: "#1A6BFF" };
    }
  };

  return (
    <NotificationContext.Provider
      value={{ showNotification, notifSettings, updateNotifSetting }}
    >
      {children}

      {visible && notification && (
        <Animated.View
          style={[
            styles.notificationContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.notificationContent}
            onPress={handleNotificationPress}
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    getIconForType(notification.type).color + "20",
                },
              ]}
            >
              <Ionicons
                name={getIconForType(notification.type).name}
                size={24}
                color={getIconForType(notification.type).color}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {notification.title}
              </Text>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {notification.message}
              </Text>
            </View>

            <TouchableOpacity
              onPress={dismissNotification}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

// ─── Convenience helper ───────────────────────────
/**
 * Use this before triggering a type-specific notification:
 *
 *   const { notifSettings, showNotification } = useNotification();
 *   if (canShowNotification(notifSettings, 'travelAlerts')) {
 *     showNotification('plan', 'Heads up!', 'Your trip to Bali is tomorrow.');
 *   }
 */
export const canShowNotification = (settings, type) => {
  if (!settings.pushEnabled) return false;
  if (type === "appUpdates") return settings.appUpdates;
  if (type === "travelAlerts") return settings.travelAlerts;
  return true;
};

const styles = {
  notificationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  notificationContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  notificationMessage: { fontSize: 13, color: "#666", lineHeight: 18 },
  closeButton: { padding: 6 },
};

export default NotificationContext;
