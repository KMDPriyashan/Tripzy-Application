import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const feedFeeling = () => {
  const router = useRouter();
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [feelingText, setFeelingText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [travelStories, setTravelStories] = useState([]);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyData, setStoryData] = useState({
    feeling: null,
    title: '',
    description: '',
    location: '',
    hashtags: []
  });
  const [selectedHashtag, setSelectedHashtag] = useState('');

  // Travel-related hashtags
  const travelHashtags = [
    '#TravelDiaries', '#Wanderlust', '#AdventureTime', '#ExploreMore',
    '#TravelGram', '#VacationMode', '#RoadTrip', '#NatureLover',
    '#SunsetChaser', '#MountainViews', '#BeachLife', '#CityExplorer',
    '#CulturalTrip', '#FoodieTravel', '#Backpacking', '#SoloTravel'
  ];

  // Feelings list with travel context
  const feelings = [
    { id: 1, emoji: "😊", name: "Peaceful", color: "#FFD700", bgColor: "#FFF9C4", travelContext: "Enjoying a calm moment at a scenic view" },
    { id: 2, emoji: "😂", name: "Amused", color: "#FF6B6B", bgColor: "#FFE0E0", travelContext: "Having fun with local experiences" },
    { id: 3, emoji: "😍", name: "Awestruck", color: "#FF1493", bgColor: "#FFE0F0", travelContext: "Amazed by breathtaking destinations" },
    { id: 4, emoji: "😢", name: "Bittersweet", color: "#4A90E2", bgColor: "#E0F0FF", travelContext: "Leaving a beautiful place behind" },
    { id: 5, emoji: "😎", name: "Adventurous", color: "#00CED1", bgColor: "#E0FFFF", travelContext: "Ready to explore new horizons" },
    { id: 6, emoji: "🤔", name: "Reflective", color: "#9370DB", bgColor: "#EDE0FF", travelContext: "Contemplating life while traveling" },
    { id: 7, emoji: "🎉", name: "Celebratory", color: "#FF4500", bgColor: "#FFE0D0", travelContext: "Partying and enjoying local festivals" },
    { id: 8, emoji: "✈️", name: "Jet-setting", color: "#1E90FF", bgColor: "#E0F0FF", travelContext: "Moving from one amazing place to another" },
    { id: 9, emoji: "🏔️", name: "Conquering", color: "#228B22", bgColor: "#E0FFE0", travelContext: "Reaching new heights and peaks" },
    { id: 10, emoji: "🍕", name: "Food-obsessed", color: "#FF8C00", bgColor: "#FFE8D0", travelContext: "Discovering local cuisines" },
    { id: 11, emoji: "📚", name: "Learning", color: "#8B4513", bgColor: "#F0E0D0", travelContext: "Immersing in local culture and history" },
    { id: 12, emoji: "💪", name: "Empowered", color: "#DC143C", bgColor: "#FFE0E8", travelContext: "Overcoming travel challenges" },
    { id: 13, emoji: "😴", name: "Restful", color: "#808080", bgColor: "#F0F0F0", travelContext: "Relaxing after a long journey" },
    { id: 14, emoji: "🤗", name: "Welcomed", color: "#FF69B4", bgColor: "#FFE8F0", travelContext: "Embracing local hospitality" },
    { id: 15, emoji: "🔥", name: "Thrilled", color: "#FF4500", bgColor: "#FFE0D0", travelContext: "Experiencing thrilling adventures" },
    { id: 16, emoji: "💡", name: "Enlightened", color: "#FFD700", bgColor: "#FFF9C4", travelContext: "Gaining new perspectives through travel" },
  ];

  // Popular travel destinations for quick selection
  const popularDestinations = [
    "Paris, France", "Tokyo, Japan", "New York, USA", "Bali, Indonesia",
    "London, UK", "Rome, Italy", "Sydney, Australia", "Cape Town, South Africa",
    "Barcelona, Spain", "Dubai, UAE", "Bangkok, Thailand", "Istanbul, Turkey"
  ];

  useEffect(() => {
    loadUserData();
    loadTravelStories();
  }, []);

  const loadUserData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTravelStories = async () => {
    try {
      const saved = await AsyncStorage.getItem('travelStories');
      if (saved) {
        setTravelStories(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading travel stories:', error);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const addHashtag = () => {
    if (selectedHashtag && !storyData.hashtags.includes(selectedHashtag)) {
      setStoryData({
        ...storyData,
        hashtags: [...storyData.hashtags, selectedHashtag]
      });
      setSelectedHashtag('');
    }
  };

  const removeHashtag = (hashtag) => {
    setStoryData({
      ...storyData,
      hashtags: storyData.hashtags.filter(h => h !== hashtag)
    });
  };

  const saveTravelStory = async () => {
    if (!storyData.feeling) {
      Alert.alert('Error', 'Please select how you feel');
      return;
    }
    if (!storyData.title.trim()) {
      Alert.alert('Error', 'Please add a title for your story');
      return;
    }
    if (!storyData.description.trim()) {
      Alert.alert('Error', 'Please share your travel experience');
      return;
    }

    try {
      const now = new Date();
      const newStory = {
        id: Date.now(),
        feeling: storyData.feeling,
        title: storyData.title.trim(),
        description: storyData.description.trim(),
        location: storyData.location || 'Unknown location',
        hashtags: storyData.hashtags,
        user: currentUser,
        timestamp: now.toISOString(),
        formattedDate: formatDate(now),
        likes: 0,
        comments: 0
      };

      const updatedStories = [newStory, ...travelStories];
      setTravelStories(updatedStories);
      await AsyncStorage.setItem('travelStories', JSON.stringify(updatedStories));
      
      Alert.alert('Success', 'Your travel story has been shared!');
      setShowStoryModal(false);
      setStoryData({
        feeling: null,
        title: '',
        description: '',
        location: '',
        hashtags: []
      });
      setSelectedHashtag('');
    } catch (error) {
      console.log('Error saving travel story:', error);
      Alert.alert('Error', 'Failed to save travel story');
    }
  };

  const shareFeeling = async () => {
    if (!selectedFeeling) {
      Alert.alert('Error', 'Please select a feeling');
      return;
    }

    setIsSharing(true);

    try {
      const existingPosts = await AsyncStorage.getItem('userPosts');
      let allPosts = existingPosts ? JSON.parse(existingPosts) : [];
      
      const existingFeed = await AsyncStorage.getItem('feedPosts');
      let feedPosts = existingFeed ? JSON.parse(existingFeed) : [];

      const newPost = {
        id: Date.now(),
        userId: 'current',
        name: currentUser?.name || "User",
        username: currentUser?.username || "user",
        avatar: currentUser?.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
        location: currentUser?.location || "Unknown",
        time: "Just now",
        image: null,
        caption: feelingText ? `${selectedFeeling.emoji} ${feelingText}` : `${selectedFeeling.emoji} is feeling ${selectedFeeling.name} while traveling`,
        likes: 0,
        comments: 0,
        shares: 0,
        type: 'feeling',
        feeling: selectedFeeling
      };
      
      allPosts = [newPost, ...allPosts];
      await AsyncStorage.setItem('userPosts', JSON.stringify(allPosts));
      
      feedPosts = [newPost, ...feedPosts];
      await AsyncStorage.setItem('feedPosts', JSON.stringify(feedPosts));
      
      Alert.alert('Success', 'Your feeling has been shared!');
      router.back();
    } catch (error) {
      console.log('Error sharing feeling:', error);
      Alert.alert('Error', 'Failed to share feeling');
    } finally {
      setIsSharing(false);
    }
  };

  const likeStory = async (storyId) => {
    const updatedStories = travelStories.map(story => {
      if (story.id === storyId) {
        return { ...story, likes: story.likes + 1 };
      }
      return story;
    });
    setTravelStories(updatedStories);
    await AsyncStorage.setItem('travelStories', JSON.stringify(updatedStories));
  };

  const renderFeelingItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.feelingCard, { backgroundColor: item.bgColor }]}
      onPress={() => {
        setSelectedFeeling(item);
        setFeelingText('');
      }}
    >
      <Text style={styles.feelingEmoji}>{item.emoji}</Text>
      <Text style={styles.feelingName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTravelStory = ({ item }) => (
    <View style={styles.travelStoryCard}>
      <View style={styles.travelStoryHeader}>
        <Image source={{ uri: item.user?.avatar }} style={styles.travelStoryAvatar} />
        <View style={styles.travelStoryInfo}>
          <Text style={styles.travelStoryName}>{item.user?.name}</Text>
          <Text style={styles.travelStoryUsername}>@{item.user?.username}</Text>
          <Text style={styles.travelStoryTime}>{item.formattedDate}</Text>
        </View>
        <View style={[styles.travelStoryFeelingBadge, { backgroundColor: item.feeling.bgColor }]}>
          <Text style={styles.travelStoryFeelingEmoji}>{item.feeling.emoji}</Text>
          <Text style={styles.travelStoryFeelingName}>{item.feeling.name}</Text>
        </View>
      </View>

      <View style={styles.travelStoryContent}>
        <Text style={styles.travelStoryTitle}>{item.title}</Text>
        {item.location && (
          <View style={styles.travelStoryLocation}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}
        <Text style={styles.travelStoryDescription}>{item.description}</Text>
        {item.hashtags.length > 0 && (
          <View style={styles.travelStoryHashtags}>
            {item.hashtags.map((tag, index) => (
              <Text key={index} style={styles.hashtag}>{tag}</Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.travelStoryActions}>
        <TouchableOpacity 
          style={styles.travelStoryAction}
          onPress={() => likeStory(item.id)}
        >
          <Text style={styles.actionEmoji}>❤️</Text>
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.travelStoryAction}>
          <Text style={styles.actionEmoji}>💬</Text>
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.travelStoryAction}>
          <Text style={styles.actionEmoji}>↗️</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877f2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Travel Feelings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Main Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Selected Feeling Section */}
        {selectedFeeling && (
          <View style={[styles.selectedFeelingSection, { backgroundColor: selectedFeeling.bgColor }]}>
            <Text style={styles.selectedFeelingEmoji}>{selectedFeeling.emoji}</Text>
            <Text style={styles.selectedFeelingName}>Feeling {selectedFeeling.name}</Text>
            <Text style={styles.travelContextText}>{selectedFeeling.travelContext}</Text>
            <TextInput
              style={styles.feelingInput}
              placeholder={`Share your ${selectedFeeling.name} travel moment...`}
              placeholderTextColor="#999"
              multiline
              value={feelingText}
              onChangeText={setFeelingText}
            />
            <TouchableOpacity 
              style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
              onPress={shareFeeling}
              disabled={isSharing}
            >
              <Text style={styles.shareButtonText}>
                {isSharing ? 'Sharing...' : 'Share to Feed'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSelectedFeeling(null)}
            >
              <Text style={styles.clearButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Feelings Grid */}
        {!selectedFeeling && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>How does travel make you feel?</Text>
              <Text style={styles.sectionSubtitle}>Choose your travel mood</Text>
            </View>
            <FlatList
              data={feelings}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderFeelingItem}
              numColumns={4}
              scrollEnabled={false}
              contentContainerStyle={styles.feelingsGrid}
            />
          </>
        )}

        {/* Travel Stories Section - New Feature */}
        <View style={styles.travelStoriesSection}>
          <View style={styles.storiesHeader}>
            <View>
              <Text style={styles.storiesTitle}>Travel Stories</Text>
              <Text style={styles.storiesSubtitle}>Share your journey</Text>
            </View>
            <TouchableOpacity 
              style={styles.addStoryButton}
              onPress={() => setShowStoryModal(true)}
            >
              <Text style={styles.addStoryText}>+ Create Story</Text>
            </TouchableOpacity>
          </View>
          
          {travelStories.length > 0 ? (
            <FlatList
              data={travelStories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderTravelStory}
              scrollEnabled={false}
              contentContainerStyle={styles.travelStoriesList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>✈️</Text>
              <Text style={styles.emptyStateTitle}>No travel stories yet</Text>
              <Text style={styles.emptyStateText}>Share your first travel experience!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Travel Story Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showStoryModal}
        onRequestClose={() => setShowStoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Travel Story</Text>
              <TouchableOpacity onPress={() => setShowStoryModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>How do you feel?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storyFeelingsScroll}>
                {feelings.map((feeling) => (
                  <TouchableOpacity
                    key={feeling.id}
                    style={[
                      styles.storyFeelingItem,
                      storyData.feeling?.id === feeling.id && styles.storyFeelingSelected,
                      { backgroundColor: feeling.bgColor }
                    ]}
                    onPress={() => setStoryData({...storyData, feeling: feeling})}
                  >
                    <Text style={styles.storyFeelingEmoji}>{feeling.emoji}</Text>
                    <Text style={styles.storyFeelingName}>{feeling.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.modalLabel}>Story Title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Give your travel story a title..."
                placeholderTextColor="#999"
                value={storyData.title}
                onChangeText={(text) => setStoryData({...storyData, title: text})}
              />

              <Text style={styles.modalLabel}>Location (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destinationsScroll}>
                {popularDestinations.map((destination, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.destinationChip, storyData.location === destination && styles.destinationChipSelected]}
                    onPress={() => setStoryData({...storyData, location: destination})}
                  >
                    <Text style={[styles.destinationChipText, storyData.location === destination && styles.destinationChipTextSelected]}>
                      {destination}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput
                style={styles.modalInput}
                placeholder="Or enter custom location..."
                placeholderTextColor="#999"
                value={storyData.location}
                onChangeText={(text) => setStoryData({...storyData, location: text})}
              />

              <Text style={styles.modalLabel}>Your Story</Text>
              <TextInput
                style={[styles.modalInput, styles.storyTextArea]}
                placeholder="Share your travel experience..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={5}
                value={storyData.description}
                onChangeText={(text) => setStoryData({...storyData, description: text})}
              />

              <Text style={styles.modalLabel}>Add Hashtags</Text>
              <View style={styles.hashtagInputContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hashtagsScroll}>
                  {travelHashtags.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.hashtagChip, storyData.hashtags.includes(tag) && styles.hashtagChipSelected]}
                      onPress={() => {
                        if (storyData.hashtags.includes(tag)) {
                          removeHashtag(tag);
                        } else {
                          setStoryData({...storyData, hashtags: [...storyData.hashtags, tag]});
                        }
                      }}
                    >
                      <Text style={[styles.hashtagChipText, storyData.hashtags.includes(tag) && styles.hashtagChipTextSelected]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {storyData.hashtags.length > 0 && (
                <View style={styles.selectedHashtagsContainer}>
                  {storyData.hashtags.map((tag, index) => (
                    <TouchableOpacity key={index} style={styles.selectedHashtag} onPress={() => removeHashtag(tag)}>
                      <Text style={styles.selectedHashtagText}>{tag}</Text>
                      <Text style={styles.removeHashtag}>✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity 
                style={[styles.saveStoryButton, (!storyData.title.trim() || !storyData.description.trim() || !storyData.feeling) && styles.saveStoryButtonDisabled]}
                onPress={saveTravelStory}
                disabled={!storyData.title.trim() || !storyData.description.trim() || !storyData.feeling}
              >
                <Text style={styles.saveStoryButtonText}>Publish Story ✈️</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 28,
    color: '#1877f2',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  headerPlaceholder: {
    width: 40,
  },
  selectedFeelingSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  selectedFeelingEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  selectedFeelingName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 8,
  },
  travelContextText: {
    fontSize: 14,
    color: '#65676b',
    marginBottom: 16,
    textAlign: 'center',
  },
  feelingInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1c1e21',
    textAlignVertical: 'top',
    minHeight: 80,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonDisabled: {
    backgroundColor: '#e4e6eb',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearButtonText: {
    color: '#65676b',
    fontSize: 14,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#65676b',
  },
  feelingsGrid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  feelingCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    margin: 4,
    borderRadius: 12,
    minWidth: 80,
  },
  feelingEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  feelingName: {
    fontSize: 12,
    color: '#1c1e21',
    textAlign: 'center',
  },
  travelStoriesSection: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingVertical: 16,
  },
  storiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  storiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  storiesSubtitle: {
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
  },
  addStoryButton: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addStoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  travelStoriesList: {
    paddingHorizontal: 16,
    marginBottom: 72,
  },
  travelStoryCard: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    overflow: 'hidden',
  },
  travelStoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  travelStoryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  travelStoryInfo: {
    flex: 1,
  },
  travelStoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  travelStoryUsername: {
    fontSize: 11,
    color: '#65676b',
    marginTop: 2,
  },
  travelStoryTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  travelStoryFeelingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  travelStoryFeelingEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  travelStoryFeelingName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1c1e21',
  },
  travelStoryContent: {
    padding: 12,
  },
  travelStoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 8,
  },
  travelStoryLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#65676b',
  },
  travelStoryDescription: {
    fontSize: 14,
    color: '#1c1e21',
    lineHeight: 20,
    marginBottom: 8,
  },
  travelStoryHashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  hashtag: {
    fontSize: 12,
    color: '#1877f2',
    marginRight: 8,
    marginBottom: 4,
  },
  travelStoryActions: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  travelStoryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#65676b',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#65676b',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  modalClose: {
    fontSize: 24,
    color: '#65676b',
    padding: 4,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
    marginTop: 16,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1c1e21',
    backgroundColor: '#ffffff',
  },
  storyTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  storyFeelingsScroll: {
    marginBottom: 8,
  },
  storyFeelingItem: {
    alignItems: 'center',
    padding: 12,
    marginRight: 8,
    borderRadius: 12,
    minWidth: 70,
  },
  storyFeelingSelected: {
    borderWidth: 2,
    borderColor: '#1877f2',
  },
  storyFeelingEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  storyFeelingName: {
    fontSize: 11,
    color: '#1c1e21',
  },
  destinationsScroll: {
    marginBottom: 8,
  },
  destinationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f2f5',
    marginRight: 8,
  },
  destinationChipSelected: {
    backgroundColor: '#1877f2',
  },
  destinationChipText: {
    fontSize: 12,
    color: '#65676b',
  },
  destinationChipTextSelected: {
    color: '#ffffff',
  },
  hashtagInputContainer: {
    marginBottom: 8,
  },
  hashtagsScroll: {
    marginBottom: 8,
  },
  hashtagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f2f5',
    marginRight: 8,
  },
  hashtagChipSelected: {
    backgroundColor: '#1877f2',
  },
  hashtagChipText: {
    fontSize: 12,
    color: '#65676b',
  },
  hashtagChipTextSelected: {
    color: '#ffffff',
  },
  selectedHashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  selectedHashtag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1877f2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedHashtagText: {
    fontSize: 12,
    color: '#ffffff',
    marginRight: 4,
  },
  removeHashtag: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  saveStoryButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  saveStoryButtonDisabled: {
    backgroundColor: '#e4e6eb',
  },
  saveStoryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default feedFeeling;