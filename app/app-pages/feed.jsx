import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const feedPage = () => {
  const router = useRouter();
  const [likedPosts, setLikedPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Comment and Share States
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  
  // Options Modal State
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedPostForOptions, setSelectedPostForOptions] = useState(null);
  
  // Format Date/Time Function
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (months < 12) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };
  
  // New states for Check-In and Hashtags
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [showHashtagModal, setShowHashtagModal] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [postHashtags, setPostHashtags] = useState([]);
  
  // States for Travel Community & Events
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [userCreatedEvents, setUserCreatedEvents] = useState([]);
  
  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    price: 'Free',
    category: 'Workshop',
    spots: 50,
    eventImage: null
  });

  // Travel Events & Community Data (Default + User Created)
  const [travelEvents, setTravelEvents] = useState([
    {
      id: 1,
      title: "🌍 Global Travel Summit 2024",
      date: "December 15-17, 2024",
      location: "Singapore",
      description: "Connect with top travel influencers, learn about sustainable tourism, and discover hidden gems worldwide.",
      spots: 150,
      enrolled: 89,
      price: "Free",
      category: "Conference",
      image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800",
      isUserCreated: false
    },
    {
      id: 2,
      title: "🏔️ Himalayan Trekking Expedition",
      date: "January 10-20, 2025",
      location: "Nepal",
      description: "Join fellow adventurers for an epic Himalayan trek. Professional guides, breathtaking views, and lifetime memories.",
      spots: 25,
      enrolled: 12,
      price: "$1,299",
      category: "Adventure",
      image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
      isUserCreated: false
    },
    {
      id: 3,
      title: "🍜 Southeast Asia Food Tour",
      date: "February 5-18, 2025",
      location: "Thailand, Vietnam, Cambodia",
      description: "Experience the best street food and culinary traditions across three amazing countries.",
      spots: 30,
      enrolled: 18,
      price: "$899",
      category: "Food & Culture",
      image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
      isUserCreated: false
    },
    {
      id: 4,
      title: "📸 Photography Masterclass",
      date: "January 25-27, 2025",
      location: "Bali, Indonesia",
      description: "Learn travel photography from professional photographers. Capture stunning landscapes and portraits.",
      spots: 40,
      enrolled: 22,
      price: "$199",
      category: "Workshop",
      image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800",
      isUserCreated: false
    },
    {
      id: 5,
      title: "🌿 Eco-Volunteer Program",
      date: "March 1-15, 2025",
      location: "Costa Rica",
      description: "Give back to nature by participating in wildlife conservation and reforestation projects.",
      spots: 20,
      enrolled: 8,
      price: "$499",
      category: "Volunteer",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
      isUserCreated: false
    }
  ]);

  const categories = ["Conference", "Adventure", "Food & Culture", "Workshop", "Volunteer", "Other"];

  // Popular locations for quick selection
  const popularLocations = [
    "Paris, France", "Tokyo, Japan", "New York, USA", "Bali, Indonesia",
    "London, UK", "Rome, Italy", "Sydney, Australia", "Cape Town, South Africa",
    "Barcelona, Spain", "Dubai, UAE", "Bangkok, Thailand", "Istanbul, Turkey",
    "Mumbai, India", "Singapore", "Kuala Lumpur, Malaysia", "Seoul, South Korea"
  ];

  // Default images
  const defaultAvatar = "https://randomuser.me/api/portraits/men/1.jpg";
  const defaultCover = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";

  // Current user data with default values
  const [currentUser, setCurrentUser] = useState({
    id: 'current',
    name: "Current User",
    username: "UserD",
    avatar: defaultAvatar,
    coverImage: defaultCover,
    bio: " ",
    location: "New York, USA",
    joinDate: "March 2024",
    followers: 0,
    following: 0,
    email: "currentUser@example.com",
    phone: "+94.",
    website: "www.example.com"
  });

  // Sample travel feed data (other users' posts) with comments and timestamps
  const [feedData, setFeedData] = useState([
    {
      id: 1,
      userId: 1,
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      location: "Bali, Indonesia",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
      caption: "Paradise found! The beaches of Bali are absolutely breathtaking. 🌴☀️",
      hashtags: ["#TravelDiaries", "#BeachLife"],
      likes: 1245,
      comments: [
        { id: 1, userId: 10, userName: "Traveler Joe", text: "Amazing view!", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }
      ],
      shares: 34,
    },
    {
      id: 2,
      userId: 2,
      name: "Mike Chen",
      username: "mikechen",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      location: "Swiss Alps, Switzerland",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
      caption: "The view from the top of Jungfraujoch is unforgettable! ❄️🏔️",
      hashtags: ["#MountainViews", "#Adventure"],
      likes: 3421,
      comments: [],
      shares: 89,
    },
    {
      id: 3,
      userId: 3,
      name: "Emma Rodriguez",
      username: "emmarod",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      location: "Kyoto, Japan",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
      caption: "Cherry blossom season in Kyoto is magical! 🌸✨",
      hashtags: ["#CherryBlossom", "#JapanTravel"],
      likes: 2891,
      comments: [],
      shares: 67,
    },
    {
      id: 4,
      userId: 4,
      name: "David Kim",
      username: "davidk",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      location: "Santorini, Greece",
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
      caption: "Santorini sunsets are everything they're cracked up to be! 🇬🇷",
      hashtags: ["#Santorini", "#GreekIslands"],
      likes: 4567,
      comments: [],
      shares: 123,
    },
    {
      id: 5,
      userId: 5,
      name: "Lisa Thompson",
      username: "lisat",
      avatar: "https://randomuser.me/api/portraits/women/5.jpg",
      location: "Machu Picchu, Peru",
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
      caption: "Ancient wonders and new adventures! 🏔️",
      hashtags: ["#MachuPicchu", "#Wanderlust"],
      likes: 1876,
      comments: [],
      shares: 45,
    },
  ]);

  // Current user posts
  const [currentUserPosts, setCurrentUserPosts] = useState([]);

  // Load enrolled events and user created events from storage
  useEffect(() => {
    loadEnrolledEvents();
    loadUserCreatedEvents();
    loadTravelEvents();
  }, []);

  const loadTravelEvents = async () => {
    try {
      const savedEvents = await AsyncStorage.getItem('travelEvents');
      if (savedEvents) {
        setTravelEvents(JSON.parse(savedEvents));
      }
    } catch (error) {
      console.log('Error loading travel events:', error);
    }
  };

  const saveTravelEvents = async (events) => {
    try {
      await AsyncStorage.setItem('travelEvents', JSON.stringify(events));
    } catch (error) {
      console.log('Error saving travel events:', error);
    }
  };

  const loadEnrolledEvents = async () => {
    try {
      const saved = await AsyncStorage.getItem('enrolledEvents');
      if (saved) {
        setEnrolledEvents(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading enrolled events:', error);
    }
  };

  const saveEnrolledEvents = async (events) => {
    try {
      await AsyncStorage.setItem('enrolledEvents', JSON.stringify(events));
    } catch (error) {
      console.log('Error saving enrolled events:', error);
    }
  };

  const loadUserCreatedEvents = async () => {
    try {
      const saved = await AsyncStorage.getItem('userCreatedEvents');
      if (saved) {
        setUserCreatedEvents(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading user created events:', error);
    }
  };

  const saveUserCreatedEvents = async (events) => {
    try {
      await AsyncStorage.setItem('userCreatedEvents', JSON.stringify(events));
    } catch (error) {
      console.log('Error saving user created events:', error);
    }
  };

  // Function to pick event image
  const pickEventImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        setNewEvent({...newEvent, eventImage: result.assets[0].uri});
      }
    } catch (error) {
      console.log('Error picking event image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Function to delete user created event
  const handleDeleteEvent = (eventId) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const updatedEvents = travelEvents.filter(e => e.id !== eventId);
            setTravelEvents(updatedEvents);
            await saveTravelEvents(updatedEvents);
            
            const updatedUserEvents = userCreatedEvents.filter(e => e.id !== eventId);
            setUserCreatedEvents(updatedUserEvents);
            await saveUserCreatedEvents(updatedUserEvents);
            
            const updatedEnrolled = enrolledEvents.filter(e => e.id !== eventId);
            setEnrolledEvents(updatedEnrolled);
            await saveEnrolledEvents(updatedEnrolled);
            
            Alert.alert('Success', 'Event deleted successfully');
          }
        }
      ]
    );
  };

  // Function to delete enrollment
  const handleDeleteEnrollment = (eventId) => {
    Alert.alert(
      'Cancel Enrollment',
      'Are you sure you want to cancel your enrollment for this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Cancel Enrollment', 
          style: 'destructive',
          onPress: async () => {
            const updatedEnrolled = enrolledEvents.filter(e => e.id !== eventId);
            setEnrolledEvents(updatedEnrolled);
            await saveEnrolledEvents(updatedEnrolled);
            
            const updatedEvents = travelEvents.map(e => {
              if (e.id === eventId) {
                return { ...e, enrolled: Math.max(0, e.enrolled - 1) };
              }
              return e;
            });
            setTravelEvents(updatedEvents);
            await saveTravelEvents(updatedEvents);
            
            Alert.alert('Success', 'You have cancelled your enrollment');
          }
        }
      ]
    );
  };

  // Function to share enrollment as a text-only post
  const shareEnrollmentPost = async (eventTitle) => {
    try {
      const enrollmentPost = {
        id: Date.now(),
        userId: 'current',
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
        location: currentUser.location,
        timestamp: new Date().toISOString(),
        image: null,
        caption: `🎉 I just enrolled in "${eventTitle}"! ✈️\n\nCan't wait for this amazing travel experience! 🌍\n\n#TravelEnrollment #Excited #Tripzy`,
        hashtags: ["#TravelEnrollment", "#Excited", "#Tripzy"],
        likes: 0,
        comments: [],
        shares: 0,
        type: 'enrollment',
        enrollmentEvent: eventTitle
      };
      
      const updatedFeed = [enrollmentPost, ...feedData];
      setFeedData(updatedFeed);
      await saveFeedPosts(updatedFeed);
      
      const existingPosts = await AsyncStorage.getItem('userPosts');
      let allUserPosts = existingPosts ? JSON.parse(existingPosts) : [];
      allUserPosts = [enrollmentPost, ...allUserPosts];
      await saveUserPosts(allUserPosts);
      
    } catch (error) {
      console.log('Error sharing enrollment post:', error);
    }
  };

  const handleEnrollEvent = async (event) => {
    if (enrolledEvents.some(e => e.id === event.id)) {
      Alert.alert('Already Enrolled', 'You have already enrolled in this event!');
      return;
    }
    
    if (event.enrolled >= event.spots) {
      Alert.alert('Event Full', 'Sorry, this event has reached maximum capacity.');
      return;
    }
    
    Alert.alert(
      'Confirm Enrollment',
      `Would you like to enroll in "${event.title}"?\n\nSpots remaining: ${event.spots - event.enrolled}\nPrice: ${event.price}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enroll', 
          onPress: async () => {
            const updatedEnrolled = [...enrolledEvents, { ...event, enrollmentDate: new Date().toISOString() }];
            setEnrolledEvents(updatedEnrolled);
            await saveEnrolledEvents(updatedEnrolled);
            
            const updatedEvents = travelEvents.map(e => {
              if (e.id === event.id) {
                return { ...e, enrolled: e.enrolled + 1 };
              }
              return e;
            });
            setTravelEvents(updatedEvents);
            await saveTravelEvents(updatedEvents);
            
            await shareEnrollmentPost(event.title);
            
            Alert.alert('Success', `You have successfully enrolled in ${event.title}! The enrollment has been shared to your feed.`);
          }
        }
      ]
    );
  };

  // Function to create a new event
  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date.trim() || !newEvent.location.trim() || !newEvent.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const createdEvent = {
      id: Date.now(),
      title: newEvent.title,
      date: newEvent.date,
      location: newEvent.location,
      description: newEvent.description,
      spots: parseInt(newEvent.spots) || 50,
      enrolled: 0,
      price: newEvent.price,
      category: newEvent.category,
      image: newEvent.eventImage || "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800",
      isUserCreated: true,
      createdBy: currentUser.name,
      createdByUsername: currentUser.username
    };

    const updatedEvents = [...travelEvents, createdEvent];
    setTravelEvents(updatedEvents);
    await saveTravelEvents(updatedEvents);

    const updatedUserEvents = [...userCreatedEvents, createdEvent];
    setUserCreatedEvents(updatedUserEvents);
    await saveUserCreatedEvents(updatedUserEvents);

    setNewEvent({
      title: '',
      date: '',
      location: '',
      description: '',
      price: 'Free',
      category: 'Workshop',
      spots: 50,
      eventImage: null
    });
    setShowCreateEventModal(false);
    Alert.alert('Success', 'Your event has been created successfully!');
  };

  // Request permissions for image picker
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Sorry, we need camera roll permissions to make this work!');
      }
    })();
    loadAllData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAllData();
      syncDeletedPosts();
      loadEnrolledEvents();
      loadUserCreatedEvents();
      loadTravelEvents();
      return () => {};
    }, [])
  );

  const loadAllData = async () => {
    await loadUserData();
    await loadUserPosts();
    await loadFeedPosts();
  };

  const loadUserData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const savedPosts = await AsyncStorage.getItem('userPosts');
      if (savedPosts) {
        const allPosts = JSON.parse(savedPosts);
        const savedUser = await AsyncStorage.getItem('currentUser');
        const currentUserInfo = savedUser ? JSON.parse(savedUser) : currentUser;
        
        const updatedPosts = allPosts.map(post => ({
          ...post,
          name: currentUserInfo.name,
          username: currentUserInfo.username,
          avatar: currentUserInfo.avatar,
          location: post.location || currentUserInfo.location
        }));
        
        const recentStoriesPosts = updatedPosts.filter(post => 
          post.image && post.type !== 'feeling' && !post.feeling && post.type !== 'enrollment'
        ).slice(0, 5);
        
        setCurrentUserPosts(recentStoriesPosts);
      } else {
        const defaultPosts = [
          {
            id: 101,
            userId: 'current',
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            location: "Paris, France",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
            caption: "The Eiffel Tower at night is absolutely magical! 🗼✨",
            hashtags: ["#Paris", "#EiffelTower"],
            likes: 234,
            comments: [],
            shares: 12,
          },
          {
            id: 102,
            userId: 'current',
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            location: "Rome, Italy",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
            caption: "Exploring the ancient Colosseum! 🏛️",
            hashtags: ["#Rome", "#Colosseum"],
            likes: 567,
            comments: [],
            shares: 34,
          },
          {
            id: 103,
            userId: 'current',
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            location: "Barcelona, Spain",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
            caption: "Beautiful architecture in Barcelona! 🏰",
            hashtags: ["#Barcelona", "#SagradaFamilia"],
            likes: 432,
            comments: [],
            shares: 23,
          },
          {
            id: 104,
            userId: 'current',
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            location: "Amsterdam, Netherlands",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800",
            caption: "Canal cruises are the best! 🚤",
            hashtags: ["#Amsterdam", "#CanalCruise"],
            likes: 345,
            comments: [],
            shares: 18,
          },
          {
            id: 105,
            userId: 'current',
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            location: "London, UK",
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
            caption: "Big Ben is stunning! 🇬🇧",
            hashtags: ["#London", "#BigBen"],
            likes: 678,
            comments: [],
            shares: 45,
          },
        ];
        setCurrentUserPosts(defaultPosts);
        await AsyncStorage.setItem('userPosts', JSON.stringify(defaultPosts));
      }
    } catch (error) {
      console.log('Error loading user posts:', error);
    }
  };

  const loadFeedPosts = async () => {
    try {
      const savedFeed = await AsyncStorage.getItem('feedPosts');
      if (savedFeed) {
        const parsedFeed = JSON.parse(savedFeed);
        const savedUser = await AsyncStorage.getItem('currentUser');
        const currentUserInfo = savedUser ? JSON.parse(savedUser) : currentUser;
        
        const updatedFeed = parsedFeed.map(post => {
          if (post.userId === 'current') {
            return {
              ...post,
              name: currentUserInfo.name,
              username: currentUserInfo.username,
              avatar: currentUserInfo.avatar,
              location: post.location || currentUserInfo.location
            };
          }
          return post;
        });
        setFeedData(updatedFeed);
      }
    } catch (error) {
      console.log('Error loading feed posts:', error);
    }
  };

  const saveFeedPosts = async (posts) => {
    try {
      await AsyncStorage.setItem('feedPosts', JSON.stringify(posts));
    } catch (error) {
      console.log('Error saving feed posts:', error);
    }
  };

  const saveUserPosts = async (posts) => {
    try {
      await AsyncStorage.setItem('userPosts', JSON.stringify(posts));
      const updatedPosts = posts.map(post => ({
        ...post,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar
      }));
      
      const recentStoriesPosts = updatedPosts.filter(post => 
        post.image && post.type !== 'feeling' && !post.feeling && post.type !== 'enrollment'
      ).slice(0, 5);
      
      setCurrentUserPosts(recentStoriesPosts);
    } catch (error) {
      console.log('Error saving user posts:', error);
    }
  };

  // Add Comment Function
  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPostForComment) return;
    
    const newComment = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      text: commentText.trim(),
      timestamp: new Date().toISOString()
    };
    
    const updatedFeed = feedData.map(post => {
      if (post.id === selectedPostForComment.id) {
        const updatedComments = [...(post.comments || []), newComment];
        return { ...post, comments: updatedComments };
      }
      return post;
    });
    
    setFeedData(updatedFeed);
    await saveFeedPosts(updatedFeed);
    
    // Also update user posts if it's current user's post
    if (selectedPostForComment.userId === 'current') {
      const updatedUserPosts = currentUserPosts.map(post => {
        if (post.id === selectedPostForComment.id) {
          const updatedComments = [...(post.comments || []), newComment];
          return { ...post, comments: updatedComments };
        }
        return post;
      });
      setCurrentUserPosts(updatedUserPosts);
      
      const allUserPosts = await AsyncStorage.getItem('userPosts');
      if (allUserPosts) {
        const parsed = JSON.parse(allUserPosts);
        const updatedAll = parsed.map(post => {
          if (post.id === selectedPostForComment.id) {
            const updatedComments = [...(post.comments || []), newComment];
            return { ...post, comments: updatedComments };
          }
          return post;
        });
        await AsyncStorage.setItem('userPosts', JSON.stringify(updatedAll));
      }
    }
    
    setCommentText('');
    setCommentModalVisible(false);
    setSelectedPostForComment(null);
    Alert.alert('Success', 'Comment added successfully');
  };

  // Share Post Function
  const handleSharePost = async () => {
    if (!selectedPostForShare) return;
    
    const sharePost = {
      id: Date.now(),
      userId: 'current',
      name: currentUser.name,
      username: currentUser.username,
      avatar: currentUser.avatar,
      location: currentUser.location,
      timestamp: new Date().toISOString(),
      image: selectedPostForShare.image,
      caption: shareMessage || `Shared: ${selectedPostForShare.caption}`,
      originalPost: {
        id: selectedPostForShare.id,
        name: selectedPostForShare.name,
        caption: selectedPostForShare.caption
      },
      likes: 0,
      comments: [],
      shares: 0,
      type: 'share'
    };
    
    const updatedFeed = [sharePost, ...feedData];
    setFeedData(updatedFeed);
    await saveFeedPosts(updatedFeed);
    
    const existingPosts = await AsyncStorage.getItem('userPosts');
    let allUserPosts = existingPosts ? JSON.parse(existingPosts) : [];
    allUserPosts = [sharePost, ...allUserPosts];
    await saveUserPosts(allUserPosts);
    
    setShareModalVisible(false);
    setSelectedPostForShare(null);
    setShareMessage('');
    Alert.alert('Success', 'Post shared successfully');
  };

  // Function to pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Function to add hashtag
  const addHashtag = () => {
    let tag = hashtagInput.trim();
    if (!tag) return;
    
    if (!tag.startsWith('#')) {
      tag = '#' + tag;
    }
    
    tag = tag.replace(/\s/g, '');
    
    if (postHashtags.includes(tag)) {
      Alert.alert('Duplicate', 'This hashtag already added');
      return;
    }
    
    if (postHashtags.length >= 10) {
      Alert.alert('Limit Reached', 'You can add maximum 10 hashtags');
      return;
    }
    
    setPostHashtags([...postHashtags, tag]);
    setHashtagInput('');
  };

  const removeHashtag = (tagToRemove) => {
    setPostHashtags(postHashtags.filter(tag => tag !== tagToRemove));
  };

  // Function to select location
  const selectLocation = (location) => {
    setSelectedLocation(location);
    setCustomLocation('');
    setShowCheckInModal(false);
  };

  const saveCustomLocation = () => {
    if (customLocation.trim()) {
      setSelectedLocation(customLocation.trim());
      setCustomLocation('');
      setShowCheckInModal(false);
    } else {
      Alert.alert('Error', 'Please enter a location');
    }
  };

  // Function to delete a post from feed
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
            try {
              const updatedFeed = feedData.filter(post => post.id !== postId);
              setFeedData(updatedFeed);
              await saveFeedPosts(updatedFeed);
              
              const userPostsData = await AsyncStorage.getItem('userPosts');
              if (userPostsData) {
                const parsedUserPosts = JSON.parse(userPostsData);
                const updatedUserPosts = parsedUserPosts.filter(post => post.id !== postId);
                await AsyncStorage.setItem('userPosts', JSON.stringify(updatedUserPosts));
                
                const updatedCurrentPosts = updatedUserPosts
                  .filter(post => post.image && post.type !== 'feeling' && !post.feeling && post.type !== 'enrollment')
                  .slice(0, 5);
                setCurrentUserPosts(updatedCurrentPosts);
              }
              
              Alert.alert('Success', 'Post deleted successfully');
            } catch (error) {
              console.log('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const handleLike = (id, isCurrentUserPost = false) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(likedPosts.filter(postId => postId !== id));
      if (isCurrentUserPost) {
        const updatedPosts = currentUserPosts.map(post => 
          post.id === id ? { ...post, likes: post.likes - 1 } : post
        );
        setCurrentUserPosts(updatedPosts);
        const updateStorage = async () => {
          const allPosts = await AsyncStorage.getItem('userPosts');
          if (allPosts) {
            const parsed = JSON.parse(allPosts);
            const updated = parsed.map(post =>
              post.id === id ? { ...post, likes: post.likes - 1 } : post
            );
            await AsyncStorage.setItem('userPosts', JSON.stringify(updated));
          }
        };
        updateStorage();
      } else {
        const updatedFeed = feedData.map(post => 
          post.id === id ? { ...post, likes: post.likes - 1 } : post
        );
        setFeedData(updatedFeed);
        saveFeedPosts(updatedFeed);
      }
    } else {
      setLikedPosts([...likedPosts, id]);
      if (isCurrentUserPost) {
        const updatedPosts = currentUserPosts.map(post => 
          post.id === id ? { ...post, likes: post.likes + 1 } : post
        );
        setCurrentUserPosts(updatedPosts);
        const updateStorage = async () => {
          const allPosts = await AsyncStorage.getItem('userPosts');
          if (allPosts) {
            const parsed = JSON.parse(allPosts);
            const updated = parsed.map(post =>
              post.id === id ? { ...post, likes: post.likes + 1 } : post
            );
            await AsyncStorage.setItem('userPosts', JSON.stringify(updated));
          }
        };
        updateStorage();
      } else {
        const updatedFeed = feedData.map(post => 
          post.id === id ? { ...post, likes: post.likes + 1 } : post
        );
        setFeedData(updatedFeed);
        saveFeedPosts(updatedFeed);
      }
    }
  };

  const handleCreatePost = async () => {
    if (!postText.trim() && !selectedImage) {
      Alert.alert('Error', 'Please add a caption or image');
      return;
    }

    setIsCreating(true);

    try {
      const newPost = {
        id: Date.now(),
        userId: 'current',
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
        location: selectedLocation || currentUser.location,
        timestamp: new Date().toISOString(),
        image: selectedImage || "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800",
        caption: postText.trim() || "Shared a photo",
        hashtags: postHashtags,
        likes: 0,
        comments: [],
        shares: 0,
      };
      
      const updatedFeed = [newPost, ...feedData];
      setFeedData(updatedFeed);
      await saveFeedPosts(updatedFeed);
      
      const existingPosts = await AsyncStorage.getItem('userPosts');
      let allUserPosts = existingPosts ? JSON.parse(existingPosts) : [];
      allUserPosts = [newPost, ...allUserPosts];
      
      await saveUserPosts(allUserPosts);
      
      setPostText('');
      setSelectedImage(null);
      setSelectedLocation('');
      setPostHashtags([]);
      setModalVisible(false);
      
      Alert.alert('Success', 'Your travel story has been shared!');
    } catch (error) {
      console.log('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setIsCreating(false);
    }
  };

  const navigateToProfile = () => {
    router.push('/app-pages/feedProfile');
  };

  const navigateToFeeling = () => {
    router.push('/app-pages/feedFeeling');
  };

  const syncDeletedPosts = async () => {
    try {
      const userPostsData = await AsyncStorage.getItem('userPosts');
      if (!userPostsData) return;
      
      const currentUserPostsList = JSON.parse(userPostsData);
      const currentUserPostIds = currentUserPostsList.map(post => post.id);
      
      const syncedFeedData = feedData.filter(post => {
        if (post.userId !== 'current') return true;
        return currentUserPostIds.includes(post.id);
      });
      
      if (syncedFeedData.length !== feedData.length) {
        setFeedData(syncedFeedData);
        await saveFeedPosts(syncedFeedData);
      }
    } catch (error) {
      console.log('Error syncing deleted posts:', error);
    }
  };

  // Options Menu Handlers
  const openOptionsMenu = (post) => {
    setSelectedPostForOptions(post);
    setOptionsModalVisible(true);
  };

  const handleReportPost = () => {
    Alert.alert(
      'Report Post',
      'Why are you reporting this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Spam', onPress: () => Alert.alert('Reported', 'Thank you for reporting spam') },
        { text: 'Harassment', onPress: () => Alert.alert('Reported', 'Thank you for reporting harassment') },
        { text: 'Inappropriate Content', onPress: () => Alert.alert('Reported', 'Thank you for reporting inappropriate content') },
        { text: 'Misinformation', onPress: () => Alert.alert('Reported', 'Thank you for reporting misinformation') }
      ]
    );
    setOptionsModalVisible(false);
  };

  const handleSavePost = async () => {
    if (!selectedPostForOptions) return;
    
    try {
      const savedPosts = await AsyncStorage.getItem('savedPosts');
      let savedPostsList = savedPosts ? JSON.parse(savedPosts) : [];
      
      // Check if already saved
      const alreadySaved = savedPostsList.some(p => p.id === selectedPostForOptions.id);
      if (alreadySaved) {
        Alert.alert('Info', 'Post already saved');
        setOptionsModalVisible(false);
        return;
      }
      
      // Add to saved posts
      const postToSave = {
        id: selectedPostForOptions.id,
        name: selectedPostForOptions.name,
        username: selectedPostForOptions.username,
        avatar: selectedPostForOptions.avatar,
        location: selectedPostForOptions.location,
        image: selectedPostForOptions.image,
        caption: selectedPostForOptions.caption,
        likes: selectedPostForOptions.likes,
        timestamp: selectedPostForOptions.timestamp,
        savedAt: new Date().toISOString()
      };
      
      savedPostsList.unshift(postToSave);
      await AsyncStorage.setItem('savedPosts', JSON.stringify(savedPostsList));
      Alert.alert('Saved', 'Post saved to your collection');
    } catch (error) {
      console.log('Error saving post:', error);
      Alert.alert('Error', 'Failed to save post');
    }
    setOptionsModalVisible(false);
  };

  const handleCopyLink = () => {
    Alert.alert('Link Copied', 'Post link copied to clipboard');
    setOptionsModalVisible(false);
  };

  const handleViewProfile = () => {
    navigateToProfile();
    setOptionsModalVisible(false);
  };

  const handleNotInterested = () => {
    Alert.alert('Noted', "We'll show fewer posts like this");
    setOptionsModalVisible(false);
  };

  const renderEventItem = ({ item }) => {
    const isEnrolled = enrolledEvents.some(e => e.id === item.id);
    const spotsLeft = item.spots - item.enrolled;
    const isUserEvent = item.isUserCreated;
    const isCurrentUserEvent = item.createdByUsername === currentUser.username;
    
    return (
      <View style={styles.eventCard}>
        <Image source={{ uri: item.image }} style={styles.eventImage} />
        <View style={styles.eventOverlay}>
          <View style={styles.eventCategory}>
            <Text style={styles.eventCategoryText}>{item.category}</Text>
          </View>
          {isUserEvent && isCurrentUserEvent && (
            <TouchableOpacity 
              style={[styles.eventCategory, { backgroundColor: '#dc3545', marginTop: 5 }]}
              onPress={() => handleDeleteEvent(item.id)}
            >
              <Text style={styles.eventCategoryText}>🗑️ Delete Event</Text>
            </TouchableOpacity>
          )}
          {isUserEvent && !isCurrentUserEvent && (
            <View style={[styles.eventCategory, { backgroundColor: '#28a745', marginTop: 5 }]}>
              <Text style={styles.eventCategoryText}>Created by {item.createdBy}</Text>
            </View>
          )}
        </View>
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <View style={styles.eventDetail}>
            <Text style={styles.eventDetailIcon}>📅</Text>
            <Text style={styles.eventDetailText}>{item.date}</Text>
          </View>
          <View style={styles.eventDetail}>
            <Text style={styles.eventDetailIcon}>📍</Text>
            <Text style={styles.eventDetailText}>{item.location}</Text>
          </View>
          <View style={styles.eventDetail}>
            <Text style={styles.eventDetailIcon}>💰</Text>
            <Text style={styles.eventDetailText}>{item.price}</Text>
          </View>
          <View style={styles.eventDetail}>
            <Text style={styles.eventDetailIcon}>👥</Text>
            <Text style={styles.eventDetailText}>{spotsLeft} spots left</Text>
          </View>
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.eventButtonContainer}>
            <TouchableOpacity 
              style={[styles.enrollButton, isEnrolled && styles.leaveButton]}
              onPress={() => isEnrolled ? handleDeleteEnrollment(item.id) : handleEnrollEvent(item)}
            >
              <Text style={styles.enrollButtonText}>
                {isEnrolled ? '✓ Enrolled • Cancel' : '✈️ Enroll Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderFeedItem = ({ item }) => {
    const isLiked = likedPosts.includes(item.id);
    const isCurrentUserPost = item.userId === 'current';
    const isFeelingPost = item.type === 'feeling' || (!item.image && item.feeling);
    const isEnrollmentPost = item.type === 'enrollment';
    const isSharePost = item.type === 'share';
    const commentCount = item.comments?.length || 0;
    
    // Special design for enrollment posts
    if (isEnrollmentPost) {
      return (
        <View style={styles.enrollmentPostCard}>
          <View style={styles.postHeader}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.postHeaderInfo}>
              <Text style={styles.postName}>{item.name}</Text>
              <Text style={styles.postUsername}>@{item.username}</Text>
              <View style={styles.locationTimeContainer}>
                <Text style={styles.postLocation}>📍 {item.location}</Text>
                <Text style={styles.postTime}> • {formatDateTime(item.timestamp)}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              {isCurrentUserPost && (
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleDeletePost(item.id)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => openOptionsMenu(item)}>
                <Text style={styles.moreIcon}>•••</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.enrollmentHighlight}>
            <View style={styles.enrollmentIconContainer}>
              <Text style={styles.enrollmentIcon}>🎉</Text>
            </View>
            <View style={styles.enrollmentTextContainer}>
              <View style={styles.enrollmentBadge}>
                <Text style={styles.enrollmentBadgeText}>NEW ENROLLMENT!</Text>
              </View>
              <Text style={styles.enrollmentMessage}>{item.caption}</Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.likesContainer}>
              <View style={styles.likeIconBackground}>
                <Text style={styles.likeIcon}>👍</Text>
              </View>
              <Text style={styles.statsText}>{item.likes + (isLiked ? 1 : 0)}</Text>
            </View>
            <TouchableOpacity onPress={() => {
              setSelectedPostForComment(item);
              setCommentModalVisible(true);
            }}>
              <Text style={styles.statsText}>{commentCount} comments</Text>
            </TouchableOpacity>
            <Text style={styles.statsText}>{item.shares} shares</Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, isLiked && styles.actionButtonActive]} 
              onPress={() => handleLike(item.id, isCurrentUserPost)}
            >
              <Text style={[styles.actionButtonText, isLiked && styles.actionButtonTextActive]}>
                {isLiked ? '❤️' : '👍'} Like
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setSelectedPostForComment(item);
                setCommentModalVisible(true);
              }}
            >
              <Text style={styles.actionButtonText}>💬 Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setSelectedPostForShare(item);
                setShareModalVisible(true);
              }}
            >
              <Text style={styles.actionButtonText}>↗️ Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.feedItem}>
        <View style={styles.postHeader}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.postHeaderInfo}>
            <Text style={styles.postName}>{item.name}</Text>
            <Text style={styles.postUsername}>@{item.username}</Text>
            <View style={styles.locationTimeContainer}>
              <Text style={styles.postLocation}>📍 {item.location}</Text>
              <Text style={styles.postTime}> • {formatDateTime(item.timestamp)}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {isCurrentUserPost && (
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDeletePost(item.id)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => openOptionsMenu(item)}>
              <Text style={styles.moreIcon}>•••</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.caption}>{item.caption}</Text>
        
        {isSharePost && item.originalPost && (
          <View style={styles.sharedPostContainer}>
            <Text style={styles.sharedPostLabel}>🔁 Shared from {item.originalPost.name}</Text>
            <Text style={styles.sharedPostCaption}>"{item.originalPost.caption}"</Text>
          </View>
        )}
        
        {item.hashtags && item.hashtags.length > 0 && (
          <View style={styles.hashtagsContainer}>
            {item.hashtags.map((tag, index) => (
              <Text key={index} style={styles.hashtag}>{tag}</Text>
            ))}
          </View>
        )}
        
        {!isFeelingPost && item.image && (
          <Image source={{ uri: item.image }} style={styles.postImage} />
        )}
        
        {isFeelingPost && item.feeling && (
          <View style={[styles.feelingBadge, { backgroundColor: item.feeling.bgColor || '#FFF9C4' }]}>
            <Text style={styles.feelingBadgeEmoji}>{item.feeling.emoji}</Text>
            <Text style={styles.feelingBadgeText}>Feeling {item.feeling.name}</Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.likesContainer}>
            <View style={styles.likeIconBackground}>
              <Text style={styles.likeIcon}>👍</Text>
            </View>
            <Text style={styles.statsText}>{item.likes + (isLiked ? 1 : 0)}</Text>
          </View>
          <TouchableOpacity onPress={() => {
            setSelectedPostForComment(item);
            setCommentModalVisible(true);
          }}>
            <Text style={styles.statsText}>{commentCount} comments</Text>
          </TouchableOpacity>
          <Text style={styles.statsText}>{item.shares} shares</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.actionButtonActive]} 
            onPress={() => handleLike(item.id, isCurrentUserPost)}
          >
            <Text style={[styles.actionButtonText, isLiked && styles.actionButtonTextActive]}>
              {isLiked ? '❤️' : '👍'} Like
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setSelectedPostForComment(item);
              setCommentModalVisible(true);
            }}
          >
            <Text style={styles.actionButtonText}>💬 Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setSelectedPostForShare(item);
              setShareModalVisible(true);
            }}
          >
            <Text style={styles.actionButtonText}>↗️ Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
      {/* Comment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => {
          setCommentModalVisible(false);
          setSelectedPostForComment(null);
          setCommentText('');
        }}
      >
        <View style={styles.commentModalOverlay}>
          <View style={styles.commentModalContainer}>
            <View style={styles.commentModalHeader}>
              <Text style={styles.commentModalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => {
                setCommentModalVisible(false);
                setSelectedPostForComment(null);
                setCommentText('');
              }}>
                <Text style={styles.commentModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.commentsList}>
              {selectedPostForComment?.comments?.length > 0 ? (
                selectedPostForComment.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUserName}>{comment.userName}</Text>
                      <Text style={styles.commentTime}>{formatDateTime(comment.timestamp)}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.noCommentsContainer}>
                  <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity 
                style={[styles.commentSendButton, !commentText.trim() && styles.commentSendButtonDisabled]}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Text style={styles.commentSendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => {
          setShareModalVisible(false);
          setSelectedPostForShare(null);
          setShareMessage('');
        }}
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContainer}>
            <View style={styles.shareModalHeader}>
              <Text style={styles.shareModalTitle}>Share Post</Text>
              <TouchableOpacity onPress={() => {
                setShareModalVisible(false);
                setSelectedPostForShare(null);
                setShareMessage('');
              }}>
                <Text style={styles.shareModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.sharePreview}>
              <Text style={styles.sharePreviewLabel}>Original post by {selectedPostForShare?.name}</Text>
              <Text style={styles.sharePreviewCaption}>{selectedPostForShare?.caption}</Text>
            </View>
            
            <TextInput
              style={styles.shareInput}
              placeholder="Add your thoughts (optional)..."
              value={shareMessage}
              onChangeText={setShareMessage}
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity style={styles.sharePostButton} onPress={handleSharePost}>
              <Text style={styles.sharePostButtonText}>Share Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Options Modal - Three Dots Menu */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.optionsModalOverlay} 
          activeOpacity={1} 
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={styles.optionsModalContainer}>
            <View style={styles.optionsModalHeader}>
              <Text style={styles.optionsModalTitle}>Post Options</Text>
              <TouchableOpacity onPress={() => setOptionsModalVisible(false)}>
                <Text style={styles.optionsModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.optionItem} onPress={handleSavePost}>
              <Text style={styles.optionIcon}>🔖</Text>
              <View>
                <Text style={styles.optionTitle}>Save Post</Text>
                <Text style={styles.optionDescription}>Add to your saved collection</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={handleCopyLink}>
              <Text style={styles.optionIcon}>🔗</Text>
              <View>
                <Text style={styles.optionTitle}>Copy Link</Text>
                <Text style={styles.optionDescription}>Copy post link to clipboard</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={handleViewProfile}>
              <Text style={styles.optionIcon}>👤</Text>
              <View>
                <Text style={styles.optionTitle}>View Profile</Text>
                <Text style={styles.optionDescription}>Go to {selectedPostForOptions?.name}'s profile</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={handleNotInterested}>
              <Text style={styles.optionIcon}>🙅</Text>
              <View>
                <Text style={styles.optionTitle}>Not Interested</Text>
                <Text style={styles.optionDescription}>See fewer posts like this</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={handleReportPost}>
              <Text style={styles.optionIcon}>🚩</Text>
              <View>
                <Text style={styles.optionTitle}>Report Post</Text>
                <Text style={styles.optionDescription}>Report inappropriate content</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Travel Feed</Text>
          <Text style={styles.headerSubtitle}>Welcome, @{currentUser.username}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon} onPress={navigateToProfile}>
            <Image source={{ uri: currentUser.avatar }} style={styles.profileIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Events Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEventsModal}
        onRequestClose={() => setShowEventsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.eventsModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✈️ Travel Events & Community</Text>
              <TouchableOpacity onPress={() => setShowEventsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.createEventButton}
              onPress={() => {
                setShowEventsModal(false);
                setShowCreateEventModal(true);
              }}
            >
              <Text style={styles.createEventButtonText}>➕ Create Your Own Event</Text>
            </TouchableOpacity>
            
            {enrolledEvents.length > 0 && (
              <View style={styles.myEnrollmentsSection}>
                <Text style={styles.myEnrollmentsTitle}>📌 My Enrollments ({enrolledEvents.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {enrolledEvents.map((event) => (
                    <View key={event.id} style={styles.enrollmentChip}>
                      <Text style={styles.enrollmentChipText}>{event.title.substring(0, 20)}...</Text>
                      <TouchableOpacity onPress={() => handleDeleteEnrollment(event.id)}>
                        <Text style={styles.enrollmentChipDelete}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            
            <Text style={styles.modalSubtitle}>Upcoming Events</Text>
            <FlatList
              data={travelEvents}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderEventItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.eventsList}
            />
          </View>
        </View>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCreateEventModal}
        onRequestClose={() => setShowCreateEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createEventModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Event</Text>
              <TouchableOpacity onPress={() => setShowCreateEventModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Event Image (Optional)</Text>
              <TouchableOpacity style={styles.imagePickerButton} onPress={pickEventImage}>
                {newEvent.eventImage ? (
                  <Image source={{ uri: newEvent.eventImage }} style={styles.eventImagePreview} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Text style={styles.imagePickerIcon}>📷</Text>
                    <Text style={styles.imagePickerText}>Tap to add event image</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>Event Title *</Text>
              <TextInput
                style={styles.eventInput}
                placeholder="Enter event title"
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({...newEvent, title: text})}
              />
              
              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput
                style={styles.eventInput}
                placeholder="e.g., December 15-17, 2024"
                value={newEvent.date}
                onChangeText={(text) => setNewEvent({...newEvent, date: text})}
              />
              
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.eventInput}
                placeholder="Enter location"
                value={newEvent.location}
                onChangeText={(text) => setNewEvent({...newEvent, location: text})}
              />
              
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.eventInput, styles.textArea]}
                placeholder="Describe your event"
                multiline
                numberOfLines={3}
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({...newEvent, description: text})}
              />
              
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categorySelect, newEvent.category === cat && styles.categorySelectActive]}
                    onPress={() => setNewEvent({...newEvent, category: cat})}
                  >
                    <Text style={[styles.categorySelectText, newEvent.category === cat && styles.categorySelectTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <Text style={styles.inputLabel}>Price</Text>
              <TextInput
                style={styles.eventInput}
                placeholder="e.g., Free, $49, $199"
                value={newEvent.price}
                onChangeText={(text) => setNewEvent({...newEvent, price: text})}
              />
              
              <Text style={styles.inputLabel}>Available Spots</Text>
              <TextInput
                style={styles.eventInput}
                placeholder="Number of spots"
                keyboardType="numeric"
                value={newEvent.spots.toString()}
                onChangeText={(text) => setNewEvent({...newEvent, spots: parseInt(text) || 0})}
              />
              
              <TouchableOpacity style={styles.submitEventButton} onPress={handleCreateEvent}>
                <Text style={styles.submitEventButtonText}>Create Event</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Check-In Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCheckInModal}
        onRequestClose={() => setShowCheckInModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkInModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Check In</Text>
              <TouchableOpacity onPress={() => setShowCheckInModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>Popular Locations</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationsScroll}>
              {popularLocations.map((location, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.locationChip}
                  onPress={() => selectLocation(location)}
                >
                  <Text style={styles.locationChipText}>📍 {location}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.modalSubtitle}>Or enter custom location</Text>
            <TextInput
              style={styles.checkInInput}
              placeholder="Enter location name..."
              placeholderTextColor="#999"
              value={customLocation}
              onChangeText={setCustomLocation}
            />
            <TouchableOpacity style={styles.saveLocationButton} onPress={saveCustomLocation}>
              <Text style={styles.saveLocationButtonText}>Save Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Hashtag Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHashtagModal}
        onRequestClose={() => setShowHashtagModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.hashtagModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Hashtags</Text>
              <TouchableOpacity onPress={() => setShowHashtagModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.hashtagInputContainer}>
              <TextInput
                style={styles.hashtagInput}
                placeholder="Enter hashtag (e.g., travel or #travel)"
                placeholderTextColor="#999"
                value={hashtagInput}
                onChangeText={setHashtagInput}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.addHashtagButton} onPress={addHashtag}>
                <Text style={styles.addHashtagButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            {postHashtags.length > 0 && (
              <View style={styles.selectedHashtagsContainer}>
                <Text style={styles.selectedHashtagsTitle}>Selected Hashtags:</Text>
                <View style={styles.hashtagsList}>
                  {postHashtags.map((tag, index) => (
                    <View key={index} style={styles.selectedHashtagItem}>
                      <Text style={styles.selectedHashtagText}>{tag}</Text>
                      <TouchableOpacity onPress={() => removeHashtag(tag)}>
                        <Text style={styles.removeHashtagText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
            <Text style={styles.hashtagTip}>Tip: Hashtags help others discover your travel posts!</Text>
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowHashtagModal(false)}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setPostText('');
          setSelectedImage(null);
          setSelectedLocation('');
          setPostHashtags([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setPostText('');
                setSelectedImage(null);
                setSelectedLocation('');
                setPostHashtags([]);
              }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalUserInfo}>
              <Image source={{ uri: currentUser.avatar }} style={styles.modalAvatar} />
              <View>
                <Text style={styles.modalUserName}>{currentUser.name}</Text>
                <Text style={styles.modalUserUsername}>@{currentUser.username}</Text>
              </View>
            </View>
            
            {selectedLocation && (
              <View style={styles.selectedInfoContainer}>
                <Text style={styles.selectedInfoLabel}>📍 Location:</Text>
                <Text style={styles.selectedInfoText}>{selectedLocation}</Text>
                <TouchableOpacity onPress={() => setSelectedLocation('')}>
                  <Text style={styles.removeInfoText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {postHashtags.length > 0 && (
              <View style={styles.selectedInfoContainer}>
                <Text style={styles.selectedInfoLabel}>🏷️ Hashtags:</Text>
                <View style={styles.selectedHashtagsPreview}>
                  {postHashtags.slice(0, 3).map((tag, index) => (
                    <Text key={index} style={styles.previewHashtag}>{tag}</Text>
                  ))}
                  {postHashtags.length > 3 && (
                    <Text style={styles.moreHashtags}>+{postHashtags.length - 3}</Text>
                  )}
                </View>
              </View>
            )}
            
            <TextInput
              style={styles.modalInput}
              placeholder="What's on your mind? Share your travel experience..."
              multiline
              numberOfLines={4}
              value={postText}
              onChangeText={setPostText}
              placeholderTextColor="#999"
            />
            
            {selectedImage && (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.modalImageOptions}>
              <TouchableOpacity style={styles.imageOptionButton} onPress={pickImage}>
                <Text style={styles.imageOptionText}>📷 Add Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageOptionButton} onPress={() => setShowCheckInModal(true)}>
                <Text style={styles.imageOptionText}>📍 Check In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageOptionButton} onPress={() => setShowHashtagModal(true)}>
                <Text style={styles.imageOptionText}>#️⃣ Add Hashtag</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.postButton, (!postText.trim() && !selectedImage) && styles.postButtonDisabled]}
              onPress={handleCreatePost}
              disabled={!postText.trim() && !selectedImage || isCreating}
            >
              <Text style={styles.postButtonText}>
                {isCreating ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        data={feedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFeedItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.createPostCard}>
              <View style={styles.createPostTop}>
                <Image source={{ uri: currentUser.avatar }} style={styles.createPostAvatar} />
                <TouchableOpacity 
                  style={styles.createPostInput}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.createPostPlaceholder}>What's on your mind, {currentUser.name}?</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.createPostDivider} />
              
              <View style={styles.createPostActions}>
                <TouchableOpacity style={styles.createPostAction} onPress={() => setShowEventsModal(true)}>
                  <Text style={styles.eventsIcon}>✈️</Text>
                  <Text style={styles.createPostActionText}>Events</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.createPostAction} onPress={() => setModalVisible(true)}>
                  <Text style={styles.photoIcon}>🖼️</Text>
                  <Text style={styles.createPostActionText}>Uploads</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.createPostAction} onPress={navigateToFeeling}>
                  <Text style={styles.feelingIcon}>😊</Text>
                  <Text style={styles.createPostActionText}>Feeling</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Your Recent Stories Section - UPDATED WITH CAPTION */}
            {currentUserPosts.length > 0 && (
              <View style={styles.recentStoriesSection}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Your Recent Stories</Text>
                    <Text style={styles.sectionSubtitle}>Your latest travel moments</Text>
                  </View>
                  <TouchableOpacity onPress={navigateToProfile}>
                    <Text style={styles.seeAllButton}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScrollView}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {currentUserPosts.map((item) => (
                    <TouchableOpacity 
                      key={item.id}
                      style={styles.smallStoryCard}
                      onPress={navigateToProfile}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: item.image }} style={styles.smallStoryImage} />
                      <View style={styles.smallStoryOverlay}>
                        <View style={styles.smallStoryBadge}>
                          <Text style={styles.smallStoryBadgeText}>Your Story</Text>
                        </View>
                      </View>
                      <View style={styles.smallStoryFooter}>
                        <Text style={styles.smallStoryName} numberOfLines={1}>
                          {currentUser.name}
                        </Text>
                        {/* Caption added here */}
                        {item.caption && (
                          <Text style={styles.smallStoryCaption} numberOfLines={2}>
                            {item.caption}
                          </Text>
                        )}
                        <Text style={styles.smallStoryTime}>{formatDateTime(item.timestamp)}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Profile Banner */}
            <TouchableOpacity style={styles.profileBanner} onPress={navigateToProfile}>
              <View style={styles.profileBannerLeft}>
                <Image source={{ uri: currentUser.avatar }} style={styles.profileBannerAvatar} />
                <View>
                  <Text style={styles.profileBannerName}>{currentUser.name}</Text>
                  <Text style={styles.profileBannerUsername}>@{currentUser.username}</Text>
                  <Text style={styles.profileBannerStats}>{currentUserPosts.length} recent posts • {currentUser.followers} followers</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.viewProfileButton} onPress={navigateToProfile}>
                <Text style={styles.viewProfileButtonText}>View Profile</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Feed Title */}
            <View style={styles.feedTitleContainer}>
              <Text style={styles.sectionTitle}>Discover Travel Posts</Text>
              <TouchableOpacity>
                <Text style={styles.sortButton}>Sort by Latest</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (keep all existing styles, add these new ones for options modal)
  
  // Options Modal Styles
  optionsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '85%',
    maxWidth: 350,
    overflow: 'hidden',
  },
  optionsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  optionsModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  optionsModalClose: {
    fontSize: 20,
    color: '#65676b',
    fontWeight: 'bold',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#65676b',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginBottom: 72,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1877f2',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  headerIcon: {
    padding: 4,
  },
  profileIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  backButton: {
    fontSize: 20,
    color: '#1877f2',
    fontWeight: '600',
  },
  createPostCard: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  createPostTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  createPostInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createPostPlaceholder: {
    fontSize: 16,
    color: '#65676b',
  },
  createPostDivider: {
    height: 1,
    backgroundColor: '#e4e6eb',
    marginVertical: 8,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  createPostAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  eventsIcon: { fontSize: 20, marginRight: 8 },
  photoIcon: { fontSize: 20, marginRight: 8 },
  feelingIcon: { fontSize: 20, marginRight: 8 },
  createPostActionText: {
    fontSize: 14,
    color: '#65676b',
    fontWeight: '500',
  },
  recentStoriesSection: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
  },
  seeAllButton: {
    fontSize: 14,
    color: '#1877f2',
    fontWeight: '600',
  },
  horizontalScrollView: {
    paddingLeft: 16,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  smallStoryCard: {
    width: 130,
    height: 180, // Increased height to accommodate caption
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 5,
  },
  smallStoryImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  smallStoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  smallStoryBadge: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  smallStoryBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
  },
  smallStoryFooter: {
    padding: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60, // Changed from fixed 40 to minHeight 60 to accommodate caption
  },
  smallStoryName: {
    fontSize: 12,
    color: '#1c1e21',
    fontWeight: '600',
    textAlign: 'center',
  },
  // New style for caption in recent stories
  smallStoryCaption: {
    fontSize: 10,
    color: '#65676b',
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  smallStoryTime: {
    fontSize: 9,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
  },
  profileBanner: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileBannerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileBannerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  profileBannerUsername: {
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
  },
  profileBannerStats: {
    fontSize: 11,
    color: '#65676b',
    marginTop: 2,
  },
  viewProfileButton: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewProfileButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  feedTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    marginBottom: 1,
  },
  sortButton: {
    fontSize: 14,
    color: '#1877f2',
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
    minHeight: 500,
  },
  eventsModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  createEventModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  checkInModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  hashtagModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 450,
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
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
    marginTop: 16,
    marginBottom: 12,
  },
  createEventButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  createEventButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  myEnrollmentsSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
  },
  myEnrollmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 10,
  },
  enrollmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1877f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  enrollmentChipText: {
    color: '#ffffff',
    fontSize: 12,
    marginRight: 6,
  },
  enrollmentChipDelete: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  eventsList: {
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e4e6eb',
  },
  eventImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  eventOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  eventCategory: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  eventCategoryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  eventContent: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  eventDetailText: {
    fontSize: 12,
    color: '#65676b',
  },
  eventDescription: {
    fontSize: 13,
    color: '#65676b',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 12,
  },
  eventButtonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  enrollButton: {
    flex: 1,
    backgroundColor: '#1877f2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButton: {
    backgroundColor: '#dc3545',
  },
  enrollButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
    marginTop: 12,
    marginBottom: 6,
  },
  eventInput: {
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1c1e21',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categorySelect: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categorySelectActive: {
    backgroundColor: '#1877f2',
  },
  categorySelectText: {
    fontSize: 13,
    color: '#65676b',
  },
  categorySelectTextActive: {
    color: '#ffffff',
  },
  submitEventButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitEventButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePickerButton: {
    marginBottom: 16,
  },
  imagePickerPlaceholder: {
    height: 150,
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderStyle: 'dashed',
  },
  imagePickerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  imagePickerText: {
    fontSize: 14,
    color: '#65676b',
  },
  eventImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  locationsScroll: {
    marginBottom: 16,
  },
  locationChip: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  locationChipText: {
    fontSize: 13,
    color: '#1c1e21',
  },
  checkInInput: {
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1c1e21',
    marginBottom: 16,
  },
  saveLocationButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveLocationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  hashtagInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  hashtagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1c1e21',
    marginRight: 12,
  },
  addHashtagButton: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addHashtagButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedHashtagsContainer: {
    marginBottom: 20,
  },
  selectedHashtagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 8,
  },
  hashtagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedHashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e4e6eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedHashtagText: {
    fontSize: 13,
    color: '#1c1e21',
    marginRight: 6,
  },
  removeHashtagText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  hashtagTip: {
    fontSize: 12,
    color: '#65676b',
    marginBottom: 20,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  selectedInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1c1e21',
    marginRight: 8,
  },
  selectedInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#65676b',
  },
  removeInfoText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  selectedHashtagsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  previewHashtag: {
    fontSize: 12,
    color: '#1877f2',
    marginRight: 6,
  },
  moreHashtags: {
    fontSize: 12,
    color: '#65676b',
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  },
  modalUserUsername: {
    fontSize: 12,
    color: '#65676b',
  },
  modalInput: {
    fontSize: 16,
    color: '#1c1e21',
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 12,
    padding: 12,
  },
  selectedImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  selectedImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalImageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  imageOptionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  imageOptionText: {
    fontSize: 14,
    color: '#1877f2',
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  postButtonDisabled: {
    backgroundColor: '#e4e6eb',
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedItem: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  enrollmentPostCard: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  enrollmentHighlight: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
  },
  enrollmentIconContainer: {
    marginRight: 12,
  },
  enrollmentIcon: {
    fontSize: 32,
  },
  enrollmentTextContainer: {
    flex: 1,
  },
  enrollmentBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  enrollmentBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  enrollmentMessage: {
    fontSize: 14,
    color: '#1c1e21',
    lineHeight: 20,
  },
  postHeader: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
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
  locationTimeContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  postLocation: {
    fontSize: 12,
    color: '#65676b',
  },
  postTime: {
    fontSize: 12,
    color: '#65676b',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    paddingHorizontal: 8,
  },
  deleteIcon: {
    fontSize: 18,
    color: '#ff4444',
  },
  moreIcon: {
    fontSize: 16,
    color: '#65676b',
    paddingHorizontal: 4,
  },
  caption: {
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
    height: 400,
    resizeMode: 'cover',
  },
  sharedPostContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  sharedPostLabel: {
    fontSize: 12,
    color: '#1877f2',
    marginBottom: 4,
  },
  sharedPostCaption: {
    fontSize: 13,
    color: '#65676b',
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
  statsContainer: {
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
  likeIconBackground: {
    marginRight: 6,
  },
  likeIcon: {
    fontSize: 14,
  },
  statsText: {
    fontSize: 13,
    color: '#65676b',
  },
  actionButtons: {
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
  commentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
    maxHeight: '80%',
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  commentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  commentModalClose: {
    fontSize: 24,
    color: '#65676b',
  },
  commentsList: {
    maxHeight: 400,
  },
  commentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  commentTime: {
    fontSize: 11,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#1c1e21',
    lineHeight: 20,
  },
  noCommentsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#999',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    fontSize: 14,
    maxHeight: 80,
  },
  commentSendButton: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  commentSendButtonDisabled: {
    backgroundColor: '#e4e6eb',
  },
  commentSendText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  shareModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21',
  },
  shareModalClose: {
    fontSize: 24,
    color: '#65676b',
  },
  sharePreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sharePreviewLabel: {
    fontSize: 12,
    color: '#1877f2',
    marginBottom: 6,
  },
  sharePreviewCaption: {
    fontSize: 14,
    color: '#1c1e21',
  },
  shareInput: {
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1c1e21',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 16,
  },
  sharePostButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  sharePostButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
});

export default feedPage;