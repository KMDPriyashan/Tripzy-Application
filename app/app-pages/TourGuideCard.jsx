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
  Share,
  StyleSheet,
  Text,
  TextInput,
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

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadCurrentUser();
    }, [])
  );

  const loadCurrentUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // Pre-fill booking form with user data
        setBookingDetails(prev => ({
          ...prev,
          userName: user.name || '',
          userEmail: user.email || '',
          phoneNumber: user.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

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

  // Function to handle booking email
  const handleBookNow = () => {
    if (!profile) return;
    setBookingModalVisible(true);
  };

  const sendBookingEmail = async () => {
    // Validate form
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
      // Create email subject
      const subject = `New Tour Booking Request - ${profile.name}`;
      
      // Create email body
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

      // Encode for URL
      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(body);
      
      // Create mailto link
      const mailtoUrl = `mailto:${profile.email}?subject=${encodedSubject}&body=${encodedBody}`;
      
      // Check if mail app can be opened
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        
        // Save booking to AsyncStorage for history
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
        
        // Save to booking history
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

  // Function to handle WhatsApp messaging
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
    
    // Format phone number (remove spaces, ensure proper format)
    let phoneNumber = profile.whatsapp.replace(/\s/g, '');
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }
    
    // Create WhatsApp message
    const message = `Hello ${profile.name || 'Tour Guide'}! 👋\n\nI'm interested in booking a tour with you through Tripzy. Could you please share more details about your availability and services?\n\nThank you!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
    
    // Also provide web.whatsapp.com as fallback
    const webWhatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then(canOpen => {
        if (canOpen) {
          return Linking.openURL(whatsappUrl);
        } else {
          // Fallback to web.whatsapp.com
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
          <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton} onPress={handleWhatsAppMessage}>
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
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
                <Text style={styles.guideName}>Booking with: {profile.name}</Text>
                
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
                    placeholder="e.g., Dec 25, 2024 or next week"
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
    borderColor: '#25D366',
  },
  messageButtonText: {
    color: '#25D366',
    fontSize: 14,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  guideName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
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
    borderRadius: 12,
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