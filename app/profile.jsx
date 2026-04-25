import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomNav from '../components/BottomNav'; // Import the component
import { supabase } from '../lib/supabase';

// Data for the feature cards
const featureCardsData = [
  { name: 'Trip Planning', description: 'Plan your journey with ease by our Trip Planner.', icon: '📅', target: '/app-pages/plan' },
  { name: 'Travel Map', description: 'Map your travels. Nourish your soul.', icon: '🗺️', target: '/app-pages/map' },
  { name: 'Travel Feed', description: 'Your Parth Begin With presence.', icon: '🔖', target: '/app-pages/feed' },
  { name: 'Travel Guide', description: 'Let your itinerary breathe with intention.', icon: '📖', target: '/app-pages/TourGuide' },
  { name: 'Travel Community', description: 'Chat with your travel partner.', icon: '💬', target: '/app-pages/community' },
  { name: 'Weather', description: 'Check the weather for your destination !.', icon: '⛅', target: '/app-pages/weather' },

];

const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.replace('/loginpage');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error getting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturePress = (targetPath) => {
    if (targetPath) {
      router.push(targetPath);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.notAuthText}>Not authenticated</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/loginpage')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.appTitle}>Tripzy</Text>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/app-pages/profile')}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.tagline}>Travel Light. Feel Deep.</Text>
          <Text style={styles.subTagline}>A gentle, poetic invitation to begin the journey.</Text>

          <Text style={styles.welcomeText}>
            Welcome back, {user.user_metadata?.full_name || 'Traveler'}! 🌍
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          {featureCardsData.map((feature) => (
            <TouchableOpacity
              key={feature.name}
              style={styles.featureCard}
              onPress={() => handleFeaturePress(feature.target)}
            >
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
              </View>
              <Text style={styles.featureTitle}>{feature.name}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation - Using the component */}
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 90,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  tagline: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 38,
  },
  subTagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  welcomeText: {
    fontSize: 18,
    color: '#444',
    fontWeight: '500',
  },
  featuresContainer: {
    paddingHorizontal: 20,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  notAuthText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomePage;