import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TourGuideCard = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [totalRatings, setTotalRatings] = useState(0);
  const [averageRating, setAverageRating] = useState(4.9);
  
  // Booking Modal State
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    userName: '',
    userEmail: '',
    tourDate: '',
    groupSize: '1',
    specialRequests: '',
    phoneNumber: ''
  });
  const [sendingBooking, setSendingBooking] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const normalizeTourGuideProfile = (rawProfile) => {
    if (!rawProfile) return null;

    const parseArray = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        return value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
      return [];
    };

    return {
      ...rawProfile,
      id: rawProfile.id ?? rawProfile.userId,
      userId: rawProfile.user_id ?? rawProfile.userId,
      name: rawProfile.full_name ?? rawProfile.name,
      email: rawProfile.user_email ?? rawProfile.email,
      avatar: rawProfile.image ?? rawProfile.avatar,
      rating: rawProfile.rating ?? 4.9,
      totalTours: rawProfile.totalTours ?? rawProfile.total_tours ?? 0,
      experience: rawProfile.experience ?? rawProfile.experience,
      languages: parseArray(rawProfile.languages),
      specialties: parseArray(rawProfile.specialties ?? rawProfile.travel_mode_tags),
      bio: rawProfile.description ?? rawProfile.bio,
      price: rawProfile.price ?? rawProfile.price ?? '$50/day',
      availability: rawProfile.availability ?? rawProfile.availability ?? 'Available',
      location: rawProfile.province ?? rawProfile.location,
      whatsapp: rawProfile.whatsapp_number ?? rawProfile.whatsapp,
      notes: Array.isArray(rawProfile.notes)
        ? rawProfile.notes
        : typeof rawProfile.notes === 'string'
        ? rawProfile.notes.split(',').map((item) => item.trim()).filter(Boolean)
        : Array.isArray(rawProfile.special_notes)
        ? rawProfile.special_notes
        : typeof rawProfile.special_notes === 'string'
        ? rawProfile.special_notes.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
    };
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadCurrentUser();
    }, [])
  );

  // Separate function to load ratings after user is loaded
  const loadRatings = async (user) => {
    try {
      const profileId = params.profileId;
      if (!profileId) return;
      
      const savedRatings = await AsyncStorage.getItem(`ratings_${profileId}`);
      if (savedRatings) {
        const ratingsData = JSON.parse(savedRatings);
        setTotalRatings(ratingsData.total || 0);
        setAverageRating(ratingsData.average || 4.9);
        
        // Check if current user has already rated - using the passed user parameter
        if (user?.id) {
          const userRatingData = ratingsData.users?.find(u => u.userId === user.id);
          if (userRatingData) {
            setHasRated(true);
            setUserRating(userRatingData.rating);
          } else {
            setHasRated(false);
            setUserRating(0);
          }
        } else {
          setHasRated(false);
          setUserRating(0);
        }
      } else {
        // Initialize with default data
        const defaultRatings = {
          total: 0,
          average: 0,
          users: []
        };
        await AsyncStorage.setItem(`ratings_${profileId}`, JSON.stringify(defaultRatings));
        setTotalRatings(0);
        setAverageRating(0);
        setHasRated(false);
        setUserRating(0);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      setHasRated(false);
      setUserRating(0);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setBookingDetails(prev => ({
          ...prev,
          userName: user.name || '',
          userEmail: user.email || '',
          phoneNumber: user.phone || ''
        }));
        // Load ratings after user is loaded
        await loadRatings(user);
      } else {
        // No user logged in
        setCurrentUser(null);
        await loadRatings(null);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      await loadRatings(null);
    }
  };

  const handleRate = async (rating) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to rate this tour guide.');
      return;
    }

    if (hasRated) {
      Alert.alert('Already Rated', 'You have already rated this tour guide.');
      return;
    }

    try {
      const profileId = params.profileId;
      const savedRatings = await AsyncStorage.getItem(`ratings_${profileId}`);
      let ratingsData = savedRatings ? JSON.parse(savedRatings) : { total: 0, average: 0, users: [] };
      
      // Add new rating
      ratingsData.users.push({
        userId: currentUser.id,
        userName: currentUser.name || 'Anonymous',
        rating: rating,
        date: new Date().toISOString()
      });
      
      // Calculate new average
      const total = ratingsData.users.length;
      const sum = ratingsData.users.reduce((acc, u) => acc + u.rating, 0);
      ratingsData.total = total;
      ratingsData.average = parseFloat((sum / total).toFixed(1));
      
      await AsyncStorage.setItem(`ratings_${profileId}`, JSON.stringify(ratingsData));
      
      setTotalRatings(total);
      setAverageRating(ratingsData.average);
      setHasRated(true);
      setUserRating(rating);
      
      Alert.alert('Thank You!', `You rated ${rating} stars. Your feedback helps others!`);
    } catch (error) {
      console.error('Error saving rating:', error);
      Alert.alert('Error', 'Failed to save your rating. Please try again.');
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profileId = params.profileId;

      if (!profileId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const savedProfiles = await AsyncStorage.getItem('tourGuideProfiles');
      if (savedProfiles) {
        const profilesList = JSON.parse(savedProfiles);
        const foundProfile = profilesList.find(p => p.id == profileId || p.userId == profileId);

        if (foundProfile) {
          setProfile(normalizeTourGuideProfile(foundProfile));
          return;
        }
      }

      const { data, error } = await supabase
        .from('tour_guides')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error) {
        console.error('Supabase error loading profile:', error);
        setProfile(null);
      } else if (data) {
        setProfile(normalizeTourGuideProfile(data));
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!profile) return;
    setBookingModalVisible(true);
  };

  const sendBookingEmail = async () => {
    if (!bookingDetails.userName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!bookingDetails.userEmail.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!bookingDetails.tourDate.trim()) {
      Alert.alert('Error', 'Please enter your preferred tour date');
      return;
    }
    if (!profile.email) {
      Alert.alert('Error', 'Tour guide email not available');
      return;
    }

    setSendingBooking(true);

    try {
      const subject = `New Tour Booking Request - ${profile.name}`;
      
      const body = `
Dear ${profile.name},

You have received a new tour booking request from ${bookingDetails.userName}.

📋 BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Tourist Name: ${bookingDetails.userName}
📧 Tourist Email: ${bookingDetails.userEmail}
📱 Phone Number: ${bookingDetails.phoneNumber || 'Not provided'}
📅 Tour Date: ${bookingDetails.tourDate}
👥 Group Size: ${bookingDetails.groupSize} person(s)
💬 Special Requests: ${bookingDetails.specialRequests || 'None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please contact the tourist at your earliest convenience to confirm the booking details.

Thank you for being a part of Tripzy!

Best regards,
Tripzy Team
      `.trim();

      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(body);
      const mailtoUrl = `mailto:${profile.email}?subject=${encodedSubject}&body=${encodedBody}`;
      
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        
        const bookingRecord = {
          id: Date.now(),
          guideId: profile.id,
          guideName: profile.name,
          touristName: bookingDetails.userName,
          touristEmail: bookingDetails.userEmail,
          tourDate: bookingDetails.tourDate,
          groupSize: bookingDetails.groupSize,
          specialRequests: bookingDetails.specialRequests,
          phoneNumber: bookingDetails.phoneNumber,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        const existingBookings = await AsyncStorage.getItem('userBookings');
        let bookingsList = existingBookings ? JSON.parse(existingBookings) : [];
        bookingsList.push(bookingRecord);
        await AsyncStorage.setItem('userBookings', JSON.stringify(bookingsList));
        
        Alert.alert(
          'Booking Request Sent!',
          `Your booking request has been sent to ${profile.name}. They will contact you soon via email or phone.`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                setBookingModalVisible(false);
                resetBookingForm();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Email Client Not Found',
          'Please configure an email app on your device to send booking requests.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', 'Failed to send booking request. Please try again.');
    } finally {
      setSendingBooking(false);
    }
  };

  const handleWhatsAppMessage = () => {
    if (!profile) return;
    
    if (!profile.whatsapp) {
      Alert.alert(
        'WhatsApp Number Not Available',
        'This tour guide has not provided a WhatsApp number yet.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    let phoneNumber = profile.whatsapp.replace(/\s/g, '');
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }
    
    const message = `Hello ${profile.name || 'Tour Guide'}! 👋\n\nI'm interested in booking a tour with you through Tripzy. Could you please share more details about your availability and services?\n\nThank you!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
    const webWhatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then(canOpen => {
        if (canOpen) {
          return Linking.openURL(whatsappUrl);
        } else {
          return Linking.openURL(webWhatsappUrl);
        }
      })
      .catch(error => {
        console.error('Error opening WhatsApp:', error);
        Alert.alert(
          'WhatsApp Not Installed',
          'Please install WhatsApp to message this tour guide, or use the booking button to send an email.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Send Email Instead', 
              onPress: () => handleBookNow()
            }
          ]
        );
      });
  };

  const resetBookingForm = () => {
    setBookingDetails({
      userName: currentUser?.name || '',
      userEmail: currentUser?.email || '',
      tourDate: '',
      groupSize: '1',
      specialRequests: '',
      phoneNumber: currentUser?.phone || ''
    });
  };

  const RatingStars = ({ rating, onRate, size = 28, interactive = false }) => {
    const stars = [1, 2, 3, 4, 5];
    
    return (
      <View style={styles.starsContainer}>
        {stars.map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onRate(star)}
            disabled={!interactive}
            activeOpacity={0.7}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color="#FFD700"
              style={interactive && styles.interactiveStar}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
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
        <Text style={styles.headerTitle}>Tour Guide</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover Image with Profile Overlay */}
        <View style={styles.coverContainer}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Ionicons name="camera-outline" size={60} color="rgba(255,255,255,0.3)" />
            </View>
          )}
          <View style={styles.coverOverlay} />
          
          <View style={styles.profileImageWrapper}>
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

          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.verifiedText}>Verified Guide</Text>
          </View>

          <View style={styles.coverInfo}>
            <Text style={styles.coverName}>{profile.name || 'Name not provided'}</Text>
            <View style={styles.coverLocation}>
              <Ionicons name="location-outline" size={16} color="#fff" />
              <Text style={styles.coverLocationText}>{profile.location || 'Location not specified'}</Text>
            </View>
          </View>
        </View>

        {/* Stats Row with Rating */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.statValue}>{averageRating}</Text>
            <Text style={styles.statLabel}>{totalRatings} ratings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="language-outline" size={20} color="#007AFF" />
            <Text style={styles.statValue}>{profile.languages?.length || 0}</Text>
            <Text style={styles.statLabel}>Languages</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="ribbon-outline" size={20} color="#007AFF" />
            <Text style={styles.statValue}>{profile.specialties?.length || 0}</Text>
            <Text style={styles.statLabel}>Specialties</Text>
          </View>
        </View>

        {/* Rate This Guide Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate This Guide</Text>
          <RatingStars 
            rating={hasRated ? userRating : 0} 
            onRate={handleRate} 
            size={32}
            interactive={!hasRated}
          />
          {hasRated ? (
            <Text style={styles.ratingMessage}>You rated {userRating} stars. Thank you!</Text>
          ) : (
            <Text style={styles.ratingMessage}>Tap a star to rate this guide</Text>
          )}
          <View style={styles.ratingStats}>
            <Text style={styles.ratingStatsText}>
              ⭐ {averageRating} out of 5 · {totalRatings} ratings
            </Text>
          </View>
        </View>

        {/* About Section */}
        {profile.bio && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.descriptionText}>{profile.bio}</Text>
          </View>
        )}

        {/* Price & Availability */}
        <View style={styles.priceRow}>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Price per day</Text>
            <Text style={styles.priceValue}>{profile.price || '$50'}</Text>
          </View>
          <View style={styles.availabilityCard}>
            <Text style={styles.availabilityLabel}>Availability</Text>
            <View style={styles.availabilityStatus}>
              <View style={styles.availabilityDot} />
              <Text style={styles.availabilityValue}>{profile.availability || 'Available'}</Text>
            </View>
          </View>
        </View>

        {/* Languages */}
        {Array.isArray(profile.languages) && profile.languages.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Languages Spoken</Text>
            <View style={styles.languagesList}>
              {profile.languages.map((lang, index) => (
                <View key={index} style={styles.languageTag}>
                  <Text style={styles.languageTagText}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Specialties */}
        {Array.isArray(profile.specialties) && profile.specialties.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.tagsList}>
              {profile.specialties.map((tag, index) => (
                <View key={index} style={styles.tagItem}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.tagItemText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experience */}
        {profile.experience && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <Text style={styles.experienceText}>{profile.experience}</Text>
          </View>
        )}

        {/* Notes */}
        {Array.isArray(profile.notes) && profile.notes.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Special Notes</Text>
            {profile.notes.map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton} onPress={handleWhatsAppMessage}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bookingModalVisible}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book a Tour</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalContent}>
                <View style={styles.modalGuideInfo}>
                  <Text style={styles.modalGuideName}>{profile.name}</Text>
                  <Text style={styles.modalGuideLocation}>{profile.location}</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Your Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={bookingDetails.userName}
                    onChangeText={(text) => setBookingDetails({...bookingDetails, userName: text})}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Your Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={bookingDetails.userEmail}
                    onChangeText={(text) => setBookingDetails({...bookingDetails, userEmail: text})}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    value={bookingDetails.phoneNumber}
                    onChangeText={(text) => setBookingDetails({...bookingDetails, phoneNumber: text})}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Preferred Tour Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Dec 25, 2024"
                    value={bookingDetails.tourDate}
                    onChangeText={(text) => setBookingDetails({...bookingDetails, tourDate: text})}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Group Size *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Number of people"
                    keyboardType="numeric"
                    value={bookingDetails.groupSize}
                    onChangeText={(text) => setBookingDetails({...bookingDetails, groupSize: text})}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Special Requests</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any special requirements or questions..."
                    multiline
                    numberOfLines={3}
                    value={bookingDetails.specialRequests}
                    onChangeText={(text) => setBookingDetails({...bookingDetails, specialRequests: text})}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.sendButton, sendingBooking && styles.sendButtonDisabled]}
                  onPress={sendBookingEmail}
                  disabled={sendingBooking}
                >
                  {sendingBooking ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send" size={20} color="#fff" />
                      <Text style={styles.sendButtonText}>Send Booking Request</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 12,
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
  // Cover Section
  coverContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: '#1a1a2e',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: '#2d2d44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
  profileImageWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#f0f0f0',
  },
  profileImagePlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  coverInfo: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
  },
  coverName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  coverLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverLocationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  // Rating Section
  ratingSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  interactiveStar: {
    padding: 4,
  },
  ratingMessage: {
    fontSize: 13,
    color: '#888',
    marginTop: 10,
  },
  ratingStats: {
    marginTop: 8,
  },
  ratingStatsText: {
    fontSize: 12,
    color: '#999',
  },
  // Section Cards
  sectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  // Price Row
  priceRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  priceCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  priceLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  availabilityCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  availabilityLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  availabilityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  availabilityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  // Languages
  languagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageTag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  languageTagText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  // Tags
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    gap: 4,
  },
  tagItemText: {
    fontSize: 13,
    color: '#555',
  },
  experienceText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  // Notes
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 12,
    marginBottom: 10,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 2,
    borderColor: '#25D366',
  },
  messageButtonText: {
    color: '#25D366',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  modalGuideInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalGuideName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalGuideLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TourGuideCard;