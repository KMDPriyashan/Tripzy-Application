import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const feedProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Default images
  const defaultAvatar = "https://randomuser.me/api/portraits/men/1.jpg";
  const defaultCover = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";
  
  // State for user data
  const [userData, setUserData] = useState({
    id: 'current',
    name: "John Doe",
    username: "johndoe",
    avatar: defaultAvatar,
    coverImage: defaultCover,
    bio: "Travel enthusiast | Adventure seeker | Making memories around the world 🌍",
    location: "New York, USA",
    joinDate: "March 2024",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    website: "www.johndoe.com",
    totalTrips: 24,
    countriesVisited: 12,
    travelDays: 156,
    favoriteDestination: "Bali, Indonesia",
    nextDestination: "Tokyo, Japan"
  });
  
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [likedPosts, setLikedPosts] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    totalTrips: '',
    countriesVisited: '',
    travelDays: '',
    favoriteDestination: '',
    nextDestination: ''
  });

  // Sample saved posts
  const sampleSavedPosts = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      location: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
      caption: "Paradise found! The beaches of Bali are absolutely breathtaking. 🌴☀️",
      likes: 1245,
    },
    {
      id: 2,
      name: "Mike Chen",
      username: "mikechen",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      location: "Swiss Alps, Switzerland",
      image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
      caption: "The view from the top of Jungfraujoch is unforgettable! ❄️🏔️",
      likes: 3421,
    },
  ];

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Sorry, we need camera roll permissions to make this work!');
      }
    })();
    loadUserData();
    loadSavedPosts();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUserData(parsedUser);
        setEditForm({
          name: parsedUser.name,
          username: parsedUser.username,
          bio: parsedUser.bio,
          location: parsedUser.location,
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          website: parsedUser.website || '',
          totalTrips: parsedUser.totalTrips?.toString() || '0',
          countriesVisited: parsedUser.countriesVisited?.toString() || '0',
          travelDays: parsedUser.travelDays?.toString() || '0',
          favoriteDestination: parsedUser.favoriteDestination || '',
          nextDestination: parsedUser.nextDestination || ''
        });
      } else if (params.userData) {
        try {
          const parsedUserData = JSON.parse(params.userData);
          setUserData(parsedUserData);
          setEditForm({
            name: parsedUserData.name,
            username: parsedUserData.username,
            bio: parsedUserData.bio,
            location: parsedUserData.location,
            email: parsedUserData.email || '',
            phone: parsedUserData.phone || '',
            website: parsedUserData.website || '',
            totalTrips: parsedUserData.totalTrips?.toString() || '0',
            countriesVisited: parsedUserData.countriesVisited?.toString() || '0',
            travelDays: parsedUserData.travelDays?.toString() || '0',
            favoriteDestination: parsedUserData.favoriteDestination || '',
            nextDestination: parsedUserData.nextDestination || ''
          });
          await AsyncStorage.setItem('currentUser', JSON.stringify(parsedUserData));
        } catch (error) {
          console.log('Error parsing user data:', error);
        }
      }
      
      // Load user posts
      const savedPosts = await AsyncStorage.getItem('userPosts');
      if (savedPosts) {
        setUserPosts(JSON.parse(savedPosts));
      } else if (params.userPosts) {
        try {
          const parsedUserPosts = JSON.parse(params.userPosts);
          setUserPosts(parsedUserPosts);
          await AsyncStorage.setItem('userPosts', JSON.stringify(parsedUserPosts));
        } catch (error) {
          console.log('Error parsing user posts:', error);
        }
      }
    } catch (error) {
      console.log('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedPosts = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedPosts');
      if (saved) {
        setSavedPosts(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading saved posts:', error);
    }
  };

  const saveUserData = async (updatedUser) => {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.log('Error saving user data:', error);
    }
  };

  const saveUserPosts = async (posts) => {
    try {
      await AsyncStorage.setItem('userPosts', JSON.stringify(posts));
    } catch (error) {
      console.log('Error saving user posts:', error);
    }
  };

  const saveSavedPosts = async (posts) => {
    try {
      await AsyncStorage.setItem('savedPosts', JSON.stringify(posts));
    } catch (error) {
      console.log('Error saving saved posts:', error);
    }
  };

  // Share profile function
  const shareProfile = async () => {
    try {
      const result = await Share.share({
        message: `Check out ${userData.name}'s travel profile on Tripzy!\n\n🌍 Traveler since: ${userData.joinDate}\n✈️ Total Trips: ${userData.totalTrips}\n📍 Countries Visited: ${userData.countriesVisited}\n📅 Travel Days: ${userData.travelDays}\n⭐ Favorite Destination: ${userData.favoriteDestination}\n🎯 Next Destination: ${userData.nextDestination}\n\nFollow for amazing travel content! 🧳✨`,
        title: `${userData.name}'s Travel Profile`,
      });
      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Profile shared successfully!');
      }
    } catch (error) {
      console.log('Error sharing profile:', error);
      Alert.alert('Error', 'Failed to share profile');
    }
  };

  // Function to delete post from both userPosts and feedPosts
  const deletePostFromAllStorages = async (postId) => {
    try {
      // Delete from userPosts
      const updatedUserPosts = userPosts.filter(post => post.id !== postId);
      setUserPosts(updatedUserPosts);
      await saveUserPosts(updatedUserPosts);
      
      // Delete from feedPosts
      const feedPosts = await AsyncStorage.getItem('feedPosts');
      if (feedPosts) {
        const parsedFeedPosts = JSON.parse(feedPosts);
        const updatedFeedPosts = parsedFeedPosts.filter(post => post.id !== postId);
        await AsyncStorage.setItem('feedPosts', JSON.stringify(updatedFeedPosts));
      }
      
      return true;
    } catch (error) {
      console.log('Error deleting post:', error);
      return false;
    }
  };

  const pickImage = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        setIsImageLoading(true);
        const imageUri = result.assets[0].uri;
        
        // Update user data with new image
        const updatedUserData = {
          ...userData,
          [type === 'avatar' ? 'avatar' : 'coverImage']: imageUri
        };
        
        setUserData(updatedUserData);
        await saveUserData(updatedUserData);
        
        // Update posts with new avatar if needed
        if (type === 'avatar') {
          const updatedPosts = userPosts.map(post => ({
            ...post,
            avatar: imageUri
          }));
          setUserPosts(updatedPosts);
          await saveUserPosts(updatedPosts);
          
          // Also update feedPosts with new avatar
          const feedPosts = await AsyncStorage.getItem('feedPosts');
          if (feedPosts) {
            const parsedFeedPosts = JSON.parse(feedPosts);
            const updatedFeedPosts = parsedFeedPosts.map(post => {
              if (post.userId === 'current') {
                return { ...post, avatar: imageUri };
              }
              return post;
            });
            await AsyncStorage.setItem('feedPosts', JSON.stringify(updatedFeedPosts));
          }
        }
        
        Alert.alert('Success', `${type === 'avatar' ? 'Profile picture' : 'Cover photo'} updated successfully!`);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleLike = (postId) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
      setUserPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId ? { ...post, likes: post.likes - 1 } : post
        )
      );
    } else {
      setLikedPosts([...likedPosts, postId]);
      setUserPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    }
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const success = await deletePostFromAllStorages(postId);
            if (success) {
              Alert.alert('Success', 'Post deleted successfully from your profile and feed');
            } else {
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Update user data with edited values
      const updatedUserData = {
        ...userData,
        name: editForm.name,
        username: editForm.username,
        bio: editForm.bio,
        location: editForm.location,
        email: editForm.email,
        phone: editForm.phone,
        website: editForm.website,
        totalTrips: parseInt(editForm.totalTrips) || 0,
        countriesVisited: parseInt(editForm.countriesVisited) || 0,
        travelDays: parseInt(editForm.travelDays) || 0,
        favoriteDestination: editForm.favoriteDestination,
        nextDestination: editForm.nextDestination
      };
      
      setUserData(updatedUserData);
      
      // Update user's name and username in posts
      const updatedPosts = userPosts.map(post => ({
        ...post,
        name: editForm.name,
        username: editForm.username,
        avatar: userData.avatar
      }));
      setUserPosts(updatedPosts);
      
      // Update feedPosts with new user info
      const feedPosts = await AsyncStorage.getItem('feedPosts');
      if (feedPosts) {
        const parsedFeedPosts = JSON.parse(feedPosts);
        const updatedFeedPosts = parsedFeedPosts.map(post => {
          if (post.userId === 'current') {
            return {
              ...post,
              name: editForm.name,
              username: editForm.username,
              avatar: userData.avatar
            };
          }
          return post;
        });
        await AsyncStorage.setItem('feedPosts', JSON.stringify(updatedFeedPosts));
      }
      
      // Save to AsyncStorage
      await saveUserData(updatedUserData);
      await saveUserPosts(updatedPosts);
      
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.log('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    }
  };

  const handleRemoveSavedPost = async (postId) => {
    const updatedSaved = savedPosts.filter(post => post.id !== postId);
    setSavedPosts(updatedSaved);
    await saveSavedPosts(updatedSaved);
    Alert.alert('Removed', 'Post removed from saved');
  };

  const renderPostItem = ({ item }) => {
    const isLiked = likedPosts.includes(item.id);
    
    // Check if it's a feeling post (no image)
    const isFeelingPost = item.type === 'feeling' || (!item.image && item.feeling);
    
    return (
      <View style={styles.postItem}>
        <View style={styles.postHeader}>
          <Image source={{ uri: item.avatar }} style={styles.postAvatar} />
          <View style={styles.postHeaderInfo}>
            <Text style={styles.postName}>{item.name}</Text>
            <Text style={styles.postUsername}>@{item.username}</Text>
            <Text style={styles.postLocation}>{item.location} • {item.time}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.postCaption}>{item.caption}</Text>
        
        {/* Display Hashtags if any */}
        {item.hashtags && item.hashtags.length > 0 && (
          <View style={styles.hashtagsContainer}>
            {item.hashtags.map((tag, index) => (
              <Text key={index} style={styles.hashtag}>{tag}</Text>
            ))}
          </View>
        )}
        
        {/* Only show image if it's not a feeling post */}
        {!isFeelingPost && item.image && (
          <Image source={{ uri: item.image }} style={styles.postImage} />
        )}
        
        {/* Show feeling badge for feeling posts */}
        {isFeelingPost && item.feeling && (
          <View style={[styles.feelingBadge, { backgroundColor: item.feeling.bgColor }]}>
            <Text style={styles.feelingBadgeEmoji}>{item.feeling.emoji}</Text>
            <Text style={styles.feelingBadgeText}>Feeling {item.feeling.name}</Text>
          </View>
        )}
        
        <View style={styles.postStats}>
          <View style={styles.likesContainer}>
            <Text style={styles.likeIcon}>👍</Text>
            <Text style={styles.statsText}>{item.likes}</Text>
          </View>
          <Text style={styles.statsText}>{item.comments?.length || 0} comments • {item.shares} shares</Text>
        </View>
        
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={() => handleLike(item.id)}
          >
            <Text style={[styles.actionButtonText, isLiked && styles.actionButtonTextActive]}>
              {isLiked ? '❤️ Liked' : '👍 Like'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>💬 Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>↗️ Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderPhotoItem = ({ item }) => (
    <TouchableOpacity style={styles.photoGridItem}>
      <Image source={{ uri: item.image }} style={styles.photoGridImage} />
      <View style={styles.photoOverlay}>
        <Text style={styles.photoLikes}>👍 {item.likes}</Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderSavedItem = ({ item }) => (
    <View style={styles.savedItem}>
      <Image source={{ uri: item.image }} style={styles.savedImage} />
      <View style={styles.savedInfo}>
        <Text style={styles.savedCaption} numberOfLines={2}>{item.caption}</Text>
        <Text style={styles.savedLocation}>{item.location}</Text>
        <View style={styles.savedStats}>
          <Text style={styles.savedLikes}>👍 {item.likes} likes</Text>
          <TouchableOpacity onPress={() => handleRemoveSavedPost(item.id)}>
            <Text style={styles.removeButton}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  const renderContent = () => {
    switch(activeTab) {
      case 'posts':
        return (
          <FlatList
            data={userPosts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPostItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>📝</Text>
                <Text style={styles.emptyStateTitle}>No posts yet</Text>
                <Text style={styles.emptyStateText}>Share your first travel story!</Text>
              </View>
            }
          />
        );
      case 'photos':
        return (
          <FlatList
            data={userPosts.filter(post => post.image && post.type !== 'feeling')}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPhotoItem}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>📷</Text>
                <Text style={styles.emptyStateTitle}>No photos yet</Text>
                <Text style={styles.emptyStateText}>Share your travel photos!</Text>
              </View>
            }
          />
        );
      case 'saved':
        return (
          <FlatList
            data={savedPosts.length > 0 ? savedPosts : sampleSavedPosts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSavedItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🔖</Text>
                <Text style={styles.emptyStateTitle}>No saved posts</Text>
                <Text style={styles.emptyStateText}>Save posts you want to remember!</Text>
              </View>
            }
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877f2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (isImageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877f2" />
        <Text style={styles.loadingText}>Updating image...</Text>
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
        <Text style={styles.headerTitle}>{userData.name}</Text>
        <TouchableOpacity style={styles.menuButton} onPress={shareProfile}>
          <Text style={styles.menuIcon}>📤</Text>
        </TouchableOpacity>
      </View>
      
      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.editModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Picture Section */}
              <View style={styles.editPhotoSection}>
                <Text style={styles.editSectionLabel}>Profile Picture</Text>
                <TouchableOpacity style={styles.editPhotoContainer} onPress={() => pickImage('avatar')}>
                  <Image source={{ uri: userData.avatar }} style={styles.editAvatar} />
                  <View style={styles.editPhotoOverlay}>
                    <Text style={styles.editPhotoIcon}>📷</Text>
                    <Text style={styles.editPhotoText}>Change Photo</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              {/* Cover Photo Section */}
              <View style={styles.editPhotoSection}>
                <Text style={styles.editSectionLabel}>Cover Photo</Text>
                <TouchableOpacity style={styles.editCoverContainer} onPress={() => pickImage('cover')}>
                  <Image source={{ uri: userData.coverImage }} style={styles.editCover} />
                  <View style={styles.editCoverOverlay}>
                    <Text style={styles.editPhotoIcon}>📷</Text>
                    <Text style={styles.editPhotoText}>Change Cover</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              {/* Name */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Full Name</Text>
                <TextInput
                  style={styles.editInput}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({...editForm, name: text})}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                />
              </View>
              
              {/* Username */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Username</Text>
                <TextInput
                  style={styles.editInput}
                  value={editForm.username}
                  onChangeText={(text) => setEditForm({...editForm, username: text})}
                  placeholder="Enter username"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>
              
              {/* Bio */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Bio</Text>
                <TextInput
                  style={[styles.editInput, styles.editTextArea]}
                  value={editForm.bio}
                  onChangeText={(text) => setEditForm({...editForm, bio: text})}
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              {/* Location */}
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Location</Text>
                <TextInput
                  style={styles.editInput}
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({...editForm, location: text})}
                  placeholder="Your location"
                  placeholderTextColor="#999"
                />
              </View>
              
              {/* Travel Statistics Section */}
              <View style={styles.travelStatsEditSection}>
                <Text style={styles.editSectionHeader}>Travel Statistics</Text>
                
                {/* Total Trips */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Total Trips ✈️</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.totalTrips}
                    onChangeText={(text) => setEditForm({...editForm, totalTrips: text})}
                    placeholder="Number of trips taken"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
                
                {/* Countries Visited */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Countries Visited 🌍</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.countriesVisited}
                    onChangeText={(text) => setEditForm({...editForm, countriesVisited: text})}
                    placeholder="Number of countries visited"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
                
                {/* Travel Days */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Travel Days 📅</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.travelDays}
                    onChangeText={(text) => setEditForm({...editForm, travelDays: text})}
                    placeholder="Total days spent traveling"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
                
                {/* Favorite Destination */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Favorite Destination ⭐</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.favoriteDestination}
                    onChangeText={(text) => setEditForm({...editForm, favoriteDestination: text})}
                    placeholder="Your favorite travel destination"
                    placeholderTextColor="#999"
                  />
                </View>
                
                {/* Next Destination */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Next Destination 🎯</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.nextDestination}
                    onChangeText={(text) => setEditForm({...editForm, nextDestination: text})}
                    placeholder="Your next travel destination"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              
              {/* Contact Information Section */}
              <View style={styles.contactEditSection}>
                <Text style={styles.editSectionHeader}>Contact Information</Text>
                
                {/* Email */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Email</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.email}
                    onChangeText={(text) => setEditForm({...editForm, email: text})}
                    placeholder="Your email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                  />
                </View>
                
                {/* Phone */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Phone</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm({...editForm, phone: text})}
                    placeholder="Your phone number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>
                
                {/* Website */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Website</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.website}
                    onChangeText={(text) => setEditForm({...editForm, website: text})}
                    placeholder="Your website"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      <FlatList
        data={[]}
        keyExtractor={() => 'dummy'}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Cover Photo */}
            <Image source={{ uri: userData.coverImage }} style={styles.coverImage} />
            
            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <Image source={{ uri: userData.avatar }} style={styles.profileAvatar} />
              
              <View style={styles.profileActions}>
                <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareProfileButton} onPress={shareProfile}>
                  <Text style={styles.shareProfileText}>📤 Share Profile</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.profileName}>{userData.name}</Text>
              <Text style={styles.profileUsername}>@{userData.username}</Text>
              <Text style={styles.profileBio}>{userData.bio}</Text>
              
              {/* Travel Stats Section */}
              <View style={styles.travelStatsContainer}>
                <View style={styles.travelStatItem}>
                  <Text style={styles.travelStatNumber}>{userData.totalTrips || 0}</Text>
                  <Text style={styles.travelStatLabel}>Total Trips</Text>
                </View>
                <View style={styles.travelStatDivider} />
                <View style={styles.travelStatItem}>
                  <Text style={styles.travelStatNumber}>{userData.countriesVisited || 0}</Text>
                  <Text style={styles.travelStatLabel}>Countries</Text>
                </View>
                <View style={styles.travelStatDivider} />
                <View style={styles.travelStatItem}>
                  <Text style={styles.travelStatNumber}>{userData.travelDays || 0}</Text>
                  <Text style={styles.travelStatLabel}>Travel Days</Text>
                </View>
              </View>
              
              {/* Favorite & Next Destination */}
              {(userData.favoriteDestination || userData.nextDestination) && (
                <View style={styles.destinationsContainer}>
                  {userData.favoriteDestination && (
                    <View style={styles.destinationRow}>
                      <Text style={styles.destinationIcon}>⭐</Text>
                      <Text style={styles.destinationLabel}>Favorite:</Text>
                      <Text style={styles.destinationText}>{userData.favoriteDestination}</Text>
                    </View>
                  )}
                  {userData.nextDestination && (
                    <View style={styles.destinationRow}>
                      <Text style={styles.destinationIcon}>🎯</Text>
                      <Text style={styles.destinationLabel}>Next:</Text>
                      <Text style={styles.destinationText}>{userData.nextDestination}</Text>
                    </View>
                  )}
                </View>
              )}
              
              {/* Location and Join Date */}
              <View style={styles.infoContainer}>
                {userData.location && userData.location !== '' && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📍</Text>
                    <Text style={styles.infoText}>{userData.location}</Text>
                  </View>
                )}
                {userData.joinDate && userData.joinDate !== '' && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📅</Text>
                    <Text style={styles.infoText}>Joined {userData.joinDate}</Text>
                  </View>
                )}
              </View>
              
              {/* Contact Info - Only show if not default */}
              {(userData.email && userData.email !== 'john.doe@example.com') ||
               (userData.phone && userData.phone !== '+1 234 567 8900') ||
               (userData.website && userData.website !== 'www.johndoe.com') ? (
                <View style={styles.contactInfoContainer}>
                  <Text style={styles.contactInfoTitle}>Contact Information</Text>
                  {userData.email && userData.email !== 'john.doe@example.com' && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoIcon}>✉️</Text>
                      <Text style={styles.infoText}>{userData.email}</Text>
                    </View>
                  )}
                  {userData.phone && userData.phone !== '+1 234 567 8900' && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoIcon}>📞</Text>
                      <Text style={styles.infoText}>{userData.phone}</Text>
                    </View>
                  )}
                  {userData.website && userData.website !== 'www.johndoe.com' && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoIcon}>🌐</Text>
                      <Text style={styles.infoText}>{userData.website}</Text>
                    </View>
                  )}
                </View>
              ) : null}
              
              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userPosts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userData.totalTrips || 0}</Text>
                  <Text style={styles.statLabel}>Total Trips</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userData.countriesVisited || 0}</Text>
                  <Text style={styles.statLabel}>Countries</Text>
                </View>
              </View>
            </View>
            
            {/* Tab Bar */}
            <View style={styles.tabBar}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
                onPress={() => setActiveTab('posts')}
              >
                <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
                  📝 Posts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
                onPress={() => setActiveTab('photos')}
              >
                <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>
                  📷 Photos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
                onPress={() => setActiveTab('saved')}
              >
                <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
                  🔖 Saved
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListFooterComponent={renderContent()}
      />
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
  menuButton: {
    padding: 4,
  },
  menuIcon: {
    fontSize: 20,
    color: '#1877f2',
  },
  coverImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  profileInfo: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 8,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffffff',
    marginTop: -50,
    marginBottom: 12,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  editProfileButton: {
    backgroundColor: '#e4e6eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  editProfileText: {
    color: '#1c1e21',
    fontSize: 14,
    fontWeight: '600',
  },
  shareProfileButton: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareProfileText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: '#65676b',
    marginBottom: 12,
  },
  profileBio: {
    fontSize: 14,
    color: '#65676b',
    marginBottom: 16,
    lineHeight: 20,
  },
  travelStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  travelStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  travelStatNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1877f2',
    marginBottom: 4,
  },
  travelStatLabel: {
    fontSize: 11,
    color: '#65676b',
  },
  travelStatDivider: {
    width: 1,
    backgroundColor: '#e4e6eb',
  },
  destinationsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  destinationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  destinationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1c1e21',
    marginRight: 8,
  },
  destinationText: {
    fontSize: 13,
    color: '#65676b',
    flex: 1,
  },
  infoContainer: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1c1e21',
    flex: 1,
  },
  contactInfoContainer: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  contactInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  statLabel: {
    fontSize: 13,
    color: '#65676b',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e4e6eb',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1877f2',
  },
  tabText: {
    fontSize: 15,
    color: '#65676b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1877f2',
  },
  postItem: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  postUsername: {
    fontSize: 11,
    color: '#65676b',
    marginTop: 1,
  },
  postLocation: {
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
  },
  deleteIcon: {
    fontSize: 20,
    paddingHorizontal: 8,
  },
  postCaption: {
    fontSize: 14,
    color: '#1c1e21',
    paddingHorizontal: 12,
    paddingBottom: 12,
    lineHeight: 20,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  hashtag: {
    fontSize: 13,
    color: '#1877f2',
    marginRight: 8,
    marginBottom: 4,
  },
  postImage: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
  },
  feelingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  feelingBadgeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  feelingBadgeText: {
    fontSize: 13,
    color: '#1c1e21',
    fontWeight: '500',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  statsText: {
    fontSize: 13,
    color: '#65676b',
  },
  postActions: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 4,
  },
  actionButtonActive: {
    backgroundColor: '#f0f2f5',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#65676b',
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: '#1877f2',
  },
  photoGridItem: {
    flex: 1,
    margin: 1,
    position: 'relative',
  },
  photoGridImage: {
    width: '100%',
    aspectRatio: 1,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  photoLikes: {
    color: '#ffffff',
    fontSize: 12,
  },
  savedItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginBottom: 1,
    padding: 12,
  },
  savedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  savedInfo: {
    flex: 1,
  },
  savedCaption: {
    fontSize: 14,
    color: '#1c1e21',
    marginBottom: 4,
  },
  savedLocation: {
    fontSize: 12,
    color: '#65676b',
    marginBottom: 4,
  },
  savedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedLikes: {
    fontSize: 12,
    color: '#65676b',
  },
  removeButton: {
    fontSize: 12,
    color: '#1877f2',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
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
  // Edit Modal Styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  editModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    margin: 20,
    maxHeight: '90%',
    padding: 20,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  editModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  editModalClose: {
    fontSize: 24,
    color: '#65676b',
    padding: 4,
  },
  editPhotoSection: {
    marginBottom: 20,
  },
  editSectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 10,
  },
  editPhotoContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  editAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editCoverContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  editCover: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  editPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editCoverOverlay: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editPhotoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  editPhotoText: {
    color: '#ffffff',
    fontSize: 12,
  },
  travelStatsEditSection: {
    marginBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  contactEditSection: {
    marginBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  editSectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 16,
  },
  editField: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1c1e21',
  },
  editTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e4e6eb',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#1c1e21',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1877f2',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default feedProfile;