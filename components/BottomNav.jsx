import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

export const navItems = [
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
  const translateY = useRef(navItems.map(() => new Animated.Value(0))).current;

  const animateIcon = (index) => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnims[index], {
          toValue: 1.2,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(translateY[index], {
          toValue: -6,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(translateY[index], {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
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
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [
                    { scale: scaleAnims[index] },
                    { translateY: translateY[index] },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  isActive && styles.activeIconContainer,
                ]}
              >
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? "#1877F2" : "#8E8E93"}
                />
              </View>
            </Animated.View>

            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

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
  },

  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  activeIconContainer: {
    backgroundColor: "#E7F0FF",
    shadowColor: "#1877F2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  activeIndicator: {
    position: "absolute",
    bottom: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1877F2",
  },
});

export default BottomNav;
