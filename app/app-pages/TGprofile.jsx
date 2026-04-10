import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
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

  useEffect(() => {
    loadCurrentUser();
    if (params.profileId) {
      loadExistingProfile(params.profileId);
    }
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
      // Create profile data object - store image URI directly in database
      const profileData = {
        user_id: currentUser.id,
        user_email: currentUser.email,
        user_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
        full_name: fullName,
        image: selectedImage, // Store local image URI
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
        // Update existing profile
        result = await supabase
          .from('tour_guides')
          .update(profileData)
          .eq('id', existingProfileId);
      } else {
        // Create new profile
        result = await supabase
          .from('tour_guides')
          .insert([profileData]);
      }

      if (result.error) throw result.error;

      Alert.alert(
        'Success',
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tour Guide Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Tour Guide Profile</Text>
          <Text style={styles.heroSubtitle}>
            Share your experience, specialties, and passion for guiding travelers.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Upload Your Image</Text>
          <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={40} color="#007AFF" />
                <Text style={styles.uploadText}>Tap to upload image</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter province"
            placeholderTextColor="#999"
            value={province}
            onChangeText={setProvince}
          />

          <Text style={styles.label}>Experience</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 5 years"
            placeholderTextColor="#999"
            value={experience}
            onChangeText={setExperience}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Supportive Language</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., English, Sinhala, Tamil"
            placeholderTextColor="#999"
            value={languages}
            onChangeText={setLanguages}
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, isTourGuide && styles.checkboxChecked]}
              onPress={() => setIsTourGuide(!isTourGuide)}
            >
              {isTourGuide && <Ionicons name="checkmark" size={16} color="#fff" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>As a tour guide ?</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Travel Mode Tags</Text>
          <Text style={styles.subLabel}>Please One by one enter</Text>
          
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder="Enter tag"
              placeholderTextColor="#999"
              value={currentTag}
              onChangeText={setCurrentTag}
            />
            <TouchableOpacity style={styles.addButton} onPress={addTravelModeTag}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.tagsContainer}>
            {travelModeTags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTravelModeTag(index)}>
                  <Ionicons name="close-circle" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Special Notes</Text>
          <Text style={styles.subLabel}>Entire Special note one by one enter.</Text>
          
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder="Enter special note"
              placeholderTextColor="#999"
              value={currentNote}
              onChangeText={setCurrentNote}
            />
            <TouchableOpacity style={styles.addButton} onPress={addSpecialNote}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.notesContainer}>
            {specialNotes.map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <Text style={styles.noteText}>• {note}</Text>
                <TouchableOpacity onPress={() => removeSpecialNote(index)}>
                  <Ionicons name="close-circle" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.updateButton, loading && styles.updateButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.updateButtonText}>
            {loading ? 'Saving...' : (isEditing ? 'Update Profile' : 'Create Profile')}
          </Text>
        </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
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
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginTop: 16,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    marginBottom: 20,
    minHeight: 150,
  },
  uploadText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 10,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
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
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#000',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  updateButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TourGuideProfilePage;