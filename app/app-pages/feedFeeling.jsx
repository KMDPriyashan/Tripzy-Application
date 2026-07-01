import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FEELINGS = [
  // ─── POSITIVE FEELINGS ─────────────────────────────
  { id: "happy", name: "Happy", emoji: "😊", bgColor: "#FFF9C4", category: "Positive", gradient: ["#FFF9C4", "#FFE082"] },
  { id: "excited", name: "Excited", emoji: "🤩", bgColor: "#FFE0B2", category: "Positive", gradient: ["#FFE0B2", "#FFCC80"] },
  { id: "grateful_1", name: "Grateful", emoji: "🙏", bgColor: "#D1C4E9", category: "Positive", gradient: ["#D1C4E9", "#B39DDB"] },
  { id: "blessed_1", name: "Blessed", emoji: "✨", bgColor: "#F8BBD0", category: "Positive", gradient: ["#F8BBD0", "#F48FB1"] },
  { id: "loved", name: "Loved", emoji: "❤️", bgColor: "#FFCDD2", category: "Positive", gradient: ["#FFCDD2", "#EF9A9A"] },
  { id: "joyful", name: "Joyful", emoji: "🥰", bgColor: "#FCE4EC", category: "Positive", gradient: ["#FCE4EC", "#F8BBD0"] },
  { id: "peaceful", name: "Peaceful", emoji: "🕊️", bgColor: "#DCEDC8", category: "Positive", gradient: ["#DCEDC8", "#AED581"] },
  { id: "inspired", name: "Inspired", emoji: "💡", bgColor: "#FFF3E0", category: "Positive", gradient: ["#FFF3E0", "#FFCC80"] },
  { id: "proud", name: "Proud", emoji: "🏆", bgColor: "#FFF9C4", category: "Positive", gradient: ["#FFF9C4", "#FFD54F"] },
  { id: "hopeful", name: "Hopeful", emoji: "🌈", bgColor: "#E1F5FE", category: "Positive", gradient: ["#E1F5FE", "#81D4FA"] },
  { id: "amazed", name: "Amazed", emoji: "😮", bgColor: "#F3E5F5", category: "Positive", gradient: ["#F3E5F5", "#CE93D8"] },
  { id: "cheerful", name: "Cheerful", emoji: "☀️", bgColor: "#FFF8E1", category: "Positive", gradient: ["#FFF8E1", "#FFD54F"] },
  
  // ─── ADVENTURE FEELINGS ─────────────────────────────
  { id: "adventurous", name: "Adventurous", emoji: "🧗", bgColor: "#C8E6C9", category: "Adventure", gradient: ["#C8E6C9", "#81C784"] },
  { id: "wanderlust", name: "Wanderlust", emoji: "🌍", bgColor: "#B2DFDB", category: "Adventure", gradient: ["#B2DFDB", "#4DB6AC"] },
  { id: "energetic", name: "Energetic", emoji: "⚡", bgColor: "#FFCCBC", category: "Adventure", gradient: ["#FFCCBC", "#FF8A65"] },
  { id: "daring", name: "Daring", emoji: "🪂", bgColor: "#FFE0B2", category: "Adventure", gradient: ["#FFE0B2", "#FFB74D"] },
  { id: "free", name: "Free", emoji: "🕊️", bgColor: "#B3E5FC", category: "Adventure", gradient: ["#B3E5FC", "#4FC3F7"] },
  { id: "wild", name: "Wild", emoji: "🌿", bgColor: "#C8E6C9", category: "Adventure", gradient: ["#C8E6C9", "#66BB6A"] },
  { id: "exploring", name: "Exploring", emoji: "🗺️", bgColor: "#DCEDC8", category: "Adventure", gradient: ["#DCEDC8", "#AED581"] },
  { id: "thrilled", name: "Thrilled", emoji: "🎢", bgColor: "#F8BBD0", category: "Adventure", gradient: ["#F8BBD0", "#F06292"] },
  
  // ─── RELAXED FEELINGS ──────────────────────────────
  { id: "relaxed", name: "Relaxed", emoji: "😌", bgColor: "#B3E5FC", category: "Relaxed", gradient: ["#B3E5FC", "#4FC3F7"] },
  { id: "calm", name: "Calm", emoji: "🧘", bgColor: "#DCEDC8", category: "Relaxed", gradient: ["#DCEDC8", "#AED581"] },
  { id: "chill", name: "Chill", emoji: "😎", bgColor: "#FFF3E0", category: "Relaxed", gradient: ["#FFF3E0", "#FFCC80"] },
  { id: "serene", name: "Serene", emoji: "🏞️", bgColor: "#B2DFDB", category: "Relaxed", gradient: ["#B2DFDB", "#4DB6AC"] },
  { id: "cozy", name: "Cozy", emoji: "🛋️", bgColor: "#F5F5F5", category: "Relaxed", gradient: ["#F5F5F5", "#E0E0E0"] },
  { id: "zen", name: "Zen", emoji: "☯️", bgColor: "#E0E0E0", category: "Relaxed", gradient: ["#E0E0E0", "#BDBDBD"] },
  { id: "dreamy", name: "Dreamy", emoji: "💭", bgColor: "#E1F5FE", category: "Relaxed", gradient: ["#E1F5FE", "#81D4FA"] },
  { id: "breezy", name: "Breezy", emoji: "🍃", bgColor: "#C8E6C9", category: "Relaxed", gradient: ["#C8E6C9", "#81C784"] },
  
  // ─── NOSTALGIC FEELINGS ────────────────────────────
  { id: "nostalgic", name: "Nostalgic", emoji: "📸", bgColor: "#F5F5F5", category: "Nostalgic", gradient: ["#F5F5F5", "#E0E0E0"] },
  { id: "sentimental", name: "Sentimental", emoji: "💝", bgColor: "#FCE4EC", category: "Nostalgic", gradient: ["#FCE4EC", "#F8BBD0"] },
  { id: "reflective", name: "Reflective", emoji: "🤔", bgColor: "#F3E5F5", category: "Nostalgic", gradient: ["#F3E5F5", "#CE93D8"] },
  { id: "melancholy", name: "Melancholy", emoji: "🌧️", bgColor: "#E3F2FD", category: "Nostalgic", gradient: ["#E3F2FD", "#90CAF9"] },
  { id: "longing", name: "Longing", emoji: "🌅", bgColor: "#FFF3E0", category: "Nostalgic", gradient: ["#FFF3E0", "#FFCC80"] },
  { id: "wistful", name: "Wistful", emoji: "🍂", bgColor: "#EFEBE9", category: "Nostalgic", gradient: ["#EFEBE9", "#D7CCC8"] },
  
  // ─── FOOD & TRAVEL FEELINGS ────────────────────────
  { id: "hungry", name: "Hungry", emoji: "🍕", bgColor: "#FFF8E1", category: "Food", gradient: ["#FFF8E1", "#FFD54F"] },
  { id: "foodie", name: "Foodie", emoji: "🍜", bgColor: "#FFE0B2", category: "Food", gradient: ["#FFE0B2", "#FFB74D"] },
  { id: "satisfied", name: "Satisfied", emoji: "😋", bgColor: "#C8E6C9", category: "Food", gradient: ["#C8E6C9", "#81C784"] },
  { id: "festive", name: "Festive", emoji: "🎉", bgColor: "#F8BBD0", category: "Food", gradient: ["#F8BBD0", "#F06292"] },
  { id: "cultural", name: "Cultural", emoji: "🏛️", bgColor: "#D1C4E9", category: "Travel", gradient: ["#D1C4E9", "#B39DDB"] },
  { id: "sunny", name: "Sunny", emoji: "🌞", bgColor: "#FFF9C4", category: "Travel", gradient: ["#FFF9C4", "#FFD54F"] },
  { id: "starry", name: "Starry", emoji: "🌙", bgColor: "#E3F2FD", category: "Travel", gradient: ["#E3F2FD", "#90CAF9"] },
  { id: "tropical", name: "Tropical", emoji: "🌴", bgColor: "#C8E6C9", category: "Travel", gradient: ["#C8E6C9", "#66BB6A"] },
  
  // ─── SOCIAL FEELINGS ────────────────────────────────
  { id: "friendly", name: "Friendly", emoji: "🤝", bgColor: "#B3E5FC", category: "Social", gradient: ["#B3E5FC", "#4FC3F7"] },
  { id: "social", name: "Social", emoji: "🎭", bgColor: "#F3E5F5", category: "Social", gradient: ["#F3E5F5", "#CE93D8"] },
  { id: "connected", name: "Connected", emoji: "🤗", bgColor: "#DCEDC8", category: "Social", gradient: ["#DCEDC8", "#AED581"] },
  { id: "beloved", name: "Beloved", emoji: "💕", bgColor: "#FFCDD2", category: "Social", gradient: ["#FFCDD2", "#EF9A9A"] },
  
  // ─── MISC FEELINGS ──────────────────────────────────
  { id: "curious", name: "Curious", emoji: "🔍", bgColor: "#E1F5FE", category: "Misc", gradient: ["#E1F5FE", "#81D4FA"] },
  { id: "creative", name: "Creative", emoji: "🎨", bgColor: "#F3E5F5", category: "Misc", gradient: ["#F3E5F5", "#CE93D8"] },
  { id: "accomplished", name: "Accomplished", emoji: "🎯", bgColor: "#C8E6C9", category: "Misc", gradient: ["#C8E6C9", "#81C784"] },
  { id: "motivated", name: "Motivated", emoji: "💪", bgColor: "#FFCCBC", category: "Misc", gradient: ["#FFCCBC", "#FF8A65"] },
  { id: "focused", name: "Focused", emoji: "🎯", bgColor: "#FFF3E0", category: "Misc", gradient: ["#FFF3E0", "#FFCC80"] },
  { id: "spiritual", name: "Spiritual", emoji: "🕉️", bgColor: "#D1C4E9", category: "Misc", gradient: ["#D1C4E9", "#B39DDB"] },
  { id: "playful", name: "Playful", emoji: "🎪", bgColor: "#F8BBD0", category: "Misc", gradient: ["#F8BBD0", "#F06292"] },
];

