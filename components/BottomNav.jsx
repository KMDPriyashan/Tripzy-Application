import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const navItems = [
  {
    name: "Home",
    icon: "home-outline",
    activeIcon: "home",
    target: "/profile",
  },
  {
    name: "Map",
    icon: "map-outline",
    activeIcon: "map",
    target: "/app-pages/map",
  },
  {
    name: "Feed",
    icon: "newspaper-outline",
    activeIcon: "newspaper",
    target: "/app-pages/feed",
  },
  {
    name: "Groups",
    icon: "people-outline",
    activeIcon: "people",
    target: "/app-pages/community",
  },
  {
    name: "Profile",
    icon: "person-outline",
    activeIcon: "person",
    target: "/app-pages/profile",
  },
];

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const scaleAnims = useRef(navItems.map(() => new Animated.Value(1))).current;

  const animateIcon = (index) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.15,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNavPress = (targetPath, index) => {
    if (pathname !== targetPath) {
      animateIcon(index);
      router.push(targetPath);
    }
  };

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item, index) => {
        const isActive = pathname === item.target;

        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => handleNavPress(item.target, index)}
            activeOpacity={0.8}
          >
            {/* 🔵 TOP LINE (fixed, not moving with icon) */}
            <View
              style={[styles.topIndicator, { opacity: isActive ? 1 : 0 }]}
            />

            <Animated.View
              style={{
                transform: [{ scale: scaleAnims[index] }],
                alignItems: "center",
              }}
            >
              <Ionicons
                name={isActive ? item.activeIcon : item.icon}
                size={24}
                color={isActive ? "#1877F2" : "#8E8E93"}
              />

              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {item.name}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0, // 🔥 force to bottom
    left: 0,
    right: 0,

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    height: 70, // fixed height = no jumping
    backgroundColor: "#FFFFFF",

    borderTopWidth: 0.5,
    borderTopColor: "#E5E5E5",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 2,
    fontWeight: "500",
  },

  activeLabel: {
    color: "#1877F2",
    fontWeight: "600",
  },

  topIndicator: {
    position: "absolute",
    top: -8,
    height: 3,
    width: "50%",
    backgroundColor: "#1877F2",
  },
});
