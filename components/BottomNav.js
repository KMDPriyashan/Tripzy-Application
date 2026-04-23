import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Data for the bottom navigation
export const navItems = [
  { name: 'Home', icon: '🏠', target: '/profile' },
  { name: 'Map', icon: '🗺️', target: '/app-pages/map' },
  { name: 'Feed', icon: '📰', target: '/app-pages/feed' },
  { name: 'Group', icon: '👥', target: '/app-pages/community' },
  { name: 'Profile', icon: '👤', target: '/app-pages/profile' },
];

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavPress = (targetPath) => {
    if (targetPath && pathname !== targetPath) {
      router.push(targetPath);
    }
  };

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.navItem}
          onPress={() => handleNavPress(item.target)}
        >
          <Text style={[
            styles.navIcon,
            pathname === item.target && styles.activeNavIcon
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            styles.navText,
            pathname === item.target && styles.activeNavText
          ]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
    color: '#666',
  },
  activeNavIcon: {
    color: '#1a1a1a',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
});

export default BottomNav;