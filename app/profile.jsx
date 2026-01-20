import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
// Note: ScrollView is added here to make the content scrollable when cards are added
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from '../lib/supabase';



// Data for the six cards
const cardsData = [
  { name: 'Feed', icon: '📰', target: '/app-pages/feed' },
  { name: 'Tour Guide', icon: '🗺️', target: '/app-pages/TourGuide' },
  { name: 'Travel Plan', icon: '📅', target: '/app-pages/plan' },
  { name: 'Location Map', icon: '📍', target: '/app-pages/map' },
  { name: 'Budget', icon: '💰', target: '/app-pages/plan' }, 
  { name: 'Settings', icon: '⚙️', target: '/app-pages/settings' }, 
];


const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        // Redirection handled by onAuthStateChange listener, but also explicitly navigate
        router.replace('/loginpage'); 
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleCardPress = (targetPath) => {
    if (targetPath) {
      router.push(targetPath);
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
          {['Home', 'Feed', 'TourGuide', 'TravelPlan', 'Location'].map((tab) => (
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
          <TouchableOpacity style={styles.logoutButtonTop} onPress={() => router.push('/loginpage')}>
            <Text style={styles.logoutButtonTopText}>Login</Text>
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
          {['Home', 'Feed', 'TourGuide', 'TravelPlan', 'Location'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.navItem, activeTab === tab && styles.navItemActive]}
              onPress={() => handleTabPress(tab)}
              disabled={tab !== 'Home'} // Disable navigation if not logged in
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

      {/* Main Content (Wrapped in ScrollView) */}
      <ScrollView style={styles.scrollViewContent}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>
            Welcome ! , {user.user_metadata?.full_name || 'Traveler'}! 🎉
          </Text>
          <Text style={styles.emailText}>
            {user.email}
          </Text>
          
          {/* Feature Cards */}
          <View style={styles.cardsContainer}>
            {cardsData.map((card) => (
              <TouchableOpacity
                key={card.name}
                style={styles.card}
                onPress={() => handleCardPress(card.target)}
              >
                <Text style={styles.cardIcon}>{card.icon}</Text>
                <Text style={styles.cardText}>{card.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          

        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {['Home', 'Feed', 'TourGuide', 'TravelPlan', 'Location'].map((tab) => (
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
  scrollViewContent: {
    flex: 1,
  },
  content: {
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
    marginBottom: 30, 
  },
  
  // --- New Card Styles ---
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '30%', 
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  cardText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  // --- End New Card Styles ---
  
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