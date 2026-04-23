import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      showNotification: () => {},
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const router = useRouter(); // ✅ hook inside component, not module-level import
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef(null);

  const dismissNotification = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setNotification(null);
    });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [slideAnim]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy < 0) {
            slideAnim.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy < -50) {
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
    [slideAnim, dismissNotification],
  );

  const showNotification = useCallback(
    (type, title, message, data = {}) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setNotification({ type, title, message, data });
      setVisible(true);

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();

      timeoutRef.current = setTimeout(() => {
        dismissNotification();
      }, 5000);
    },
    [slideAnim, dismissNotification],
  );

  const handleNotificationPress = useCallback(() => {
    if (notification?.data?.planId) {
      dismissNotification();
      router.push({
        pathname: "/app-pages/myItineraries",
        params: { highlightPlan: notification.data.planId },
      });
    }
  }, [notification, dismissNotification, router]);

  const getIconForType = (type) => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#4CAF50" };
      case "plan":
        return { name: "map", color: "#007AFF" };
      case "budget":
        return { name: "wallet", color: "#FF9800" };
      case "packing":
        return { name: "bag", color: "#9C27B0" };
      default:
        return { name: "notifications", color: "#007AFF" };
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
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
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  closeButton: {
    padding: 6,
  },
};

export default NotificationContext;
