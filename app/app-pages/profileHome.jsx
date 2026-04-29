import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import BottomNav from "../../components/BottomNav";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

// ─── THEME ────────────────────────────────────────
const C = {
  bg: "#F4F7FF",
  white: "#FFFFFF",
  navy: "#0A1F44",
  blue: "#1877f2",
  blueSoft: "#EAF0FF",
  blueLight: "#5B9BFF",
  blueMid: "#D0E2FF",
  text: "#0A1F44",
  textMuted: "#6B80A3",
};

// ─── Animated floating orb ──────────────────────
const FloatOrb = ({ style, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });
  return <Animated.View style={[style, { transform: [{ translateY }] }]} />;
};

// ─── Main ─────────────────────────────────────────
const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('traveller'); // 'traveller' or 'guide'
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // User Profile Data
  const [userProfile, setUserProfile] = useState({
    name: "",
    username: "",
    email: "",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    bio: "Travel enthusiast exploring the world",
    location: "New York, USA",
    joinDate: "",
    totalTrips: 0,
    countriesVisited: 0,
    travelDays: 0,
    favoriteDestination: "",
    nextDestination: ""
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    totalTrips: '',
    countriesVisited: '',
    travelDays: '',
    favoriteDestination: '',
    nextDestination: ''
  });
  
  // Tour Guide Profile Data
  const [tourGuideProfile, setTourGuideProfile] = useState(null);
  const [hasTourGuideProfile, setHasTourGuideProfile] = useState(false);

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const pillFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCurrentUser();
    loadUserProfile();
    checkTourGuideProfile();
    
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.timing(pillFade, {
        toValue: 1,
        duration: 600,
        delay: 380,
        useNativeDriver: true,
      }),
    ]).start();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
        loadUserProfile();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        router.replace("/loginpage");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const getCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  const loadUserProfile = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUserProfile(parsedUser);
        setEditForm({
          name: parsedUser.name || '',
          username: parsedUser.username || '',
          bio: parsedUser.bio || '',
          location: parsedUser.location || '',
          totalTrips: parsedUser.totalTrips?.toString() || '0',
          countriesVisited: parsedUser.countriesVisited?.toString() || '0',
          travelDays: parsedUser.travelDays?.toString() || '0',
          favoriteDestination: parsedUser.favoriteDestination || '',
          nextDestination: parsedUser.nextDestination || ''
        });
      } else if (user) {
        // Create default profile
        const defaultProfile = {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Traveler",
          username: user.email?.split('@')[0] || "traveler",
          email: user.email,
          avatar: "https://randomuser.me/api/portraits/men/1.jpg",
          coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
          bio: "Travel enthusiast exploring the world",
          location: "New York, USA",
          joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          totalTrips: 0,
          countriesVisited: 0,
          travelDays: 0,
          favoriteDestination: "",
          nextDestination: ""
        };
        setUserProfile(defaultProfile);
        await AsyncStorage.setItem('currentUser', JSON.stringify(defaultProfile));
        setEditForm({
          name: defaultProfile.name,
          username: defaultProfile.username,
          bio: defaultProfile.bio,
          location: defaultProfile.location,
          totalTrips: '0',
          countriesVisited: '0',
          travelDays: '0',
          favoriteDestination: '',
          nextDestination: ''
        });
      }
    } catch (error) {
      console.log('Error loading user profile:', error);
    }
  };
  
  const checkTourGuideProfile = async () => {
    try {
      const savedGuide = await AsyncStorage.getItem('tourGuideProfile');
      if (savedGuide) {
        setTourGuideProfile(JSON.parse(savedGuide));
        setHasTourGuideProfile(true);
      }
    } catch (error) {
      console.log('Error checking tour guide profile:', error);
    }
  };
  
  const handleSaveProfile = async () => {
    setIsEditing(true);
    try {
      const updatedProfile = {
        ...userProfile,
        name: editForm.name,
        username: editForm.username,
        bio: editForm.bio,
        location: editForm.location,
        totalTrips: parseInt(editForm.totalTrips) || 0,
        countriesVisited: parseInt(editForm.countriesVisited) || 0,
        travelDays: parseInt(editForm.travelDays) || 0,
        favoriteDestination: editForm.favoriteDestination,
        nextDestination: editForm.nextDestination
      };
      
      setUserProfile(updatedProfile);
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedProfile));
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.log('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsEditing(false);
    }
  };
  
  const navigateToTourGuideProfile = () => {
    if (hasTourGuideProfile) {
      router.push('/app-pages/TourGuideList');
    } else {
      router.push('/app-pages/TGprofile');
    }
  };

  if (loading)
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>Tripzy</Text>
        <ActivityIndicator size="large" color={C.blue} />
      </View>
    );

  if (!user)
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>Tripzy</Text>
        <TouchableOpacity
          style={styles.splashBtn}
          onPress={() => router.push("/app-pages/TGprofile")}
        >
          <Text style={styles.splashBtnText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );

  const firstName = (userProfile.name || "Traveler").split(" ")[0];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ══ HERO ══════════════════════════════ */}
        <View style={styles.hero}>
          <FloatOrb delay={0} style={styles.orbA} />
          <FloatOrb delay={600} style={styles.orbB} />
          <FloatOrb delay={300} style={styles.orbC} />

          <Animated.View
            style={[
              styles.topBar,
              { opacity: heroFade, transform: [{ translateY: heroSlide }] },
            ]}
          >
            <Animated.Text
              style={[styles.logoText, { transform: [{ scale: logoScale }] }]}
            >
              Tripzy
            </Animated.Text>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => setEditModalVisible(true)}
            >
              <Image source={{ uri: userProfile.avatar }} style={styles.profileAvatar} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.welcomePill, { opacity: pillFade }]}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>Welcome back, {firstName}! 🌍</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: heroFade,
              transform: [{ translateY: heroSlide }],
            }}
          >
            <Text style={styles.heroH1}>Your Journey{"\n"}Your Way.</Text>
            <Text style={styles.heroSub}>Explore, plan, and connect with fellow travelers.</Text>
          </Animated.View>
        </View>

        {/* ══ TAB SELECTOR ══════════════════════ */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'traveller' && styles.activeTab]} 
            onPress={() => setSelectedTab('traveller')}
          >
            <Text style={[styles.tabIcon, selectedTab === 'traveller' && styles.activeTabIcon]}>✈️</Text>
            <Text style={[styles.tabText, selectedTab === 'traveller' && styles.activeTabText]}>Traveller</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'guide' && styles.activeTab]} 
            onPress={() => setSelectedTab('guide')}
          >
            <Text style={[styles.tabIcon, selectedTab === 'guide' && styles.activeTabIcon]}>👨‍✈️</Text>
            <Text style={[styles.tabText, selectedTab === 'guide' && styles.activeTabText]}>Tour Guide</Text>
          </TouchableOpacity>
        </View>

        {/* ══ TRAVELLER SECTION ══════════════════════ */}
        {selectedTab === 'traveller' && (
          <View style={styles.sectionContainer}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <Image source={{ uri: userProfile.coverImage }} style={styles.coverImage} />
              <View style={styles.profileInfoWrapper}>
                <Image source={{ uri: userProfile.avatar }} style={styles.profileAvatarLarge} />
                <Text style={styles.profileName}>{userProfile.name}</Text>
                <Text style={styles.profileUsername}>@{userProfile.username}</Text>
                <Text style={styles.profileBio}>{userProfile.bio}</Text>
                
                <TouchableOpacity style={styles.editProfileBtn} onPress={() => setEditModalVisible(true)}>
                  <Text style={styles.editProfileBtnText}>✏️ Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Travel Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>📊 Travel Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{userProfile.totalTrips}</Text>
                  <Text style={styles.statLabelSm}>Total Trips</Text>
                </View>
                <View style={styles.statDividerV} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{userProfile.countriesVisited}</Text>
                  <Text style={styles.statLabelSm}>Countries</Text>
                </View>
                <View style={styles.statDividerV} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{userProfile.travelDays}</Text>
                  <Text style={styles.statLabelSm}>Travel Days</Text>
                </View>
              </View>
            </View>
            
            {/* Destinations */}
            {(userProfile.favoriteDestination || userProfile.nextDestination) && (
              <View style={styles.destinationsCard}>
                <Text style={styles.cardTitle}>🎯 Destinations</Text>
                {userProfile.favoriteDestination && (
                  <View style={styles.destinationRow}>
                    <Text style={styles.destinationIcon}>⭐</Text>
                    <Text style={styles.destinationLabel}>Favorite:</Text>
                    <Text style={styles.destinationText}>{userProfile.favoriteDestination}</Text>
                  </View>
                )}
                {userProfile.nextDestination && (
                  <View style={styles.destinationRow}>
                    <Text style={styles.destinationIcon}>🎯</Text>
                    <Text style={styles.destinationLabel}>Next:</Text>
                    <Text style={styles.destinationText}>{userProfile.nextDestination}</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Location & Join Date */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>{userProfile.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.infoText}>Joined {userProfile.joinDate}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ══ TOUR GUIDE SECTION ══════════════════════ */}
        {selectedTab === 'guide' && (
          <View style={styles.sectionContainer}>
            {hasTourGuideProfile && tourGuideProfile ? (
              <View style={styles.guideCard}>
                <View style={[styles.guideHeaderCard, { backgroundColor: C.blue }]}>
                  <Image source={{ uri: tourGuideProfile.avatar || userProfile.avatar }} style={styles.guideAvatarLarge} />
                  <Text style={styles.guideNameLarge}>{tourGuideProfile.name || userProfile.name}</Text>
                  <View style={styles.guideRatingRow}>
                    <Text style={styles.guideStar}>⭐</Text>
                    <Text style={styles.guideRatingText}>{tourGuideProfile.rating || 4.9} • {tourGuideProfile.totalTours || 0} tours</Text>
                  </View>
                </View>
                
                <View style={styles.guideDetailsCard}>
                  <Text style={styles.guideBioLarge}>{tourGuideProfile.bio || "Professional tour guide ready to show you amazing places!"}</Text>
                  
                  <View style={styles.guideInfoRowCard}>
                    <Text style={styles.guideInfoIcon}>💰</Text>
                    <Text style={styles.guideInfoText}>{tourGuideProfile.price || "$50/day"}</Text>
                  </View>
                  <View style={styles.guideInfoRowCard}>
                    <Text style={styles.guideInfoIcon}>🗣️</Text>
                    <Text style={styles.guideInfoText}>Speaks: {tourGuideProfile.languages?.join(', ') || "English, Spanish"}</Text>
                  </View>
                  <View style={styles.guideInfoRowCard}>
                    <Text style={styles.guideInfoIcon}>🎯</Text>
                    <Text style={styles.guideInfoText}>Specializes in: {tourGuideProfile.specialties?.join(', ') || "Cultural Tours, Adventure Travel"}</Text>
                  </View>
                  
                  <TouchableOpacity style={styles.manageGuideBtn} onPress={navigateToTourGuideProfile}>
                    <Text style={styles.manageGuideBtnText}>Manage Guide Profile →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.becomeGuideCard}>
                <View style={[styles.becomeGuideGradient, { backgroundColor: C.blue }]}>
                  <Text style={styles.becomeGuideIcon}>👨‍✈️</Text>
                  <Text style={styles.becomeGuideTitle}>Become a Tour Guide</Text>
                  <Text style={styles.becomeGuideDesc}>Share your local expertise, earn money, and meet travelers from around the world!</Text>
                  <TouchableOpacity style={styles.becomeGuideBtn} onPress={navigateToTourGuideProfile}>
                    <Text style={styles.becomeGuideBtnText}>Get Started →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <BottomNav />

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: C.blue }]}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm({...editForm, name: text})}
                placeholder="Enter your full name"
              />
              
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.username}
                onChangeText={(text) => setEditForm({...editForm, username: text})}
                placeholder="Enter username"
                autoCapitalize="none"
              />
              
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={editForm.bio}
                onChangeText={(text) => setEditForm({...editForm, bio: text})}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.location}
                onChangeText={(text) => setEditForm({...editForm, location: text})}
                placeholder="Your location"
              />
              
              <Text style={styles.sectionLabel}>Travel Statistics</Text>
              
              <Text style={styles.inputLabel}>Total Trips</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.totalTrips}
                onChangeText={(text) => setEditForm({...editForm, totalTrips: text})}
                placeholder="Number of trips"
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Countries Visited</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.countriesVisited}
                onChangeText={(text) => setEditForm({...editForm, countriesVisited: text})}
                placeholder="Number of countries"
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Travel Days</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.travelDays}
                onChangeText={(text) => setEditForm({...editForm, travelDays: text})}
                placeholder="Total travel days"
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Favorite Destination</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.favoriteDestination}
                onChangeText={(text) => setEditForm({...editForm, favoriteDestination: text})}
                placeholder="Your favorite place"
              />
              
              <Text style={styles.inputLabel}>Next Destination</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.nextDestination}
                onChangeText={(text) => setEditForm({...editForm, nextDestination: text})}
                placeholder="Where to next?"
              />
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={isEditing}>
                <View style={[styles.saveBtnGradient, { backgroundColor: C.blue }]}>
                  <Text style={styles.saveBtnText}>{isEditing ? 'Saving...' : 'Save Changes'}</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── STYLES ───────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Splash / loading
  splash: {
    flex: 1,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  splashLogo: {
    fontSize: 58,
    fontWeight: "900",
    color: C.blue,
    fontFamily: "serif",
    letterSpacing: 2,
  },
  splashBtn: {
    backgroundColor: C.blue,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 50,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  splashBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  // Hero
  hero: {
    backgroundColor: C.white,
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 28,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },

  // Orbs
  orbA: {
    position: "absolute",
    top: -48,
    right: -48,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: C.blue,
    opacity: 0.07,
  },
  orbB: {
    position: "absolute",
    bottom: -30,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: C.blueLight,
    opacity: 0.09,
  },
  orbC: {
    position: "absolute",
    top: 110,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.blue,
    opacity: 0.05,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 46,
    fontWeight: "900",
    color: C.blue,
    fontFamily: "serif",
    letterSpacing: 1.5,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.blueMid,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  // Welcome pill
  welcomePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.blueSoft,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: C.blueMid,
    gap: 8,
  },
  pillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.blue },
  pillText: {
    color: C.blue,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Hero text
  heroH1: {
    fontSize: 40,
    fontWeight: "900",
    color: C.navy,
    lineHeight: 48,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
    marginBottom: 0,
  },

  // Tab Selector
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: C.white,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  activeTab: {
    backgroundColor: C.blue,
  },
  tabIcon: {
    fontSize: 18,
  },
  activeTabIcon: {
    color: C.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textMuted,
  },
  activeTabText: {
    color: C.white,
  },

  // Section Container
  sectionContainer: {
    padding: 20,
  },

  // Profile Card
  profileCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  coverImage: {
    width: '100%',
    height: 100,
  },
  profileInfoWrapper: {
    alignItems: 'center',
    padding: 16,
    marginTop: -40,
  },
  profileAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: C.white,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: C.navy,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: C.textMuted,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  editProfileBtn: {
    backgroundColor: C.blueSoft,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: C.blueMid,
  },
  editProfileBtnText: {
    color: C.blue,
    fontSize: 14,
    fontWeight: '600',
  },

  // Stats Card
  statsCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: C.navy,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: C.blue,
    marginBottom: 4,
  },
  statLabelSm: {
    fontSize: 11,
    color: C.textMuted,
  },
  statDividerV: {
    width: 1,
    height: 40,
    backgroundColor: C.blueMid,
  },

  // Destinations Card
  destinationsCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  destinationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  destinationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.navy,
    marginRight: 8,
  },
  destinationText: {
    fontSize: 13,
    color: C.textMuted,
    flex: 1,
  },

  // Info Card
  infoCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: C.textMuted,
  },

  // Guide Card
  guideCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  guideHeaderCard: {
    alignItems: 'center',
    padding: 24,
  },
  guideAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: C.white,
    marginBottom: 12,
  },
  guideNameLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: C.white,
    marginBottom: 4,
  },
  guideRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideStar: {
    fontSize: 14,
    marginRight: 4,
    color: '#FFD700',
  },
  guideRatingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  guideDetailsCard: {
    padding: 20,
  },
  guideBioLarge: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  guideInfoRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideInfoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  guideInfoText: {
    fontSize: 13,
    color: C.textMuted,
    flex: 1,
  },
  manageGuideBtn: {
    backgroundColor: C.blue,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  manageGuideBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Become Guide Card
  becomeGuideCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  becomeGuideGradient: {
    alignItems: 'center',
    padding: 32,
  },
  becomeGuideIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  becomeGuideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: C.white,
    marginBottom: 8,
  },
  becomeGuideDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  becomeGuideBtn: {
    backgroundColor: C.white,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
  },
  becomeGuideBtnText: {
    color: C.blue,
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: C.white,
    borderRadius: 20,
    margin: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: C.white,
  },
  modalClose: {
    fontSize: 24,
    color: C.white,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.navy,
    marginBottom: 8,
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: C.navy,
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.blueMid,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: C.blueMid,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: C.navy,
    backgroundColor: C.bg,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: 24,
    marginBottom: 30,
  },
  saveBtnGradient: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomePage;