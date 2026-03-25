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

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const savedProfiles = await AsyncStorage.getItem('tourGuideProfiles');
      if (savedProfiles && params.profileId) {
        const profilesList = JSON.parse(savedProfiles);
        const foundProfile = profilesList.find(p => p.id === params.profileId);
        if (foundProfile) {
          setProfile(foundProfile);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleShare = async () => {
    if (!profile) return;
    try {
      const message = `🌟 Meet ${profile.fullName} - Your Perfect Tour Guide!\n\n` +
        `📍 Location: ${profile.province || 'Not specified'}\n` +
        `⭐ Experience: ${profile.experience || 'Not specified'}\n` +
        `🗣️ Languages: ${profile.languages || 'Not specified'}\n` +
        `📝 About: ${profile.description || 'No description'}\n\n` +
        `${profile.travelModeTags?.length > 0 ? `🏷️ Tags: ${profile.travelModeTags.join(', ')}\n\n` : ''}` +
        `✨ Book now for an unforgettable journey!`;

      await Share.share({
        message,
        title: `${profile.fullName} - Tour Guide Profile`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
        {/* Cover Image / Header */}
        <View style={styles.coverContainer}>
          <View style={styles.coverGradient} />
          <Text style={styles.coverBadge}>🌟 Tour Guide</Text>
        </View>

        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          {profile.image ? (
            <Image source={{ uri: profile.image }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.profileImagePlaceholderText}>
                {profile.fullName?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile.fullName}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText}>{profile.province || 'Location not specified'}</Text>
          </View>
          
          {profile.isTourGuide && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text style={styles.verifiedText}>Verified Tour Guide</Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="briefcase-outline" size={18} color="#007AFF" />
            <Text style={styles.statValue}>{profile.experience || '0'}</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="language-outline" size={18} color="#007AFF" />
            <Text style={styles.statValue}>{profile.languages?.split(',').length || '0'}</Text>
            <Text style={styles.statLabel}>Languages</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="ribbon-outline" size={18} color="#007AFF" />
            <Text style={styles.statValue}>{profile.travelModeTags?.length || '0'}</Text>
            <Text style={styles.statLabel}>Specialties</Text>
          </View>
        </View>

        {/* Description */}
        {profile.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>📝 About Me</Text>
            <Text style={styles.descriptionText}>{profile.description}</Text>
          </View>
        )}

        {/* Languages */}
        {profile.languages && (
          <View style={styles.languagesContainer}>
            <Text style={styles.sectionTitle}>🗣️ Languages</Text>
            <View style={styles.languagesList}>
              {profile.languages.split(',').map((lang, index) => (
                <View key={index} style={styles.languageTag}>
                  <Text style={styles.languageTagText}>{lang.trim()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Travel Mode Tags */}
        {profile.travelModeTags?.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.sectionTitle}>🏷️ Travel Specialties</Text>
            <View style={styles.tagsList}>
              {profile.travelModeTags.map((tag, index) => (
                <View key={index} style={styles.tagItem}>
                  <Text style={styles.tagItemText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Special Notes */}
        {profile.specialNotes?.length > 0 && (
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>📌 Special Notes</Text>
            {profile.specialNotes.map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.noteItemText}>{note}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
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

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          Joined {new Date(profile.createdAt).toLocaleDateString()}
        </Text>
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
    paddingBottom: 30,
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
  notesContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteItemText: {
    fontSize: 13,
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
  timestamp: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    paddingBottom: 16,
  },
});

export default TourGuideCard;