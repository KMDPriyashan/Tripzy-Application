import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TourGuideList = () => {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasOwnProfile, setHasOwnProfile] = useState(false);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    loadCurrentUser();
    
    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        await loadProfiles();
        setupRealtimeSubscription();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadProfiles = async () => {
    setLoading(true);
    try {
      // Fetch profiles from Supabase database
      const { data, error } = await supabase
        .from('tour_guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Add default ratings if not present
        const profilesWithRatings = data.map(profile => ({
          ...profile,
          rating: profile.rating || (Math.random() * (5 - 4) + 4).toFixed(1),
          reviewCount: profile.review_count || Math.floor(Math.random() * (200 - 50) + 50)
        }));
        setProfiles(profilesWithRatings);
        setFilteredProfiles(profilesWithRatings);
        
        // Check if current user has a profile
        if (currentUser) {
          const userProfile = profilesWithRatings.find(p => p.user_id === currentUser.id);
          setHasOwnProfile(!!userProfile);
        }
      } else {
        setProfiles([]);
        setFilteredProfiles([]);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles([]);
      setFilteredProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time subscription for tour_guides table
  const setupRealtimeSubscription = async () => {
    // Remove existing subscription if any
    if (subscriptionRef.current) {
      await supabase.removeChannel(subscriptionRef.current);
    }

    // Create new channel for real-time updates
    const channel = supabase
      .channel('tour-guides-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'tour_guides',
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    subscriptionRef.current = channel;
  };

  // Handle real-time updates
  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        // New profile added
        const newProfile = {
          ...newRecord,
          rating: newRecord.rating || (Math.random() * (5 - 4) + 4).toFixed(1),
          reviewCount: newRecord.review_count || Math.floor(Math.random() * (200 - 50) + 50)
        };
        
        setProfiles(prevProfiles => [newProfile, ...prevProfiles]);
        
        // Update filtered profiles if search query is empty
        if (searchQuery === '') {
          setFilteredProfiles(prev => [newProfile, ...prev]);
        } else {
          // Check if new profile matches search query
          const matchesSearch = checkProfileMatchesSearch(newProfile, searchQuery);
          if (matchesSearch) {
            setFilteredProfiles(prev => [newProfile, ...prev]);
          }
        }
        
        // Show notification (optional)
        // Alert.alert('New Guide', `${newProfile.full_name} joined as a tour guide!`);
        break;
        
      case 'UPDATE':
        // Profile updated
        const updatedProfile = {
          ...newRecord,
          rating: newRecord.rating || (Math.random() * (5 - 4) + 4).toFixed(1),
          reviewCount: newRecord.review_count || Math.floor(Math.random() * (200 - 50) + 50)
        };
        
        setProfiles(prevProfiles => 
          prevProfiles.map(profile => 
            profile.id === updatedProfile.id ? updatedProfile : profile
          )
        );
        
        setFilteredProfiles(prev => 
          prev.map(profile => 
            profile.id === updatedProfile.id ? updatedProfile : profile
          )
        );
        break;
        
      case 'DELETE':
        // Profile deleted
        setProfiles(prevProfiles => 
          prevProfiles.filter(profile => profile.id !== oldRecord.id)
        );
        setFilteredProfiles(prev => 
          prev.filter(profile => profile.id !== oldRecord.id)
        );
        break;
    }
    
    // Update hasOwnProfile status if current user's profile changed
    if (currentUser) {
      const userProfile = profiles.find(p => p.user_id === currentUser.id);
      setHasOwnProfile(!!userProfile);
    }
  };

  // Helper function to check if profile matches search query
  const checkProfileMatchesSearch = (profile, query) => {
    if (!query.trim()) return true;
    const searchLower = query.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(searchLower) ||
      profile.province?.toLowerCase().includes(searchLower) ||
      profile.travel_mode_tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
      profile.languages?.toLowerCase().includes(searchLower) ||
      profile.description?.toLowerCase().includes(searchLower)
    );
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const searchLower = text.toLowerCase();
      const filtered = profiles.filter(profile => 
        checkProfileMatchesSearch(profile, searchLower)
      );
      setFilteredProfiles(filtered);
    }
  };

  const handleCardPress = (profile) => {
    router.push({
      pathname: '/app-pages/TourGuideCard',
      params: { profileId: profile.id }
    });
  };

  const handleChatPress = (profile) => {
    router.push({
      pathname: '/app-pages/Chat',
      params: { guideId: profile.id, guideName: profile.full_name }
    });
  };

  const handleBecomeGuide = () => {
    if (hasOwnProfile) {
      Alert.alert(
        'Profile Already Exists',
        'You already have a tour guide profile. You can only create one profile per account.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }
    router.push('/app-pages/TGprofile');
  };

  const handleDeleteProfile = async (profile) => {
    if (currentUser && profile.user_id !== currentUser.id) {
      Alert.alert('Unauthorized', 'You can only delete your own profile');
      return;
    }

    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your tour guide profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('tour_guides')
                .delete()
                .eq('id', profile.id);

              if (error) throw error;
              
              // No need to manually update state - real-time subscription will handle it
              Alert.alert('Success', 'Your profile has been deleted successfully');
            } catch (error) {
              console.error('Error deleting profile:', error);
              Alert.alert('Error', 'Failed to delete profile. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleUpdateProfile = (profile) => {
    if (currentUser && profile.user_id !== currentUser.id) {
      Alert.alert('Unauthorized', 'You can only update your own profile');
      return;
    }
    
    router.push({
      pathname: '/app-pages/TGprofile',
      params: { profileId: profile.id }
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`star-${i}`} name="star" size={12} color="#FFD700" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half-star" name="star-half" size={12} color="#FFD700" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#FFD700" />);
    }
    return stars;
  };

  const GuideCard = ({ profile }) => {
    const isOwner = currentUser && profile.user_id === currentUser.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            {profile.image ? (
              <Image source={{ uri: profile.image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarPlaceholderText}>
                  {profile.full_name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.guideName}>{profile.full_name}</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={12} color="#666" />
                <Text style={styles.locationText}>{profile.province || 'Location not set'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.starsRow}>
              {renderStars(profile.rating || 4.5)}
            </View>
            <Text style={styles.ratingText}>{profile.rating || 4.5}</Text>
            <Text style={styles.reviewCount}>({profile.reviewCount || 0})</Text>
          </View>
        </View>

        {profile.image ? (
          <Image source={{ uri: profile.image }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder]}>
            <Ionicons name="camera-outline" size={40} color="#ccc" />
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.guideTitle}>Official Photographer and Travel Guide</Text>
          
          {profile.experience && (
            <View style={styles.experienceContainer}>
              <Ionicons name="briefcase-outline" size={14} color="#007AFF" />
              <Text style={styles.experienceText}>{profile.experience} of experience</Text>
            </View>
          )}

          {profile.languages && (
            <View style={styles.languagesContainer}>
              <Ionicons name="language-outline" size={14} color="#666" />
              <Text style={styles.languagesText}>{profile.languages}</Text>
            </View>
          )}

          {profile.description && (
            <Text style={styles.descriptionPreview} numberOfLines={2}>
              {profile.description}
            </Text>
          )}

          {profile.travel_mode_tags?.length > 0 && (
            <View style={styles.tagsContainer}>
              {profile.travel_mode_tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {profile.travel_mode_tags.length > 3 && (
                <Text style={styles.moreTags}>+{profile.travel_mode_tags.length - 3}</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          {isOwner && (
            <>
              <TouchableOpacity 
                style={styles.updateButton}
                onPress={() => handleUpdateProfile(profile)}
              >
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteProfile(profile)}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity 
            style={[styles.viewButton, !isOwner && styles.fullWidthViewButton]}
            onPress={() => handleCardPress(profile)}
          >
            <Text style={styles.viewButtonText}>View Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => handleChatPress(profile)}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#25D366" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
        
        {isOwner && (
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerBadgeText}>Your Profile</Text>
          </View>
        )}
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Tour Guides Yet</Text>
      <Text style={styles.emptyText}>
        Be the first to create a tour guide profile and share your expertise with travelers!
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={handleBecomeGuide}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Become a Tour Guide</Text>
      </TouchableOpacity>
    </View>
  );

  const SearchResultsCount = () => {
    if (searchQuery.length === 0) return null;
    return (
      <View style={styles.resultsCountContainer}>
        <Text style={styles.resultsCountText}>
          Found {filteredProfiles.length} {filteredProfiles.length === 1 ? 'result' : 'results'} for "{searchQuery}"
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tour guides...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Your Guided Journey Awaits</Text>
        <Text style={styles.heroSubtitle}>
          Expert-led tours, unforgettable experiences.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, location, or tags..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SearchResultsCount />

      <View style={styles.becomeButtonContainer}>
        <TouchableOpacity 
          style={[styles.becomeButton, hasOwnProfile && styles.becomeButtonDisabled]}
          onPress={handleBecomeGuide}
          disabled={hasOwnProfile}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.becomeButtonText}>
            {hasOwnProfile ? 'Profile Already Created' : 'Become a Tour Guide'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProfiles}
        renderItem={({ item }) => <GuideCard profile={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          searchQuery.length > 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={60} color="#ccc" />
              <Text style={styles.noResultsTitle}>No results found</Text>
              <Text style={styles.noResultsText}>
                We couldn't find any tour guides matching "{searchQuery}"
              </Text>
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => handleSearch('')}
              >
                <Text style={styles.clearSearchButtonText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <EmptyState />
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (keep all your existing styles)
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 75,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
    paddingVertical: 0,
  },
  resultsCountContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCountText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  becomeButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  becomeButton: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  becomeButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  becomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  guideName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 10,
    color: '#999',
    marginLeft: 2,
  },
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  cardContent: {
    padding: 16,
    paddingTop: 12,
  },
  guideTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  experienceText: {
    fontSize: 13,
    color: '#007AFF',
    marginLeft: 6,
  },
  languagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  languagesText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  descriptionPreview: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#007AFF',
  },
  moreTags: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  viewButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullWidthViewButton: {
    flex: 3,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  chatButtonText: {
    color: '#25D366',
    fontSize: 14,
    fontWeight: '500',
  },
  ownerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  clearSearchButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearSearchButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TourGuideList;