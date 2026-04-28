import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

const TourGuideProfilePage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [fullName, setFullName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [province, setProvince] = useState('');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [languages, setLanguages] = useState('');
  const [isTourGuide, setIsTourGuide] = useState(false);
  const [travelModeTags, setTravelModeTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [specialNotes, setSpecialNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    loadCurrentUser();
    if (params.profileId) {
      loadExistingProfile(params.profileId);
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        checkExistingProfile(user.id);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const checkExistingProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('tour_guides')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setIsEditing(true);
        setExistingProfileId(data.id);
        setFullName(data.full_name || '');
        setSelectedImage(data.image);
        setProvince(data.province || '');
        setExperience(data.experience || '');
        setDescription(data.description || '');
        setLanguages(data.languages || '');
        setIsTourGuide(data.is_tour_guide || false);
        setTravelModeTags(data.travel_mode_tags || []);
        setSpecialNotes(data.special_notes || []);
      }
    } catch (error) {
      console.error('Error checking existing profile:', error);
    }
  };

  const loadExistingProfile = async (profileId) => {
    try {
      const { data, error } = await supabase
        .from('tour_guides')
        .select('*')
        .eq('id', profileId)
        .single();

      if (data && !error) {
        setFullName(data.full_name || '');
        setSelectedImage(data.image);
        setProvince(data.province || '');
        setExperience(data.experience || '');
        setDescription(data.description || '');
        setLanguages(data.languages || '');
        setIsTourGuide(data.is_tour_guide || false);
        setTravelModeTags(data.travel_mode_tags || []);
        setSpecialNotes(data.special_notes || []);
        setIsEditing(true);
        setExistingProfileId(data.id);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photos to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const addTravelModeTag = () => {
    if (currentTag.trim()) {
      setTravelModeTags([...travelModeTags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTravelModeTag = (index) => {
    const newTags = [...travelModeTags];
    newTags.splice(index, 1);
    setTravelModeTags(newTags);
  };

  const addSpecialNote = () => {
    if (currentNote.trim()) {
      setSpecialNotes([...specialNotes, currentNote.trim()]);
      setCurrentNote('');
    }
  };

  const removeSpecialNote = (index) => {
    const newNotes = [...specialNotes];
    newNotes.splice(index, 1);
    setSpecialNotes(newNotes);
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        user_id: currentUser.id,
        user_email: currentUser.email,
        user_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
        full_name: fullName,
        image: selectedImage,
        province: province || null,
        experience: experience || null,
        description: description || null,
        languages: languages || null,
        is_tour_guide: isTourGuide,
        travel_mode_tags: travelModeTags,
        special_notes: specialNotes,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (isEditing && existingProfileId) {
        result = await supabase
          .from('tour_guides')
          .update(profileData)
          .eq('id', existingProfileId);
      } else {
        result = await supabase
          .from('tour_guides')
          .insert([profileData]);
      }

      if (result.error) throw result.error;

      Alert.alert(
        'Success! 🎉',
        isEditing ? 'Your profile has been updated!' : 'Your profile has been created!',
        [
          {
            text: 'View All Guides',
            onPress: () => router.push('/app-pages/TourGuideList')
          }
        ]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title, icon, children) => (
    <Animated.View 
      style={[
        styles.sectionCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color="#007AFF" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tour Guide Profile</Text>
        <View style={{ width: 40 }}>
          {isEditing && (
            <View style={styles.editBadge}>
              <Ionicons name="create-outline" size={16} color="#fff" />
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Hero Section without Icon */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Create Your Guide Profile</Text>
          <Text style={styles.heroSubtitle}>
            Share your expertise and help travelers discover amazing experiences
          </Text>
        </View>

        {/* Profile Image Section - Square Border Design */}
        {renderSection('Profile Photo', 'camera-outline', 
          <TouchableOpacity style={styles.imageUploadContainer} onPress={pickImage}>
            {selectedImage ? (
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri: selectedImage }} style={styles.profileImage} />
                <View style={styles.imageOverlay}>
                  <Ionicons name="camera" size={28} color="#fff" />
                  <Text style={styles.imageOverlayText}>Change Photo</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.placeholderIconContainer}>
                  <Ionicons name="camera-outline" size={50} color="#007AFF" />
                </View>
                <Text style={styles.imagePlaceholderText}>Upload Profile Photo</Text>
                <Text style={styles.imagePlaceholderSubtext}>Tap to select an image</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

          <Text style={styles.buttomSubtitle}>
            🔖 Share a little about yourself – your name, location, and experience will help travelers connect with you.
          </Text>

        {/* Personal Information */}
        {renderSection('Personal Information', 'person-outline',
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#007AFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={20} color="#007AFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your province/city"
                  placeholderTextColor="#999"
                  value={province}
                  onChangeText={setProvince}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Years of Experience</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="star-outline" size={20} color="#007AFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 5 years"
                  placeholderTextColor="#999"
                  value={experience}
                  onChangeText={setExperience}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Languages Spoken</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="language-outline" size={20} color="#007AFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., English, Sinhala, Tamil"
                  placeholderTextColor="#999"
                  value={languages}
                  onChangeText={setLanguages}
                />
              </View>
            </View>
          </>
        )}

        <Text style={styles.buttomSubtitle}>
            🔖 Tell travelers your story – share your passion for guiding and what makes your tours unique.
          </Text>

        {/* Description */}
        {renderSection('About Me', 'document-text-outline',
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio / Description</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell travelers about yourself, your experience, and what makes you special..."
                  placeholderTextColor="#999"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </>
        )}

        <Text style={styles.buttomSubtitle}>
            🔖 TAdd your travel specialties and special notes one at a time. Travelers love knowing what makes your tours special!
          </Text>

        {/* Travel Mode Tags */}
        {renderSection('Travel Specialties', 'bicycle-outline',
          <>
            <View style={styles.tagInputWrapper}>
              <TextInput
                style={styles.tagInput}
                placeholder="Enter travel specialty (e.g., Hiking, Cultural Tours)"
                placeholderTextColor="#999"
                value={currentTag}
                onChangeText={setCurrentTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addTravelModeTag}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {travelModeTags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTravelModeTag(index)}>
                    <Ionicons name="close-circle" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
              {travelModeTags.length === 0 && (
                <Text style={styles.emptyText}>No specialties added yet</Text>
              )}
            </View>
          </>
        )}

        {/* Special Notes */}
        {renderSection('Special Notes', 'bulb-outline',
          <>
            <View style={styles.tagInputWrapper}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add special note (e.g., Flexible schedule, Custom tours)"
                placeholderTextColor="#999"
                value={currentNote}
                onChangeText={setCurrentNote}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addSpecialNote}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.notesContainer}>
              {specialNotes.map((note, index) => (
                <View key={index} style={styles.noteItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.noteText}>{note}</Text>
                  <TouchableOpacity onPress={() => removeSpecialNote(index)}>
                    <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
              {specialNotes.length === 0 && (
                <Text style={styles.emptyText}>No special notes added yet</Text>
              )}
            </View>
          </>
        )}

        {/* Tour Guide Status */}
        {renderSection('Status', 'checkbox-outline',
          <TouchableOpacity 
            style={styles.toggleContainer} 
            onPress={() => setIsTourGuide(!isTourGuide)}
          >
            <View style={styles.toggleInfo}>
              <Ionicons 
                name={isTourGuide ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={isTourGuide ? "#4CAF50" : "#999"} 
              />
              <Text style={styles.toggleText}>
                {isTourGuide ? "Active Tour Guide" : "Register as Tour Guide"}
              </Text>
            </View>
            <View style={[styles.toggleSwitch, isTourGuide && styles.toggleSwitchActive]}>
              <View style={[styles.toggleKnob, isTourGuide && styles.toggleKnobActive]} />
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.buttomSubtitle}>
            🔖 Your profile is your gateway to connecting with travelers from around the world. Submit your information and begin sharing unforgettable experiences.
          </Text>

        {/* Submit Button */}
        <Animated.View 
          style={[
            styles.submitButtonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Ionicons 
              name={loading ? "reload" : (isEditing ? "create-outline" : "checkmark-circle-outline")} 
              size={24} 
              color="#fff" 
              style={styles.submitIcon}
            />
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : (isEditing ? 'Update Profile' : 'Create Profile')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 40,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  editBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttomSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    fontStyle: 'italic',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  sectionContent: {
    padding: 20,
  },
  imageUploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: 335,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#606a76',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  imagePlaceholder: {
    width: 280,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  placeholderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 8,
    textAlign: 'center',
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  inputIcon: {
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 13,
    color: '#333',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  tagInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 12,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 10,
  },
  addTagButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F1FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 6,
  },
  notesContainer: {
    marginTop: 10,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#4CAF50',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  submitButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 65,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  submitIcon: {
    marginRight: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TourGuideProfilePage;