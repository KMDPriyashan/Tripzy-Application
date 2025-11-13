import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from '../lib/supabase';

const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');

  useEffect(() => {
    // Check if user is logged in
    getCurrentUser();
    
    // Set up auth state listener
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        router.replace('/loginpage');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
    
    // Navigation logic for each tab
    switch(tabName) {
      case 'Home':
        // Already on home page, no navigation needed
        break;
      case 'Feed':
        router.push('/app-pages/feed');
        break;
      case 'TourGuide':
        router.push('/app-pages/TourGuide');
        break;
      case 'TravelPlan':
        router.push('/app-pages/plan');
        break;
      case 'Location':
        router.push('/app-pages/map');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tripzy</Text>
          <TouchableOpacity style={styles.logoutButtonTop} disabled>
            <Text style={styles.logoutButtonTopText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {['Profile', 'Feed', 'TourGuide', 'TravelPlan', 'Location'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.navItem, activeTab === tab && styles.navItemActive]}
              onPress={() => handleTabPress(tab)}
            >
              <Text style={[styles.navText, activeTab === tab && styles.navTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
          <TouchableOpacity style={styles.logoutButtonTop} onPress={handleLogout}>
            <Text style={styles.logoutButtonTopText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.notAuthText}>Not authenticated</Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => router.push('/loginpage')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {['Profile', 'Feed', 'TourGuide', 'TravelPlan', 'Location'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.navItem, activeTab === tab && styles.navItemActive]}
              onPress={() => handleTabPress(tab)}
            >
              <Text style={[styles.navText, activeTab === tab && styles.navTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Logout Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tripzy</Text>
        <TouchableOpacity style={styles.logoutButtonTop} onPress={handleLogout}>
          <Text style={styles.logoutButtonTopText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome, {user.user_metadata?.full_name || 'Traveler'}! 🎉
        </Text>
        <Text style={styles.emailText}>
          {user.email}
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Trips Planned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Destinations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>

        
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {['Profile', 'Feed', 'TourGuide', 'TravelPlan', 'Location'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.navItem, activeTab === tab && styles.navItemActive]}
            onPress={() => handleTabPress(tab)}
          >
            <Text style={[styles.navText, activeTab === tab && styles.navTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  logoutButtonTop: {
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonTopText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 10,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  additionalContent: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityText: {
    fontSize: 16,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 55,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  navItemActive: {
    backgroundColor: '#000000',
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  navTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default HomePage;