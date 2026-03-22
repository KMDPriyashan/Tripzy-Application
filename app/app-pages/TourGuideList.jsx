import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TourGuideList = () => {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadProfiles();
    }, [])
  );

  const loadProfiles = async () => {
    try {
      const savedProfiles = await AsyncStorage.getItem('tourGuideProfiles');
      if (savedProfiles) {
        const profilesList = JSON.parse(savedProfiles);
        setProfiles(profilesList.reverse()); // Show newest first
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const handleCardPress = (profile) => {
    router.push({
      pathname: '/app-pages/TourGuideCard',
      params: { profileId: profile.id }
    });
  };

  const handleChatPress = (profile) => {
    // Navigate to chat page with the guide
    router.push({
      pathname: '/app-pages/Chat',
      params: { guideId: profile.id, guideName: profile.fullName }
    });
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
        onPress={() => router.push('/app-pages/TourGuideProfile')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Create Your Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const GuideCard = ({ profile }) => (
    <View style={styles.card}>
      {/* Header with Avatar and Name */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          {profile.image ? (
            <Image source={{ uri: profile.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>
                {profile.fullName?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.guideName}>{profile.fullName}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.locationText}>{profile.province || 'Location not set'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>4.9</Text>
        </View>
      </View>

      {/* Cover Image */}
      {profile.image ? (
        <Image source={{ uri: profile.image }} style={styles.coverImage} />
      ) : (
        <View style={[styles.coverImage, styles.coverPlaceholder]}>
          <Ionicons name="camera-outline" size={40} color="#ccc" />
        </View>
      )}

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.guideTitle}>Official Photographer and Travel Guide</Text>
        
        {/* Experience */}
        {profile.experience && (
          <View style={styles.experienceContainer}>
            <Ionicons name="briefcase-outline" size={14} color="#007AFF" />
            <Text style={styles.experienceText}>{profile.experience} of experience</Text>
          </View>
        )}

        {/* Languages */}
        {profile.languages && (
          <View style={styles.languagesContainer}>
            <Ionicons name="language-outline" size={14} color="#666" />
            <Text style={styles.languagesText}>{profile.languages}</Text>
          </View>
        )}

        {/* Description Preview */}
        {profile.description && (
          <Text style={styles.descriptionPreview} numberOfLines={2}>
            {profile.description}
          </Text>
        )}

        {/* Tags */}
        {profile.travelModeTags?.length > 0 && (
          <View style={styles.tagsContainer}>
            {profile.travelModeTags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {profile.travelModeTags.length > 3 && (
              <Text style={styles.moreTags}>+{profile.travelModeTags.length - 3}</Text>
            )}
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
        
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => handleChatPress(profile)}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#25D366" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Travel Guides</Text>
          <Text style={styles.headerSubtitle}>Expert-led tours, unforgettable experiences.</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/app-pages/TourGuideProfile')}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Your Guided Journey Awaits</Text>
        <Text style={styles.heroSubtitle}>
          Expert-led tours, unforgettable experiences.
        </Text>
      </View>

      {/* Guides List */}
      <FlatList
        data={profiles}
        renderItem={({ item }) => <GuideCard profile={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    padding: 4,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 4,
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
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
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
    marginLeft: 8,
    gap: 6,
  },
  chatButtonText: {
    color: '#25D366',
    fontSize: 14,
    fontWeight: '500',
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
});

export default TourGuideList;