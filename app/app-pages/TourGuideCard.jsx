import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TourGuideCard = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profileId = params.profileId;
      console.log('Loading profile with ID:', profileId);
      
      if (!profileId) {
        console.log('No profile ID provided');
        setProfile(null);
        setLoading(false);
        return;
      }
      
      const savedProfiles = await AsyncStorage.getItem('tourGuideProfiles');
      if (savedProfiles) {
        const profilesList = JSON.parse(savedProfiles);
        console.log('All profiles:', profilesList);
        
        // Find by id or userId
        const foundProfile = profilesList.find(p => p.id == profileId || p.userId == profileId);
        
        if (foundProfile) {
          console.log('Profile found:', foundProfile);
          setProfile(foundProfile);
        } else {
          console.log('Profile not found for ID:', profileId);
          setProfile(null);
        }
      } else {
        console.log('No profiles found in storage');
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!profile) return;
    try {
      const message = `🌟 Meet ${profile.name || 'Tour Guide'} - Your Perfect Guide!\n\n` +
        `📍 Location: ${profile.location || 'Not specified'}\n` +
        `⭐ Experience: ${profile.experience || 'Not specified'}\n` +
        `🗣️ Languages: ${profile.languages?.length ? profile.languages.join(', ') : 'Not specified'}\n` +
        `📝 About: ${profile.bio || 'No description'}\n\n` +
        `${profile.specialties?.length > 0 ? `🏷️ Specialties: ${profile.specialties.join(', ')}\n\n` : ''}` +
        `💰 Price: ${profile.price || '$50/day'}\n` +
        `✨ Book now for an unforgettable journey!`;

      await Share.share({
        message,
        title: `${profile.name || 'Tour Guide'} - Profile`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tour Guide</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tour Guide</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Profile Not Found</Text>
          <Text style={styles.emptyText}>This tour guide profile does not exist.</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.back()}
          >
            <Text style={styles.createButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tour Guide Profile</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.coverContainer}>
          <View style={styles.coverGradient} />
          <Text style={styles.coverBadge}>🌟 Tour Guide</Text>
        </View>

        <View style={styles.profileImageContainer}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.profileImagePlaceholderText}>
                {profile.name?.charAt(0).toUpperCase() || 'G'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile.name || 'Name not provided'}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText}>{profile.location || 'Location not specified'}</Text>
          </View>
          
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={styles.verifiedText}>Professional Tour Guide</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={18} color="#007AFF" />
            <Text style={styles.statValue}>{profile.rating || '4.9'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="language-outline" size={18} color="#007AFF" />
            <Text style={styles.statValue}>{profile.languages?.length || 0}</Text>
            <Text style={styles.statLabel}>Languages</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="ribbon-outline" size={18} color="#007AFF" />
            <Text style={styles.statValue}>{profile.specialties?.length || 0}</Text>
            <Text style={styles.statLabel}>Specialties</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Price per day</Text>
            <Text style={styles.priceValue}>{profile.price || '$50/day'}</Text>
          </View>
          <View style={styles.availabilityCard}>
            <Text style={styles.availabilityLabel}>Availability</Text>
            <Text style={styles.availabilityValue}>{profile.availability || 'Available for booking'}</Text>
          </View>
        </View>

        {/* Description - User entered */}
        {profile.bio && profile.bio.length > 0 ? (
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>📝 About Me</Text>
            <Text style={styles.descriptionText}>{profile.bio}</Text>
          </View>
        ) : null}

        {/* Languages - User entered */}
        {profile.languages && profile.languages.length > 0 && (
          <View style={styles.languagesContainer}>
            <Text style={styles.sectionTitle}>🗣️ Languages</Text>
            <View style={styles.languagesList}>
              {profile.languages.map((lang, index) => (
                <View key={index} style={styles.languageTag}>
                  <Text style={styles.languageTagText}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Specialties - User entered */}
        {profile.specialties && profile.specialties.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.sectionTitle}>🏷️ Travel Specialties</Text>
            <View style={styles.tagsList}>
              {profile.specialties.map((tag, index) => (
                <View key={index} style={styles.tagItem}>
                  <Text style={styles.tagItemText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experience - User entered */}
        {profile.experience && profile.experience.length > 0 && (
          <View style={styles.experienceContainer}>
            <Text style={styles.sectionTitle}>💼 Experience</Text>
            <Text style={styles.experienceText}>{profile.experience}</Text>
          </View>
        )}

        {/* Special Notes - User entered */}
        {profile.notes && profile.notes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>📌 Special Notes</Text>
            {profile.notes.map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.bookButton}>
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton}>
            <Ionicons name="chatbubble" size={18} color="#007AFF" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  shareButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 75,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  coverContainer: {
    height: 120,
    backgroundColor: '#007AFF',
    position: 'relative',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  coverBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: -60,
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#f0f0f0',
  },
  profileImagePlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 11,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  priceCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priceLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  availabilityCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  availabilityLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  availabilityValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  languagesContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  languagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageTag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  languageTagText: {
    fontSize: 12,
    color: '#007AFF',
  },
  tagsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagItemText: {
    fontSize: 12,
    color: '#666',
  },
  experienceContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  experienceText: {
    fontSize: 14,
    color: '#666',
  },
  notesSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  messageButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TourGuideCard;