// Get unique categories
const CATEGORIES = ["All", ...new Set(FEELINGS.map(f => f.category))];

// Category icons
const CATEGORY_ICONS = {
  "All": "📋",
  "Positive": "😊",
  "Adventure": "🧗",
  "Relaxed": "😌",
  "Nostalgic": "📸",
  "Food": "🍕",
  "Travel": "🌍",
  "Social": "🤝",
  "Misc": "🎨"
};

const feedFeeling = () => {
  const router = useRouter();
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const saved = await AsyncStorage.getItem("currentUser");
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handlePostFeeling = async () => {
    if (!selectedFeeling) {
      Alert.alert("Error", "Please select a feeling first!");
      return;
    }

    setIsLoading(true);

    try {
      const user = currentUser || await AsyncStorage.getItem("currentUser");
      const userData = user ? (typeof user === 'string' ? JSON.parse(user) : user) : null;
      
      if (!userData) {
        Alert.alert("Error", "Please login first");
        setIsLoading(false);
        return;
      }

      const feelingPost = {
        id: Date.now(),
        userId: userData.id || "current",
        name: userData.name || "User",
        username: userData.username || "user",
        avatar: userData.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
        location: userData.location || "Unknown",
        timestamp: new Date().toISOString(),
        caption: caption.trim() || `Feeling ${selectedFeeling.name}`,
        type: "feeling",
        feeling: {
          name: selectedFeeling.name,
          emoji: selectedFeeling.emoji,
          subtitle: caption.trim() || "",
          bgColor: selectedFeeling.bgColor || "#FFF9C4",
          category: selectedFeeling.category || "Misc",
        },
        hashtags: [],
        likes: 0,
        comments: [],
        shares: 0,
      };

      const savedPosts = await AsyncStorage.getItem("allPosts");
      let allPosts = savedPosts ? JSON.parse(savedPosts) : [];
      allPosts = [feelingPost, ...allPosts];
      await AsyncStorage.setItem("allPosts", JSON.stringify(allPosts));

      Alert.alert(
        "🎉 Feeling Shared!",
        `${selectedFeeling.emoji} Feeling ${selectedFeeling.name} shared successfully!`,
        [{ text: "OK", onPress: () => router.back() }]
      );

    } catch (error) {
      console.error("Error posting feeling:", error);
      Alert.alert("Error", "Failed to share your feeling. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter feelings
  const getFilteredFeelings = () => {
    let filtered = FEELINGS;
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(f => f.category === selectedCategory);
    }
    
    if (searchText.trim()) {
      const search = searchText.toLowerCase().trim();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(search) ||
        f.emoji.includes(search) ||
        f.category.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  };

  // Get feeling count by category
  const getCategoryCount = (category) => {
    if (category === "All") return FEELINGS.length;
    return FEELINGS.filter(f => f.category === category).length;
  };

  const renderFeelingItem = (feeling) => {
    const isSelected = selectedFeeling?.id === feeling.id;
    
    return (
      <TouchableOpacity
        key={feeling.id}
        style={[
          s.feelingItem,
          isSelected && s.feelingItemSelected,
          { backgroundColor: isSelected ? feeling.bgColor : "#f5f5f5" }
        ]}
        onPress={() => setSelectedFeeling(feeling)}
        activeOpacity={0.7}
      >
        <Text style={s.feelingEmoji}>{feeling.emoji}</Text>
        <Text style={[s.feelingName, isSelected && s.feelingNameSelected]}>
          {feeling.name}
        </Text>
        {isSelected && (
          <View style={s.checkMark}>
            <Ionicons name="checkmark-circle" size={20} color="#1877f2" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!currentUser) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#1877f2" />
        <Text style={s.loadingText}>Loading...</Text>
      </View>
    );
  }

  const filteredFeelings = getFilteredFeelings();

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1c1e21" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>How are you feeling?</Text>
        <TouchableOpacity onPress={() => setShowCategoryFilter(!showCategoryFilter)} style={s.filterButton}>
          <Ionicons name="options-outline" size={24} color="#1877f2" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={s.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* User Info with Emotion Banner */}
        <View style={s.userInfoCard}>
          <View style={s.userInfoRow}>
            <Image 
              source={{ uri: currentUser.avatar }} 
              style={s.userAvatar} 
            />
            <View style={s.userInfoText}>
              <Text style={s.userName}>{currentUser.name}</Text>
              <Text style={s.userUsername}>@{currentUser.username}</Text>
            </View>
          </View>
          <View style={s.emotionBanner}>
            <Text style={s.emotionBannerText}>
              {selectedFeeling ? `${selectedFeeling.emoji} Feeling ${selectedFeeling.name}` : "😊 How are you feeling today?"}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={s.searchContainer}>
          <Ionicons name="search" size={20} color="#65676b" />
          <TextInput
            style={s.searchInput}
            placeholder="Search feelings..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color="#65676b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Modal */}
        {showCategoryFilter && (
          <View style={s.categoryFilterContainer}>
            <View style={s.categoryFilterHeader}>
              <Text style={s.categoryFilterTitle}>Filter by Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryFilter(false)}>
                <Ionicons name="close" size={22} color="#65676b" />
              </TouchableOpacity>
            </View>
            <View style={s.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    s.categoryFilterChip,
                    selectedCategory === cat && s.categoryFilterChipActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setShowCategoryFilter(false);
                  }}
                >
                  <Text style={s.categoryFilterEmoji}>
                    {CATEGORY_ICONS[cat] || "📌"}
                  </Text>
                  <Text style={[
                    s.categoryFilterText,
                    selectedCategory === cat && s.categoryFilterTextActive
                  ]}>
                    {cat} ({getCategoryCount(cat)})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quick Category Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={s.categoriesScroll}
          contentContainerStyle={s.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                s.categoryChip,
                selectedCategory === cat && s.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={s.categoryChipEmoji}>
                {CATEGORY_ICONS[cat] || "📌"}
              </Text>
              <Text style={[
                s.categoryChipText,
                selectedCategory === cat && s.categoryChipTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feelings Grid */}
        <View style={s.feelingsHeader}>
          <Text style={s.label}>
            {searchText 
              ? `✨ Found ${filteredFeelings.length} feelings` 
              : `✨ ${filteredFeelings.length} feelings available`}
          </Text>
        </View>

        <View style={s.feelingsGrid}>
          {filteredFeelings.map((feeling) => renderFeelingItem(feeling))}
        </View>

        {filteredFeelings.length === 0 && (
          <View style={s.noResults}>
            <Text style={s.noResultsEmoji}>😅</Text>
            <Text style={s.noResultsText}>No feelings found</Text>
            <Text style={s.noResultsSub}>Try a different search term</Text>
            <TouchableOpacity 
              style={s.resetButton}
              onPress={() => {
                setSearchText("");
                setSelectedCategory("All");
              }}
            >
              <Text style={s.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Preview Section */}
        {selectedFeeling && (
          <View style={s.previewSection}>
            <View style={s.previewHeader}>
              <Text style={s.previewLabel}>📝 Post Preview</Text>
            </View>
            <View style={[s.previewCard, { backgroundColor: selectedFeeling.bgColor }]}>
              <View style={s.previewContent}>
                <Text style={s.previewEmoji}>{selectedFeeling.emoji}</Text>
                <View style={s.previewTextContainer}>
                  <Text style={s.previewFeeling}>
                    Feeling {selectedFeeling.name}
                  </Text>
                  {caption.trim() && (
                    <Text style={s.previewCaption}>{caption.trim()}</Text>
                  )}
                  <Text style={s.previewCategoryTag}>
                    {selectedFeeling.category}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Caption Input */}
        <View style={s.captionSection}>
          <TextInput
            style={s.captionInput}
            placeholder="What else? Share your thoughts... ✍️"
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <View style={s.captionFooter}>
            <Text style={s.charCount}>{caption.length}/200</Text>
          </View>
        </View>

        {/* Post Button */}
        <TouchableOpacity
          style={[
            s.postButton,
            !selectedFeeling && s.postButtonDisabled,
            isLoading && s.postButtonDisabled
          ]}
          onPress={handlePostFeeling}
          disabled={!selectedFeeling || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="happy-outline" size={22} color="#fff" />
              <Text style={s.postButtonText}>
                {selectedFeeling ? `Share ${selectedFeeling.emoji} Feeling` : "Select a feeling to share"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default feedFeeling;

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#1877f2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e6eb",
  },
  backButton: {
    padding: 4,
  },
  filterButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1c1e21",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfoText: {
    marginLeft: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#1877f2",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1c1e21",
  },
  userUsername: {
    fontSize: 13,
    color: "#65676b",
    marginTop: 2,
  },
  emotionBanner: {
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  emotionBannerText: {
    fontSize: 14,
    color: "#65676b",
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e4e6eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 10,
    fontSize: 15,
    color: "#1c1e21",
  },
  categoryFilterContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e4e6eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryFilterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryFilterTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1c1e21",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryFilterChipActive: {
    backgroundColor: "#1877f2",
  },
  categoryFilterEmoji: {
    fontSize: 14,
  },
  categoryFilterText: {
    fontSize: 12,
    color: "#65676b",
    fontWeight: "500",
  },
  categoryFilterTextActive: {
    color: "#fff",
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f2f5",
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: "#1877f2",
  },
  categoryChipEmoji: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 12,
    color: "#65676b",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  feelingsHeader: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1c1e21",
  },
  feelingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  feelingItem: {
    width: "31%",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  feelingItemSelected: {
    borderColor: "#1877f2",
    borderWidth: 2,
    shadowColor: "#1877f2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  feelingEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  feelingName: {
    fontSize: 11,
    color: "#65676b",
    fontWeight: "500",
    textAlign: "center",
  },
  feelingNameSelected: {
    color: "#1c1e21",
    fontWeight: "600",
  },
  checkMark: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1e21",
  },
  noResultsSub: {
    fontSize: 13,
    color: "#65676b",
    marginTop: 4,
  },
  resetButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1877f2",
    borderRadius: 20,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  previewSection: {
    marginBottom: 16,
  },
  previewHeader: {
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1c1e21",
  },
  previewCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e4e6eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  previewEmoji: {
    fontSize: 36,
  },
  previewTextContainer: {
    flex: 1,
  },
  previewFeeling: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1e21",
    marginBottom: 2,
  },
  previewCaption: {
    fontSize: 14,
    color: "#65676b",
    marginTop: 2,
  },
  previewCategoryTag: {
    fontSize: 11,
    color: "#1877f2",
    fontWeight: "500",
    marginTop: 4,
  },
  captionSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e4e6eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  captionInput: {
    fontSize: 15,
    color: "#1c1e21",
    minHeight: 60,
    textAlignVertical: "top",
  },
  captionFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
  },
  postButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1877f2",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 4,
    marginBottom: 70,
    shadowColor: "#1877f2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  postButtonDisabled: {
    backgroundColor: "#e4e6eb",
    shadowOpacity: 0,
    elevation: 0,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});