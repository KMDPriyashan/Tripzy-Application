import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { getCurrentUser, supabase } from '../../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TourGuideList = () => {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasOwnProfile, setHasOwnProfile] = useState(false);
  const [ownProfileData, setOwnProfileData] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockFeatureEnabled, setBlockFeatureEnabled] = useState(true);
  const subscriptionRef = useRef(null);

  const validateImageUri = (uri) => {
    if (!uri) return null;
    if (uri.startsWith('file://') || uri.startsWith('content://')) return uri;
    if (uri.startsWith('data:image')) return uri;
    if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
    return null;
  };

  useEffect(() => {
    loadCurrentUser();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  const loadBlockedUsersForUser = async (user) => {
    if (!user?.id) {
      console.log('No user provided, skipping blocked users load');
      setBlockedUsers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_user_id')
        .eq('user_id', user.id);

      if (error) {
        if (error.code === 'PGRST205') {
          console.log('Blocked users table not found. Block feature disabled.');
          setBlockFeatureEnabled(false);
          setBlockedUsers([]);
          return;
        }
        throw error;
      }
      setBlockedUsers(data?.map(item => item.blocked_user_id) || []);
    } catch (error) {
      console.error('Error loading blocked users:', error);
      setBlockFeatureEnabled(false);
      setBlockedUsers([]);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      if (user) {
        await loadProfiles();
        await loadBlockedUsersForUser(user);
        setupRealtimeSubscription();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tour_guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const validatedProfiles = data.map(profile => ({
          ...profile,
          image: validateImageUri(profile.image)
        }));
        
        setProfiles(validatedProfiles);
        setFilteredProfiles(validatedProfiles);

        if (currentUser) {
          const userProfile = validatedProfiles.find(p => p.user_id === currentUser.id);
          setHasOwnProfile(!!userProfile);
          if (userProfile) {
            setOwnProfileData(userProfile);
          }
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

  const setupRealtimeSubscription = async () => {
    if (subscriptionRef.current) {
      await supabase.removeChannel(subscriptionRef.current);
    }

    const channel = supabase
      .channel('tour-guides-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tour_guides',
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;
  };

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        const newProfile = {
          ...newRecord,
          image: validateImageUri(newRecord.image)
        };
        setProfiles(prev => [newProfile, ...prev]);
        if (searchQuery === '') {
          setFilteredProfiles(prev => [newProfile, ...prev]);
        }
        // Check if this is the current user's profile
        if (currentUser && newRecord.user_id === currentUser.id) {
          setHasOwnProfile(true);
          setOwnProfileData(newProfile);
        }
        break;

      case 'UPDATE':
        const updatedProfile = {
          ...newRecord,
          image: validateImageUri(newRecord.image)
        };
        setProfiles(prev =>
          prev.map(p => p.id === updatedProfile.id ? updatedProfile : p)
        );
        setFilteredProfiles(prev =>
          prev.map(p => p.id === updatedProfile.id ? updatedProfile : p)
        );
        // Update own profile data if this is the current user's profile
        if (currentUser && newRecord.user_id === currentUser.id) {
          setOwnProfileData(updatedProfile);
        }
        break;

      case 'DELETE':
        setProfiles(prev => prev.filter(p => p.id !== oldRecord.id));
        setFilteredProfiles(prev => prev.filter(p => p.id !== oldRecord.id));
        if (currentUser && oldRecord.user_id === currentUser.id) {
          setHasOwnProfile(false);
          setOwnProfileData(null);
        }
        break;
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const searchLower = text.toLowerCase();
      const filtered = profiles.filter(profile =>
        profile.full_name?.toLowerCase().includes(searchLower) ||
        profile.province?.toLowerCase().includes(searchLower) ||
        profile.travel_mode_tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        profile.languages?.toLowerCase().includes(searchLower)
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

  const handleEditProfile = (profile) => {
    // Navigate to TGprofile with profile data for editing
    router.push({
      pathname: '/app-pages/TGprofile',
      params: { 
        profileId: profile.id,
        editMode: 'true'
      }
    });
  };

  const handleChatPress = (profile) => {
    const whatsappNumber = profile.whatsapp_number;
    if (!whatsappNumber) {
      Alert.alert('WhatsApp Not Available', 'This guide has not provided a WhatsApp number.');
      return;
    }
    
    let cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
    if (!cleanNumber.startsWith('+')) {
      cleanNumber = '+' + cleanNumber;
    }
    
    const whatsappUrl = `whatsapp://send?phone=${cleanNumber}`;
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) return Linking.openURL(whatsappUrl);
        Alert.alert('WhatsApp Not Installed', 'Please install WhatsApp to chat with this guide.');
      })
      .catch(() => Alert.alert('Error', 'Unable to open WhatsApp.'));
  };

  const handleBecomeGuide = () => {
    if (hasOwnProfile) {
      // If user already has a profile, go to edit mode
      if (ownProfileData) {
        handleEditProfile(ownProfileData);
      }
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
      'Are you sure you want to delete your tour guide profile? This cannot be undone.',
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
              Alert.alert('Success', 'Your profile has been deleted.');
              setHasOwnProfile(false);
              setOwnProfileData(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete profile.');
            }
          }
        }
      ]
    );
  };

  const handleBlockUser = async (profile) => {
    if (!blockFeatureEnabled) {
      Alert.alert('Feature Unavailable', 'Block feature is currently unavailable. Please try again later.');
      return;
    }

    if (profile.user_id === currentUser?.id) {
      Alert.alert('Cannot Block', 'You cannot block your own profile.');
      return;
    }

    Alert.alert(
      'Block User',
      `Are you sure you want to block ${profile.full_name}? You won't see their profile anymore.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('blocked_users')
                .insert([{
                  user_id: currentUser.id,
                  blocked_user_id: profile.user_id
                }]);

              if (error) throw error;
              setBlockedUsers(prev => [...prev, profile.user_id]);
              Alert.alert('Blocked', `${profile.full_name} has been blocked.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to block user.');
            }
          }
        }
      ]
    );
  };

  const handleUnblockUser = async (profile) => {
    if (!blockFeatureEnabled) {
      Alert.alert('Feature Unavailable', 'Unblock feature is currently unavailable.');
      return;
    }

    Alert.alert(
      'Unblock User',
      `Do you want to unblock ${profile.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('blocked_users')
                .delete()
                .eq('user_id', currentUser.id)
                .eq('blocked_user_id', profile.user_id);

              if (error) throw error;
              setBlockedUsers(prev => prev.filter(id => id !== profile.user_id));
              Alert.alert('Unblocked', `${profile.full_name} has been unblocked.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to unblock user.');
            }
          }
        }
      ]
    );
  };

  const GuideAvatar = ({ imageUri, name, style }) => {
    const [imageError, setImageError] = useState(false);

    if (imageError || !imageUri) {
      return (
        <View style={[style, styles.avatarPlaceholder]}>
          <Text style={styles.avatarPlaceholderText}>
            {name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
      );
    }

    return (
      <Image 
        source={{ uri: imageUri }}
        style={style}
        onError={() => setImageError(true)}
      />
    );
  };

  const GuideCard = ({ profile }) => {
    const isOwner = currentUser && profile.user_id === currentUser.id;
    const isBlocked = blockFeatureEnabled && blockedUsers.includes(profile.user_id);

    if (isBlocked) {
      return (
        <View style={styles.blockedCard}>
          <View style={styles.blockedContent}>
            <Ionicons name="eye-off-outline" size={40} color="#999" />
            <Text style={styles.blockedText}>This profile is blocked</Text>
            <TouchableOpacity
              style={styles.unblockButton}
              onPress={() => handleUnblockUser(profile)}
            >
              <Text style={styles.unblockButtonText}>Unblock User</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleCardPress(profile)}
        activeOpacity={0.95}
      >
        {/* Full Size Cover Image */}
        <View style={styles.imageContainer}>
          {profile.image ? (
            <Image 
              source={{ uri: profile.image }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="camera-outline" size={50} color="#ccc" />
            </View>
          )}
          
          {/* Gradient Overlay */}
          <View style={styles.imageOverlay} />
          
          {/* Name and Location Overlay */}
          <View style={styles.overlayContent}>
            <Text style={styles.guideNameOverlay}>{profile.full_name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#fff" />
              <Text style={styles.locationTextOverlay}>{profile.province || 'Location not set'}</Text>
            </View>
          </View>

          {/* Badge */}
          {isOwner && (
            <View style={styles.ownerBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text style={styles.ownerBadgeText}>Your Profile</Text>
            </View>
          )}
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Tags */}
          {profile.travel_mode_tags?.length > 0 && (
            <View style={styles.tagsContainer}>
              {profile.travel_mode_tags.slice(0, 4).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {profile.travel_mode_tags.length > 4 && (
                <Text style={styles.moreTags}>+{profile.travel_mode_tags.length - 4}</Text>
              )}
            </View>
          )}

          {/* Description */}
          {profile.description && (
            <Text style={styles.description} numberOfLines={2}>
              {profile.description}
            </Text>
          )}

          {/* Experience & Languages */}
          <View style={styles.detailsRow}>
            {profile.experience && (
              <View style={styles.detailItem}>
                <Ionicons name="briefcase-outline" size={14} color="#666" />
                <Text style={styles.detailText}>{profile.experience}</Text>
              </View>
            )}
            {profile.languages && (
              <View style={styles.detailItem}>
                <Ionicons name="language-outline" size={14} color="#666" />
                <Text style={styles.detailText}>{profile.languages}</Text>
              </View>
            )}
            {profile.whatsapp_number && !isOwner && (
              <View style={styles.detailItem}>
                <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                <Text style={[styles.detailText, { color: '#25D366' }]}>Available</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleCardPress(profile)}
            >
              <Text style={styles.viewButtonText}>View Profile</Text>
            </TouchableOpacity>

            {isOwner ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditProfile(profile)}
              >
                <Ionicons name="create-outline" size={18} color="#fff" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              profile.whatsapp_number && (
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => handleChatPress(profile)}
                >
                  <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                </TouchableOpacity>
              )
            )}

            {isOwner ? (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteProfile(profile)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              </TouchableOpacity>
            ) : (
              blockFeatureEnabled && (
                <TouchableOpacity
                  style={styles.blockButton}
                  onPress={() => handleBlockUser(profile)}
                >
                  <Ionicons name="ban-outline" size={18} color="#999" />
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Tour Guides Yet</Text>
      <Text style={styles.emptyText}>
        Be the first to create a tour guide profile and share your expertise!
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleBecomeGuide}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Become a Tour Guide</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.heroSubtitle}>Expert-led tours, unforgettable experiences.</Text>
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

      {/* Show Become a Tour Guide button only if user doesn't have a profile */}
      {!hasOwnProfile && (
        <View style={styles.becomeButtonContainer}>
          <TouchableOpacity
            style={styles.becomeButton}
            onPress={handleBecomeGuide}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.becomeButtonText}>Become a Tour Guide</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* If user has a profile, show an Edit Profile button instead */}
      {hasOwnProfile && ownProfileData && (
        <View style={styles.becomeButtonContainer}>
          <TouchableOpacity
            style={styles.becomeButton}
            onPress={() => handleEditProfile(ownProfileData)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.becomeButtonText}>Edit Your Profile</Text>
          </TouchableOpacity>
        </View>
      )}

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
              <TouchableOpacity style={styles.clearSearchButton} onPress={() => handleSearch('')}>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e8ecf0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
    color: '#333',
    paddingVertical: 0,
  },
  becomeButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  becomeButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  becomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f2f5',
  },
  imageContainer: {
    width: '100%',
    height: 260,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e8ecf0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
  overlayContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  guideNameOverlay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextOverlay: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 6,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ownerBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ownerBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
    paddingTop: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'center',
    marginLeft: 4,
  },
  description: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f5',
    paddingTop: 12,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f0f7f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff0f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  blockedCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f2f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  blockedContent: {
    alignItems: 'center',
    gap: 12,
  },
  blockedText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  unblockButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  unblockButtonText: {
    color: '#fff',
    fontSize: 14,
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
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    gap: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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