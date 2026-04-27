// app-pages/profileHome.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const profileHome = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('plans'); // plans, saved, posts, guide
  
  // User Data
  const [userData, setUserData] = useState({
    id: 'current',
    name: "John Doe",
    username: "johndoe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    bio: "Travel enthusiast | Adventure seeker | Making memories around the world 🌍",
    location: "New York, USA",
    joinDate: "March 2024",
    totalTrips: 24,
    countriesVisited: 12,
    travelDays: 156,
    favoriteDestination: "Bali, Indonesia",
    nextDestination: "Tokyo, Japan",
    followers: 801,
    following: 345,
    totalPosts: 0
  });

  // User Plans
  const [userPlans, setUserPlans] = useState([
    {
      id: 1,
      title: "European Summer Tour",
      destination: "Paris, Rome, Barcelona",
      startDate: "June 15, 2024",
      endDate: "July 10, 2024",
      budget: "$3,500",
      companions: 3,
      status: "upcoming",
      progress: 45,
      image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800",
      activities: ["Eiffel Tower", "Colosseum", "Sagrada Familia"]
    },
    {
      id: 2,
      title: "Asian Adventure",
      destination: "Tokyo, Seoul, Bangkok",
      startDate: "October 5, 2024",
      endDate: "October 25, 2024",
      budget: "$2,800",
      companions: 2,
      status: "planning",
      progress: 25,
      image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800",
      activities: ["Tokyo Tower", "Gyeongbokgung", "Floating Markets"]
    }
  ]);

  // Saved Locations
  const [savedLocations, setSavedLocations] = useState([
    {
      id: 1,
      name: "Santorini, Greece",
      image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
      rating: 4.9,
      savedDate: "2 weeks ago",
      visited: false
    },
    {
      id: 2,
      name: "Northern Lights, Iceland",
      image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
      rating: 4.8,
      savedDate: "1 month ago",
      visited: false
    },
    {
      id: 3,
      name: "Machu Picchu, Peru",
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
      rating: 4.9,
      savedDate: "2 months ago",
      visited: true
    }
  ]);

  // User Posts
  const [userPosts, setUserPosts] = useState([]);

  // Tour Guide Profile
  const [tourGuide, setTourGuide] = useState({
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 4.9,
    totalTours: 127,
    experience: "5+ years",
    languages: ["English", "Spanish", "French"],
    specialties: ["Cultural Tours", "Adventure Travel", "Food Tours"],
    bio: "Passionate travel guide with 5+ years of experience. Love showing travelers hidden gems and creating unforgettable memories!",
    price: "$50/day",
    availability: "Available for booking",
    upcomingTours: [
      { id: 1, name: "Paris Hidden Gems", date: "May 15, 2024", spots: 3 },
      { id: 2, name: "Italian Food Tour", date: "May 20, 2024", spots: 5 }
    ]
  });

  // Create Plan Modal
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    companions: '',
    activities: ''
  });

  // Search Locations Modal
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadUserData();
    loadUserPosts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadUserPosts();
      return () => {};
    }, [])
  );

  const loadUserData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUserData(prev => ({ ...prev, ...parsedUser }));
      }
      
      const savedPosts = await AsyncStorage.getItem('userPosts');
      if (savedPosts) {
        const posts = JSON.parse(savedPosts);
        setUserPosts(posts);
        setUserData(prev => ({ ...prev, totalPosts: posts.length }));
      }
      
      // Load saved locations
      const savedLocs = await AsyncStorage.getItem('savedLocations');
      if (savedLocs) {
        setSavedLocations(JSON.parse(savedLocs));
      }
      
      // Load user plans
      const savedPlans = await AsyncStorage.getItem('userPlans');
      if (savedPlans) {
        setUserPlans(JSON.parse(savedPlans));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const savedPosts = await AsyncStorage.getItem('userPosts');
      if (savedPosts) {
        setUserPosts(JSON.parse(savedPosts));
      }
    } catch (error) {
      console.log('Error loading user posts:', error);
    }
  };

  const saveUserPlans = async (plans) => {
    try {
      await AsyncStorage.setItem('userPlans', JSON.stringify(plans));
    } catch (error) {
      console.log('Error saving plans:', error);
    }
  };

  const saveSavedLocations = async (locations) => {
    try {
      await AsyncStorage.setItem('savedLocations', JSON.stringify(locations));
    } catch (error) {
      console.log('Error saving locations:', error);
    }
  };

  const handleCreatePlan = () => {
    if (!newPlan.title || !newPlan.destination || !newPlan.startDate || !newPlan.endDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const plan = {
      id: Date.now(),
      title: newPlan.title,
      destination: newPlan.destination,
      startDate: newPlan.startDate,
      endDate: newPlan.endDate,
      budget: newPlan.budget || 'Not specified',
      companions: parseInt(newPlan.companions) || 1,
      status: 'planning',
      progress: 0,
      image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800",
      activities: newPlan.activities.split(',').map(a => a.trim())
    };

    const updatedPlans = [plan, ...userPlans];
    setUserPlans(updatedPlans);
    saveUserPlans(updatedPlans);
    
    setShowCreatePlan(false);
    setNewPlan({
      title: '',
      destination: '',
      startDate: '',
      endDate: '',
      budget: '',
      companions: '',
      activities: ''
    });
    Alert.alert('Success', 'Travel plan created successfully!');
  };

  const handleDeletePlan = (planId) => {
    Alert.alert('Delete Plan', 'Are you sure you want to delete this plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedPlans = userPlans.filter(p => p.id !== planId);
          setUserPlans(updatedPlans);
          saveUserPlans(updatedPlans);
          Alert.alert('Success', 'Plan deleted');
        }
      }
    ]);
  };

  const handleSaveLocation = (location) => {
    const newLocation = {
      id: Date.now(),
      name: location.name || location,
      image: location.image || "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800",
      rating: location.rating || 4.5,
      savedDate: 'Just now',
      visited: false
    };
    
    const updatedLocations = [newLocation, ...savedLocations];
    setSavedLocations(updatedLocations);
    saveSavedLocations(updatedLocations);
    Alert.alert('Success', 'Location saved to your list!');
    setShowSearchModal(false);
    setSearchQuery('');
  };

  const handleRemoveSavedLocation = (locationId) => {
    Alert.alert('Remove', 'Remove this from saved locations?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        onPress: () => {
          const updatedLocations = savedLocations.filter(l => l.id !== locationId);
          setSavedLocations(updatedLocations);
          saveSavedLocations(updatedLocations);
        }
      }
    ]);
  };

  const searchLocations = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const mockResults = [
      { id: 1, name: "Eiffel Tower, Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800", rating: 4.9 },
      { id: 2, name: "Colosseum, Rome", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800", rating: 4.8 },
      { id: 3, name: "Sagrada Familia, Barcelona", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800", rating: 4.7 },
      { id: 4, name: "Great Wall, China", image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800", rating: 4.9 },
      { id: 5, name: "Taj Mahal, India", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800", rating: 4.8 },
    ];
    
    setSearchResults(mockResults.filter(r => r.name.toLowerCase().includes(query.toLowerCase())));
  };

  const navigateToFullPlan = (plan) => {
    router.push({
      pathname: '/app-pages/travel-plan-details',
      params: { plan: JSON.stringify(plan) }
    });
  };

  const navigateToFullPost = (post) => {
    router.push({
      pathname: '/app-pages/post-details',
      params: { post: JSON.stringify(post) }
    });
  };

  const navigateToTourGuideProfile = () => {
    router.push({
      pathname: '/app-pages/tour-guide-profile',
      params: { guide: JSON.stringify(tourGuide) }
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#1877f2', '#1877f2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientHeader}
    >
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Hub</Text>
        <TouchableOpacity onPress={() => Share.share({ message: `Check out ${userData.name}'s travel profile!` })} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>📤</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileHeader}>
        <Image source={{ uri: userData.avatar }} style={styles.profileImage} />
        <Text style={styles.profileName}>{userData.name}</Text>
        <Text style={styles.profileUsername}>@{userData.username}</Text>
        <Text style={styles.profileBio}>{userData.bio}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.totalPosts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'plans' && styles.activeTab]} 
        onPress={() => setSelectedTab('plans')}
      >
        <Text style={[styles.tabIcon, selectedTab === 'plans' && styles.activeTabIcon]}>📋</Text>
        <Text style={[styles.tabText, selectedTab === 'plans' && styles.activeTabText]}>Plans</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'saved' && styles.activeTab]} 
        onPress={() => setSelectedTab('saved')}
      >
        <Text style={[styles.tabIcon, selectedTab === 'saved' && styles.activeTabIcon]}>🔖</Text>
        <Text style={[styles.tabText, selectedTab === 'saved' && styles.activeTabText]}>Saved</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'posts' && styles.activeTab]} 
        onPress={() => setSelectedTab('posts')}
      >
        <Text style={[styles.tabIcon, selectedTab === 'posts' && styles.activeTabIcon]}>📸</Text>
        <Text style={[styles.tabText, selectedTab === 'posts' && styles.activeTabText]}>Posts</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, selectedTab === 'guide' && styles.activeTab]} 
        onPress={() => setSelectedTab('guide')}
      >
        <Text style={[styles.tabIcon, selectedTab === 'guide' && styles.activeTabIcon]}>👨‍✈️</Text>
        <Text style={[styles.tabText, selectedTab === 'guide' && styles.activeTabText]}>Guide</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlansTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.createPlanBtn} onPress={() => setShowCreatePlan(true)}>
        <Text style={styles.createPlanBtnText}>+ Create New Travel Plan</Text>
      </TouchableOpacity>
      
      {userPlans.map((plan) => (
        <TouchableOpacity key={plan.id} style={styles.planCard} onPress={() => navigateToFullPlan(plan)}>
          <Image source={{ uri: plan.image }} style={styles.planImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.planOverlay}
          />
          <View style={styles.planContent}>
            <View style={styles.planStatus}>
              <View style={[styles.statusBadge, plan.status === 'upcoming' ? styles.statusUpcoming : styles.statusPlanning]}>
                <Text style={styles.statusText}>{plan.status.toUpperCase()}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeletePlan(plan.id)} style={styles.deletePlanBtn}>
                <Text style={styles.deletePlanText}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planDestination}>📍 {plan.destination}</Text>
            <Text style={styles.planDate}>📅 {plan.startDate} - {plan.endDate}</Text>
            <View style={styles.planProgress}>
              <View style={[styles.progressBar, { width: `${plan.progress}%` }]} />
            </View>
            <Text style={styles.planProgressText}>{plan.progress}% planned</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSavedTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.searchLocationBtn} onPress={() => setShowSearchModal(true)}>
        <Text style={styles.searchLocationBtnText}>🔍 Search & Save Locations</Text>
      </TouchableOpacity>
      
      {savedLocations.map((location) => (
        <View key={location.id} style={styles.savedCard}>
          <Image source={{ uri: location.image }} style={styles.savedImage} />
          <View style={styles.savedContent}>
            <Text style={styles.savedName}>{location.name}</Text>
            <View style={styles.savedRating}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{location.rating}</Text>
              <Text style={styles.savedDate}>• {location.savedDate}</Text>
            </View>
            {location.visited && (
              <View style={styles.visitedBadge}>
                <Text style={styles.visitedText}>✓ Visited</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => handleRemoveSavedLocation(location.id)} style={styles.removeSavedBtn}>
            <Text style={styles.removeSavedText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderPostsTab = () => (
    <View style={styles.tabContent}>
      {userPosts.slice(0, 10).map((post) => (
        <TouchableOpacity key={post.id} style={styles.postCard} onPress={() => navigateToFullPost(post)}>
          {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
          <View style={styles.postInfo}>
            <Text style={styles.postCaption} numberOfLines={2}>{post.caption}</Text>
            <View style={styles.postStats}>
              <Text style={styles.postStat}>👍 {post.likes || 0}</Text>
              <Text style={styles.postStat}>💬 {post.comments?.length || 0}</Text>
              <Text style={styles.postStat}>↗️ {post.shares || 0}</Text>
            </View>
            <Text style={styles.postTime}>{formatDateTime(post.timestamp)}</Text>
          </View>
        </TouchableOpacity>
      ))}
      {userPosts.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📝</Text>
          <Text style={styles.emptyStateText}>No posts yet. Share your first travel story!</Text>
        </View>
      )}
    </View>
  );

  const renderGuideTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.guideCard} onPress={navigateToTourGuideProfile}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.guideHeader}
        >
          <Image source={{ uri: tourGuide.avatar }} style={styles.guideAvatar} />
          <Text style={styles.guideName}>{tourGuide.name}</Text>
          <View style={styles.guideRating}>
            <Text style={styles.guideStar}>⭐</Text>
            <Text style={styles.guideRatingText}>{tourGuide.rating} • {tourGuide.totalTours} tours</Text>
          </View>
          <Text style={styles.guideExperience}>{tourGuide.experience} experience</Text>
        </LinearGradient>
        
        <View style={styles.guideDetails}>
          <Text style={styles.guideBio}>{tourGuide.bio}</Text>
          
          <View style={styles.guideInfoRow}>
            <Text style={styles.guideInfoIcon}>💰</Text>
            <Text style={styles.guideInfoText}>{tourGuide.price}</Text>
          </View>
          <View style={styles.guideInfoRow}>
            <Text style={styles.guideInfoIcon}>🗣️</Text>
            <Text style={styles.guideInfoText}>Speaks: {tourGuide.languages.join(', ')}</Text>
          </View>
          <View style={styles.guideInfoRow}>
            <Text style={styles.guideInfoIcon}>🎯</Text>
            <Text style={styles.guideInfoText}>Specializes in: {tourGuide.specialties.join(', ')}</Text>
          </View>
          
          <View style={styles.availabilityBadge}>
            <Text style={styles.availabilityText}>{tourGuide.availability}</Text>
          </View>
          
          <TouchableOpacity style={styles.bookNowBtn} onPress={navigateToTourGuideProfile}>
            <Text style={styles.bookNowBtnText}>Book This Guide →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadUserData()} colors={['#667eea']} />
        }
      >
        {renderHeader()}
        {renderTabBar()}
        {selectedTab === 'plans' && renderPlansTab()}
        {selectedTab === 'saved' && renderSavedTab()}
        {selectedTab === 'posts' && renderPostsTab()}
        {selectedTab === 'guide' && renderGuideTab()}
      </ScrollView>

      {/* Create Plan Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCreatePlan}
        onRequestClose={() => setShowCreatePlan(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Create Travel Plan</Text>
              <TouchableOpacity onPress={() => setShowCreatePlan(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Plan Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., European Summer Adventure"
                value={newPlan.title}
                onChangeText={(text) => setNewPlan({...newPlan, title: text})}
              />
              
              <Text style={styles.inputLabel}>Destination *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Paris, Rome, Barcelona"
                value={newPlan.destination}
                onChangeText={(text) => setNewPlan({...newPlan, destination: text})}
              />
              
              <Text style={styles.inputLabel}>Start Date *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., June 15, 2024"
                value={newPlan.startDate}
                onChangeText={(text) => setNewPlan({...newPlan, startDate: text})}
              />
              
              <Text style={styles.inputLabel}>End Date *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., July 10, 2024"
                value={newPlan.endDate}
                onChangeText={(text) => setNewPlan({...newPlan, endDate: text})}
              />
              
              <Text style={styles.inputLabel}>Budget (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., $2,500"
                value={newPlan.budget}
                onChangeText={(text) => setNewPlan({...newPlan, budget: text})}
              />
              
              <Text style={styles.inputLabel}>Companions (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Number of companions"
                keyboardType="numeric"
                value={newPlan.companions}
                onChangeText={(text) => setNewPlan({...newPlan, companions: text})}
              />
              
              <Text style={styles.inputLabel}>Activities (Comma separated)</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="e.g., Eiffel Tower, Museum, Cruise"
                multiline
                value={newPlan.activities}
                onChangeText={(text) => setNewPlan({...newPlan, activities: text})}
              />
              
              <TouchableOpacity style={styles.createBtn} onPress={handleCreatePlan}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createBtnGradient}
                >
                  <Text style={styles.createBtnText}>Create Plan</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Search Locations Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSearchModal}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModalContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Search Locations</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>
            
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for places to save..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchLocations(text);
                }}
              />
            </View>
            
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.searchResultItem} onPress={() => handleSaveLocation(item)}>
                  <Image source={{ uri: item.image }} style={styles.searchResultImage} />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <View style={styles.searchResultRating}>
                      <Text style={styles.ratingStar}>⭐</Text>
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.saveLocationIcon}>➕</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery ? (
                  <View style={styles.emptySearch}>
                    <Text style={styles.emptySearchText}>No results found</Text>
                  </View>
                ) : (
                  <View style={styles.emptySearch}>
                    <Text style={styles.emptySearchText}>Search for amazing places to save!</Text>
                  </View>
                )
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1877f2',
  },
  gradientHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtnText: {
    fontSize: 20,
    color: '#ffffff',
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffffff',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -20,
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
  },
  activeTab: {
    backgroundColor: '#1877f2',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeTabIcon: {
    color: '#ffffff',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabContent: {
    padding: 20,
  },
  createPlanBtn: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  createPlanBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  planImage: {
    width: '100%',
    height: 180,
  },
  planOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  planContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  planStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusUpcoming: {
    backgroundColor: '#4CAF50',
  },
  statusPlanning: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deletePlanBtn: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletePlanText: {
    fontSize: 14,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  planDestination: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  planDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  planProgress: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  planProgressText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  searchLocationBtn: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchLocationBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  savedCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  savedImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  savedContent: {
    flex: 1,
    marginLeft: 12,
  },
  savedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 4,
  },
  savedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingStar: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  savedDate: {
    fontSize: 11,
    color: '#999',
  },
  visitedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  visitedText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  removeSavedBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSavedText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  postInfo: {
    flex: 1,
    marginLeft: 12,
  },
  postCaption: {
    fontSize: 13,
    color: '#1c1e21',
    marginBottom: 6,
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  postStat: {
    fontSize: 11,
    color: '#666',
  },
  postTime: {
    fontSize: 10,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  guideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  guideHeader: {
    alignItems: 'center',
    padding: 20,
  },
  guideAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffffff',
    marginBottom: 12,
  },
  guideName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  guideRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  guideStar: {
    fontSize: 14,
    marginRight: 4,
  },
  guideRatingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  guideExperience: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  guideDetails: {
    padding: 20,
  },
  guideBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  guideInfoRow: {
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
    color: '#666',
    flex: 1,
  },
  availabilityBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  availabilityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookNowBtn: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookNowBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
  },
  searchModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalClose: {
    fontSize: 24,
    color: '#ffffff',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createBtn: {
    marginTop: 20,
    marginBottom: 30,
  },
  createBtnGradient: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    margin: 20,
    paddingHorizontal: 15,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  searchResultImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 4,
  },
  searchResultRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveLocationIcon: {
    fontSize: 24,
    color: '#667eea',
  },
  emptySearch: {
    alignItems: 'center',
    padding: 40,
  },
  emptySearchText: {
    fontSize: 14,
    color: '#999',
  },
});

export default profileHome;