import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Reaction types ───────────────────────────────
const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like", color: "#1877f2" },
  { type: "love", emoji: "❤️", label: "Love", color: "#f33e58" },
  { type: "haha", emoji: "😆", label: "Haha", color: "#f7b125" },
  { type: "wow", emoji: "😮", label: "Wow", color: "#f7b125" },
  { type: "sad", emoji: "😢", label: "Sad", color: "#f7b125" },
  { type: "angry", emoji: "😡", label: "Angry", color: "#e9710f" },
];

const feedPage = () => {
  const router = useRouter();
  const [likedPosts, setLikedPosts] = useState([]);
  const [userReactions, setUserReactions] = useState({}); // { postId: reactionType }
  const [reactionModal, setReactionModal] = useState({
    visible: false,
    postId: null,
    isCurrentUserPost: false,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [postText, setPostText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);
  const [shareMessage, setShareMessage] = useState("");
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedPostForOptions, setSelectedPostForOptions] = useState(null);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
  };

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [showHashtagModal, setShowHashtagModal] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");
  const [postHashtags, setPostHashtags] = useState([]);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [userCreatedEvents, setUserCreatedEvents] = useState([]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    price: "Free",
    category: "Workshop",
    spots: 50,
    eventImage: null,
  });

  const [travelEvents, setTravelEvents] = useState([
    {
      id: 1,
      title: "🌍 Global Travel Summit 2024",
      date: "December 15-17, 2024",
      location: "Singapore",
      description:
        "Connect with top travel influencers, learn about sustainable tourism, and discover hidden gems worldwide.",
      spots: 150,
      enrolled: 89,
      price: "Free",
      category: "Conference",
      image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800",
      isUserCreated: false,
    },
    {
      id: 2,
      title: "🏔️ Himalayan Trekking Expedition",
      date: "January 10-20, 2025",
      location: "Nepal",
      description:
        "Join fellow adventurers for an epic Himalayan trek. Professional guides, breathtaking views, and lifetime memories.",
      spots: 25,
      enrolled: 12,
      price: "$1,299",
      category: "Adventure",
      image:
        "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
      isUserCreated: false,
    },
    {
      id: 3,
      title: "🍜 Southeast Asia Food Tour",
      date: "February 5-18, 2025",
      location: "Thailand, Vietnam, Cambodia",
      description:
        "Experience the best street food and culinary traditions across three amazing countries.",
      spots: 30,
      enrolled: 18,
      price: "$899",
      category: "Food & Culture",
      image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
      isUserCreated: false,
    },
    {
      id: 4,
      title: "📸 Photography Masterclass",
      date: "January 25-27, 2025",
      location: "Bali, Indonesia",
      description:
        "Learn travel photography from professional photographers. Capture stunning landscapes and portraits.",
      spots: 40,
      enrolled: 22,
      price: "$199",
      category: "Workshop",
      image:
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800",
      isUserCreated: false,
    },
    {
      id: 5,
      title: "🌿 Eco-Volunteer Program",
      date: "March 1-15, 2025",
      location: "Costa Rica",
      description:
        "Give back to nature by participating in wildlife conservation and reforestation projects.",
      spots: 20,
      enrolled: 8,
      price: "$499",
      category: "Volunteer",
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
      isUserCreated: false,
    },
  ]);

  const categories = [
    "Conference",
    "Adventure",
    "Food & Culture",
    "Workshop",
    "Volunteer",
    "Other",
  ];

  const popularLocations = [
    "Paris, France",
    "Tokyo, Japan",
    "New York, USA",
    "Bali, Indonesia",
    "London, UK",
    "Rome, Italy",
    "Sydney, Australia",
    "Cape Town, South Africa",
    "Barcelona, Spain",
    "Dubai, UAE",
    "Bangkok, Thailand",
    "Istanbul, Turkey",
    "Mumbai, India",
    "Singapore",
    "Kuala Lumpur, Malaysia",
    "Seoul, South Korea",
  ];

  const defaultAvatar = "https://randomuser.me/api/portraits/men/1.jpg";
  const defaultCover =
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";

  const [currentUser, setCurrentUser] = useState({
    id: "current",
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
    website: "www.example.com",
  });

  const [feedData, setFeedData] = useState([
    {
      id: 1,
      userId: 1,
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      location: "Bali, Indonesia",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      image:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
      caption:
        "Paradise found! The beaches of Bali are absolutely breathtaking. 🌴☀️",
      hashtags: ["#TravelDiaries", "#BeachLife"],
      likes: 1245,
      comments: [
        {
          id: 1,
          userId: 10,
          userName: "Traveler Joe",
          text: "Amazing view!",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
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
      image:
        "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
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
      image:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
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
      image:
        "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
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
      image:
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
      caption: "Ancient wonders and new adventures! 🏔️",
      hashtags: ["#MachuPicchu", "#Wanderlust"],
      likes: 1876,
      comments: [],
      shares: 45,
    },
  ]);

  const [currentUserPosts, setCurrentUserPosts] = useState([]);

  useEffect(() => {
    loadEnrolledEvents();
    loadUserCreatedEvents();
    loadTravelEvents();
  }, []);

  const loadTravelEvents = async () => {
    try {
      const saved = await AsyncStorage.getItem("travelEvents");
      if (saved) setTravelEvents(JSON.parse(saved));
    } catch (e) {
      console.log(e);
    }
  };
  const saveTravelEvents = async (events) => {
    try {
      await AsyncStorage.setItem("travelEvents", JSON.stringify(events));
    } catch (e) {
      console.log(e);
    }
  };
  const loadEnrolledEvents = async () => {
    try {
      const saved = await AsyncStorage.getItem("enrolledEvents");
      if (saved) setEnrolledEvents(JSON.parse(saved));
    } catch (e) {
      console.log(e);
    }
  };
  const saveEnrolledEvents = async (events) => {
    try {
      await AsyncStorage.setItem("enrolledEvents", JSON.stringify(events));
    } catch (e) {
      console.log(e);
    }
  };
  const loadUserCreatedEvents = async () => {
    try {
      const saved = await AsyncStorage.getItem("userCreatedEvents");
      if (saved) setUserCreatedEvents(JSON.parse(saved));
    } catch (e) {
      console.log(e);
    }
  };
  const saveUserCreatedEvents = async (events) => {
    try {
      await AsyncStorage.setItem("userCreatedEvents", JSON.stringify(events));
    } catch (e) {
      console.log(e);
    }
  };

  const pickEventImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });
      if (!result.canceled)
        setNewEvent({ ...newEvent, eventImage: result.assets[0].uri });
    } catch (e) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleDeleteEvent = (eventId) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updatedEvents = travelEvents.filter((e) => e.id !== eventId);
          setTravelEvents(updatedEvents);
          await saveTravelEvents(updatedEvents);
          const updatedUserEvents = userCreatedEvents.filter(
            (e) => e.id !== eventId,
          );
          setUserCreatedEvents(updatedUserEvents);
          await saveUserCreatedEvents(updatedUserEvents);
          const updatedEnrolled = enrolledEvents.filter(
            (e) => e.id !== eventId,
          );
          setEnrolledEvents(updatedEnrolled);
          await saveEnrolledEvents(updatedEnrolled);
          Alert.alert("Success", "Event deleted successfully");
        },
      },
    ]);
  };

  const handleDeleteEnrollment = (eventId) => {
    Alert.alert(
      "Cancel Enrollment",
      "Are you sure you want to cancel your enrollment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Cancel Enrollment",
          style: "destructive",
          onPress: async () => {
            const updatedEnrolled = enrolledEvents.filter(
              (e) => e.id !== eventId,
            );
            setEnrolledEvents(updatedEnrolled);
            await saveEnrolledEvents(updatedEnrolled);
            const updatedEvents = travelEvents.map((e) =>
              e.id === eventId
                ? { ...e, enrolled: Math.max(0, e.enrolled - 1) }
                : e,
            );
            setTravelEvents(updatedEvents);
            await saveTravelEvents(updatedEvents);
            Alert.alert("Success", "Enrollment cancelled");
          },
        },
      ],
    );
  };

  const shareEnrollmentPost = async (eventTitle) => {
    try {
      const enrollmentPost = {
        id: Date.now(),
        userId: "current",
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
        type: "enrollment",
        enrollmentEvent: eventTitle,
      };
      const updatedFeed = [enrollmentPost, ...feedData];
      setFeedData(updatedFeed);
      await saveFeedPosts(updatedFeed);
      const existingPosts = await AsyncStorage.getItem("userPosts");
      let allUserPosts = existingPosts ? JSON.parse(existingPosts) : [];
      allUserPosts = [enrollmentPost, ...allUserPosts];
      await saveUserPosts(allUserPosts);
    } catch (e) {
      console.log(e);
    }
  };

  const handleEnrollEvent = async (event) => {
    if (enrolledEvents.some((e) => e.id === event.id)) {
      Alert.alert(
        "Already Enrolled",
        "You have already enrolled in this event!",
      );
      return;
    }
    if (event.enrolled >= event.spots) {
      Alert.alert(
        "Event Full",
        "Sorry, this event has reached maximum capacity.",
      );
      return;
    }
    Alert.alert(
      "Confirm Enrollment",
      `Would you like to enroll in "${event.title}"?\n\nSpots remaining: ${event.spots - event.enrolled}\nPrice: ${event.price}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Enroll",
          onPress: async () => {
            const updatedEnrolled = [
              ...enrolledEvents,
              { ...event, enrollmentDate: new Date().toISOString() },
            ];
            setEnrolledEvents(updatedEnrolled);
            await saveEnrolledEvents(updatedEnrolled);
            const updatedEvents = travelEvents.map((e) =>
              e.id === event.id ? { ...e, enrolled: e.enrolled + 1 } : e,
            );
            setTravelEvents(updatedEvents);
            await saveTravelEvents(updatedEvents);
            await shareEnrollmentPost(event.title);
            Alert.alert(
              "Success",
              `Enrolled in ${event.title}! Shared to your feed.`,
            );
          },
        },
      ],
    );
  };

  const handleCreateEvent = async () => {
    if (
      !newEvent.title.trim() ||
      !newEvent.date.trim() ||
      !newEvent.location.trim() ||
      !newEvent.description.trim()
    ) {
      Alert.alert("Error", "Please fill in all required fields");
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
      image:
        newEvent.eventImage ||
        "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800",
      isUserCreated: true,
      createdBy: currentUser.name,
      createdByUsername: currentUser.username,
    };
    const updatedEvents = [...travelEvents, createdEvent];
    setTravelEvents(updatedEvents);
    await saveTravelEvents(updatedEvents);
    const updatedUserEvents = [...userCreatedEvents, createdEvent];
    setUserCreatedEvents(updatedUserEvents);
    await saveUserCreatedEvents(updatedUserEvents);
    setNewEvent({
      title: "",
      date: "",
      location: "",
      description: "",
      price: "Free",
      category: "Workshop",
      spots: 50,
      eventImage: null,
    });
    setShowCreateEventModal(false);
    Alert.alert("Success", "Event created successfully!");
  };

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted")
        Alert.alert("Permission Needed", "Camera roll permissions required.");
    })();
    loadAllData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
      syncDeletedPosts();
      loadEnrolledEvents();
      loadUserCreatedEvents();
      loadTravelEvents();
      return () => {};
    }, []),
  );

  const loadAllData = async () => {
    await loadUserData();
    await loadUserPosts();
    await loadFeedPosts();
  };

  const loadUserData = async () => {
    try {
      const saved = await AsyncStorage.getItem("currentUser");
      if (saved) setCurrentUser(JSON.parse(saved));
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const savedPosts = await AsyncStorage.getItem("userPosts");
      if (savedPosts) {
        const allPosts = JSON.parse(savedPosts);
        const savedUser = await AsyncStorage.getItem("currentUser");
        const cu = savedUser ? JSON.parse(savedUser) : currentUser;
        const updated = allPosts.map((p) => ({
          ...p,
          name: cu.name,
          username: cu.username,
          avatar: cu.avatar,
          location: p.location || cu.location,
        }));
        const stories = updated
          .filter(
            (p) =>
              p.image &&
              p.type !== "feeling" &&
              !p.feeling &&
              p.type !== "enrollment",
          )
          .slice(0, 5);
        setCurrentUserPosts(stories);
      } else {
        const defaultPosts = [
          {
            id: 101,
            userId: "current",
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            location: "Paris, France",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            image:
              "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
            caption: "The Eiffel Tower at night is absolutely magical! 🗼✨",
            hashtags: ["#Paris", "#EiffelTower"],
            likes: 234,
            comments: [],
            shares: 12,
          },
          {
            id: 102,
            userId: "current",
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            location: "Rome, Italy",
            timestamp: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            image:
              "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
            caption: "Exploring the ancient Colosseum! 🏛️",
            hashtags: ["#Rome", "#Colosseum"],
            likes: 567,
            comments: [],
            shares: 34,
          },
          {
            id: 103,
            userId: "current",
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            location: "Barcelona, Spain",
            timestamp: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            image:
              "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
            caption: "Beautiful architecture in Barcelona! 🏰",
            hashtags: ["#Barcelona"],
            likes: 432,
            comments: [],
            shares: 23,
          },
          {
            id: 104,
            userId: "current",
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            location: "Amsterdam, Netherlands",
            timestamp: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            image:
              "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800",
            caption: "Canal cruises are the best! 🚤",
            hashtags: ["#Amsterdam"],
            likes: 345,
            comments: [],
            shares: 18,
          },
          {
            id: 105,
            userId: "current",
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            location: "London, UK",
            timestamp: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            image:
              "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
            caption: "Big Ben is stunning! 🇬🇧",
            hashtags: ["#London"],
            likes: 678,
            comments: [],
            shares: 45,
          },
        ];
        setCurrentUserPosts(defaultPosts);
        await AsyncStorage.setItem("userPosts", JSON.stringify(defaultPosts));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const loadFeedPosts = async () => {
    try {
      const saved = await AsyncStorage.getItem("feedPosts");
      if (saved) {
        const parsed = JSON.parse(saved);
        const cu = await AsyncStorage.getItem("currentUser");
        const cuObj = cu ? JSON.parse(cu) : currentUser;
        const updated = parsed.map((p) =>
          p.userId === "current"
            ? {
                ...p,
                name: cuObj.name,
                username: cuObj.username,
                avatar: cuObj.avatar,
                location: p.location || cuObj.location,
              }
            : p,
        );
        setFeedData(updated);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveFeedPosts = async (posts) => {
    try {
      await AsyncStorage.setItem("feedPosts", JSON.stringify(posts));
    } catch (e) {
      console.log(e);
    }
  };

  const saveUserPosts = async (posts) => {
    try {
      await AsyncStorage.setItem("userPosts", JSON.stringify(posts));
      const updated = posts.map((p) => ({
        ...p,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
      }));
      const stories = updated
        .filter(
          (p) =>
            p.image &&
            p.type !== "feeling" &&
            !p.feeling &&
            p.type !== "enrollment",
        )
        .slice(0, 5);
      setCurrentUserPosts(stories);
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPostForComment) return;
    const newComment = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
    };
    const updatedFeed = feedData.map((p) =>
      p.id === selectedPostForComment.id
        ? { ...p, comments: [...(p.comments || []), newComment] }
        : p,
    );
    setFeedData(updatedFeed);
    await saveFeedPosts(updatedFeed);
    if (selectedPostForComment.userId === "current") {
      const updatedUser = currentUserPosts.map((p) =>
        p.id === selectedPostForComment.id
          ? { ...p, comments: [...(p.comments || []), newComment] }
          : p,
      );
      setCurrentUserPosts(updatedUser);
      const all = await AsyncStorage.getItem("userPosts");
      if (all) {
        const parsed = JSON.parse(all);
        const updated = parsed.map((p) =>
          p.id === selectedPostForComment.id
            ? { ...p, comments: [...(p.comments || []), newComment] }
            : p,
        );
        await AsyncStorage.setItem("userPosts", JSON.stringify(updated));
      }
    }
    setCommentText("");
    setCommentModalVisible(false);
    setSelectedPostForComment(null);
    Alert.alert("Success", "Comment added!");
  };

  const handleSharePost = async () => {
    if (!selectedPostForShare) return;
    const sharePost = {
      id: Date.now(),
      userId: "current",
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
        caption: selectedPostForShare.caption,
      },
      likes: 0,
      comments: [],
      shares: 0,
      type: "share",
    };
    const updatedFeed = [sharePost, ...feedData];
    setFeedData(updatedFeed);
    await saveFeedPosts(updatedFeed);
    const existing = await AsyncStorage.getItem("userPosts");
    let all = existing ? JSON.parse(existing) : [];
    all = [sharePost, ...all];
    await saveUserPosts(all);
    setShareModalVisible(false);
    setSelectedPostForShare(null);
    setShareMessage("");
    Alert.alert("Success", "Post shared!");
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) setSelectedImage(result.assets[0].uri);
    } catch (e) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const addHashtag = () => {
    let tag = hashtagInput.trim();
    if (!tag) return;
    if (!tag.startsWith("#")) tag = "#" + tag;
    tag = tag.replace(/\s/g, "");
    if (postHashtags.includes(tag)) {
      Alert.alert("Duplicate", "This hashtag already added");
      return;
    }
    if (postHashtags.length >= 10) {
      Alert.alert("Limit", "Max 10 hashtags");
      return;
    }
    setPostHashtags([...postHashtags, tag]);
    setHashtagInput("");
  };

  const removeHashtag = (tag) =>
    setPostHashtags(postHashtags.filter((t) => t !== tag));

  const selectLocation = (loc) => {
    setSelectedLocation(loc);
    setCustomLocation("");
    setShowCheckInModal(false);
  };

  const saveCustomLocation = () => {
    if (customLocation.trim()) {
      setSelectedLocation(customLocation.trim());
      setCustomLocation("");
      setShowCheckInModal(false);
    } else Alert.alert("Error", "Please enter a location");
  };

  const handleDeletePost = async (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const updatedFeed = feedData.filter((p) => p.id !== postId);
            setFeedData(updatedFeed);
            await saveFeedPosts(updatedFeed);
            const data = await AsyncStorage.getItem("userPosts");
            if (data) {
              const parsed = JSON.parse(data);
              const updated = parsed.filter((p) => p.id !== postId);
              await AsyncStorage.setItem("userPosts", JSON.stringify(updated));
              const stories = updated
                .filter(
                  (p) =>
                    p.image &&
                    p.type !== "feeling" &&
                    !p.feeling &&
                    p.type !== "enrollment",
                )
                .slice(0, 5);
              setCurrentUserPosts(stories);
            }
            Alert.alert("Success", "Post deleted");
          } catch (e) {
            Alert.alert("Error", "Failed to delete post");
          }
        },
      },
    ]);
  };

  // ── Updated handleLike: tracks reactions, fixes count ─────────────────
  const handleLike = (id, isCurrentUserPost = false) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(likedPosts.filter((pid) => pid !== id));
      setUserReactions((prev) => {
        const u = { ...prev };
        delete u[id];
        return u;
      });
      if (isCurrentUserPost) {
        const updated = currentUserPosts.map((p) =>
          p.id === id ? { ...p, likes: p.likes - 1 } : p,
        );
        setCurrentUserPosts(updated);
        (async () => {
          const all = await AsyncStorage.getItem("userPosts");
          if (all) {
            const parsed = JSON.parse(all);
            await AsyncStorage.setItem(
              "userPosts",
              JSON.stringify(
                parsed.map((p) =>
                  p.id === id ? { ...p, likes: p.likes - 1 } : p,
                ),
              ),
            );
          }
        })();
      } else {
        const updated = feedData.map((p) =>
          p.id === id ? { ...p, likes: p.likes - 1 } : p,
        );
        setFeedData(updated);
        saveFeedPosts(updated);
      }
    } else {
      setLikedPosts([...likedPosts, id]);
      setUserReactions((prev) => ({ ...prev, [id]: "like" }));
      if (isCurrentUserPost) {
        const updated = currentUserPosts.map((p) =>
          p.id === id ? { ...p, likes: p.likes + 1 } : p,
        );
        setCurrentUserPosts(updated);
        (async () => {
          const all = await AsyncStorage.getItem("userPosts");
          if (all) {
            const parsed = JSON.parse(all);
            await AsyncStorage.setItem(
              "userPosts",
              JSON.stringify(
                parsed.map((p) =>
                  p.id === id ? { ...p, likes: p.likes + 1 } : p,
                ),
              ),
            );
          }
        })();
      } else {
        const updated = feedData.map((p) =>
          p.id === id ? { ...p, likes: p.likes + 1 } : p,
        );
        setFeedData(updated);
        saveFeedPosts(updated);
      }
    }
  };

  // ── Reaction picker handler ────────────────────────────────────────────
  const handleReaction = (postId, reaction, isCurrentUserPost) => {
    const wasLiked = likedPosts.includes(postId);
    setUserReactions((prev) => ({ ...prev, [postId]: reaction.type }));
    if (!wasLiked) {
      setLikedPosts((prev) => [...prev, postId]);
      if (isCurrentUserPost) {
        const updated = currentUserPosts.map((p) =>
          p.id === postId ? { ...p, likes: p.likes + 1 } : p,
        );
        setCurrentUserPosts(updated);
        (async () => {
          const all = await AsyncStorage.getItem("userPosts");
          if (all) {
            const parsed = JSON.parse(all);
            await AsyncStorage.setItem(
              "userPosts",
              JSON.stringify(
                parsed.map((p) =>
                  p.id === postId ? { ...p, likes: p.likes + 1 } : p,
                ),
              ),
            );
          }
        })();
      } else {
        const updated = feedData.map((p) =>
          p.id === postId ? { ...p, likes: p.likes + 1 } : p,
        );
        setFeedData(updated);
        saveFeedPosts(updated);
      }
    }
    setReactionModal({
      visible: false,
      postId: null,
      isCurrentUserPost: false,
    });
  };

  const handleCreatePost = async () => {
    if (!postText.trim() && !selectedImage) {
      Alert.alert("Error", "Please add a caption or image");
      return;
    }
    setIsCreating(true);
    try {
      const newPost = {
        id: Date.now(),
        userId: "current",
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
        location: selectedLocation || currentUser.location,
        timestamp: new Date().toISOString(),
        image:
          selectedImage ||
          "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800",
        caption: postText.trim() || "Shared a photo",
        hashtags: postHashtags,
        likes: 0,
        comments: [],
        shares: 0,
      };
      const updatedFeed = [newPost, ...feedData];
      setFeedData(updatedFeed);
      await saveFeedPosts(updatedFeed);
      const existing = await AsyncStorage.getItem("userPosts");
      let all = existing ? JSON.parse(existing) : [];
      all = [newPost, ...all];
      await saveUserPosts(all);
      setPostText("");
      setSelectedImage(null);
      setSelectedLocation("");
      setPostHashtags([]);
      setModalVisible(false);
      Alert.alert("Success", "Your travel story has been shared!");
    } catch (e) {
      Alert.alert("Error", "Failed to create post");
    } finally {
      setIsCreating(false);
    }
  };

  const navigateToProfile = () => router.push("/app-pages/feedProfile");
  const navigateToFeeling = () => router.push("/app-pages/feedFeeling");

  const syncDeletedPosts = async () => {
    try {
      const data = await AsyncStorage.getItem("userPosts");
      if (!data) return;
      const ids = JSON.parse(data).map((p) => p.id);
      const synced = feedData.filter(
        (p) => p.userId !== "current" || ids.includes(p.id),
      );
      if (synced.length !== feedData.length) {
        setFeedData(synced);
        await saveFeedPosts(synced);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const openOptionsMenu = (post) => {
    setSelectedPostForOptions(post);
    setOptionsModalVisible(true);
  };

  const handleReportPost = () => {
    Alert.alert("Report Post", "Why are you reporting this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Spam",
        onPress: () => Alert.alert("Reported", "Thank you for reporting spam"),
      },
      {
        text: "Harassment",
        onPress: () => Alert.alert("Reported", "Thank you"),
      },
      {
        text: "Inappropriate",
        onPress: () => Alert.alert("Reported", "Thank you"),
      },
      {
        text: "Misinformation",
        onPress: () => Alert.alert("Reported", "Thank you"),
      },
    ]);
    setOptionsModalVisible(false);
  };

  const handleSavePost = async () => {
    if (!selectedPostForOptions) return;
    try {
      const saved = await AsyncStorage.getItem("savedPosts");
      let list = saved ? JSON.parse(saved) : [];
      if (list.some((p) => p.id === selectedPostForOptions.id)) {
        Alert.alert("Info", "Post already saved");
        setOptionsModalVisible(false);
        return;
      }
      list.unshift({
        id: selectedPostForOptions.id,
        name: selectedPostForOptions.name,
        username: selectedPostForOptions.username,
        avatar: selectedPostForOptions.avatar,
        location: selectedPostForOptions.location,
        image: selectedPostForOptions.image,
        caption: selectedPostForOptions.caption,
        likes: selectedPostForOptions.likes,
        timestamp: selectedPostForOptions.timestamp,
        savedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem("savedPosts", JSON.stringify(list));
      Alert.alert("Saved", "Post saved to your collection");
    } catch (e) {
      Alert.alert("Error", "Failed to save post");
    }
    setOptionsModalVisible(false);
  };

  const handleCopyLink = () => {
    Alert.alert("Link Copied", "Post link copied to clipboard");
    setOptionsModalVisible(false);
  };
  const handleViewProfile = () => {
    navigateToProfile();
    setOptionsModalVisible(false);
  };
  const handleNotInterested = () => {
    Alert.alert("Noted", "We'll show fewer posts like this");
    setOptionsModalVisible(false);
  };

  // ── Render helpers ────────────────────────────────────────────────────
  const renderActionBar = (item, isLiked, isCurrentUserPost) => {
    const reaction = userReactions[item.id];
    const reactionData = REACTIONS.find((r) => r.type === reaction);
    const likeColor = reactionData?.color || "#1877f2";

    return (
      <View style={s.fbActionBar}>
        {/* Like */}
        <TouchableOpacity
          style={s.fbActionBtn}
          onPress={() => handleLike(item.id, isCurrentUserPost)}
          onLongPress={() =>
            setReactionModal({
              visible: true,
              postId: item.id,
              isCurrentUserPost,
            })
          }
          delayLongPress={400}
          activeOpacity={0.7}
        >
          {reaction ? (
            <Text style={s.fbReactionIcon}>{reactionData?.emoji}</Text>
          ) : (
            <Ionicons
              name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
              size={20}
              color={isLiked ? likeColor : "#65676b"}
            />
          )}
          <Text
            style={[
              s.fbActionText,
              isLiked && { color: likeColor, fontWeight: "700" },
            ]}
          >
            {reactionData?.label || "Like"}
          </Text>
        </TouchableOpacity>

        <View style={s.fbActionDivider} />

        {/* Comment */}
        <TouchableOpacity
          style={s.fbActionBtn}
          onPress={() => {
            setSelectedPostForComment(item);
            setCommentModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#65676b" />
          <Text style={s.fbActionText}>Comment</Text>
        </TouchableOpacity>

        <View style={s.fbActionDivider} />

        {/* Share */}
        <TouchableOpacity
          style={s.fbActionBtn}
          onPress={() => {
            setSelectedPostForShare(item);
            setShareModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="share-social-outline" size={20} color="#65676b" />
          <Text style={s.fbActionText}>Share</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStatsBar = (item, isLiked) => {
    const reaction = userReactions[item.id];
    const reactionData = REACTIONS.find((r) => r.type === reaction);
    const commentCount = item.comments?.length || 0;
    return (
      <View style={s.fbStatsBar}>
        <View style={s.fbStatsLeft}>
          {item.likes > 0 && (
            <>
              <View style={s.fbLikeBubble}>
                <Text style={{ fontSize: 12 }}>
                  {reactionData?.emoji || "👍"}
                </Text>
              </View>
              <Text style={s.fbStatsText}>{item.likes}</Text>
            </>
          )}
        </View>
        <View style={s.fbStatsRight}>
          {commentCount > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSelectedPostForComment(item);
                setCommentModalVisible(true);
              }}
            >
              <Text style={s.fbStatsText}>{commentCount} comments</Text>
            </TouchableOpacity>
          )}
          {item.shares > 0 && (
            <Text style={s.fbStatsText}> · {item.shares} shares</Text>
          )}
        </View>
      </View>
    );
  };

  const renderEventItem = ({ item }) => {
    const isEnrolled = enrolledEvents.some((e) => e.id === item.id);
    const spotsLeft = item.spots - item.enrolled;
    const isUserEvent = item.isUserCreated;
    const isCurrentUserEvent = item.createdByUsername === currentUser.username;
    return (
      <View style={s.eventCard}>
        <Image source={{ uri: item.image }} style={s.eventImage} />
        <View style={s.eventOverlay}>
          <View style={s.eventCategory}>
            <Text style={s.eventCategoryText}>{item.category}</Text>
          </View>
          {isUserEvent && isCurrentUserEvent && (
            <TouchableOpacity
              style={[
                s.eventCategory,
                { backgroundColor: "#dc3545", marginTop: 5 },
              ]}
              onPress={() => handleDeleteEvent(item.id)}
            >
              <Text style={s.eventCategoryText}>🗑️ Delete</Text>
            </TouchableOpacity>
          )}
          {isUserEvent && !isCurrentUserEvent && (
            <View
              style={[
                s.eventCategory,
                { backgroundColor: "#28a745", marginTop: 5 },
              ]}
            >
              <Text style={s.eventCategoryText}>By {item.createdBy}</Text>
            </View>
          )}
        </View>
        <View style={s.eventContent}>
          <Text style={s.eventTitle}>{item.title}</Text>
          {[
            ["📅", item.date],
            ["📍", item.location],
            ["💰", item.price],
            ["👥", `${spotsLeft} spots left`],
          ].map(([icon, val]) => (
            <View key={val} style={s.eventDetail}>
              <Text style={s.eventDetailIcon}>{icon}</Text>
              <Text style={s.eventDetailText}>{val}</Text>
            </View>
          ))}
          <Text style={s.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <TouchableOpacity
            style={[s.enrollButton, isEnrolled && s.leaveButton]}
            onPress={() =>
              isEnrolled
                ? handleDeleteEnrollment(item.id)
                : handleEnrollEvent(item)
            }
          >
            <Text style={s.enrollButtonText}>
              {isEnrolled ? "✓ Enrolled · Cancel" : "✈️ Enroll Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFeedItem = ({ item }) => {
    const isLiked = likedPosts.includes(item.id);
    const isCurrentUserPost = item.userId === "current";
    const isFeelingPost =
      item.type === "feeling" || (!item.image && item.feeling);
    const isEnrollmentPost = item.type === "enrollment";
    const isSharePost = item.type === "share";

    if (isEnrollmentPost) {
      return (
        <View style={s.enrollmentPostCard}>
          <View style={s.postHeader}>
            <Image source={{ uri: item.avatar }} style={s.avatar} />
            <View style={s.postHeaderInfo}>
              <Text style={s.postName}>{item.name}</Text>
              <Text style={s.postUsername}>@{item.username}</Text>
              <View style={s.locationTimeRow}>
                <Text style={s.postLocation}>📍 {item.location}</Text>
                <Text style={s.postTime}>
                  {" "}
                  · {formatDateTime(item.timestamp)}
                </Text>
              </View>
            </View>
            <View style={s.headerActions}>
              {isCurrentUserPost && (
                <TouchableOpacity
                  style={s.fbDeleteBtn}
                  onPress={() => handleDeletePost(item.id)}
                >
                  <Ionicons name="trash-outline" size={15} color="#ff4444" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={s.fbMoreBtn}
                onPress={() => openOptionsMenu(item)}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={16}
                  color="#65676b"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.enrollmentHighlight}>
            <Text style={s.enrollmentIcon}>🎉</Text>
            <View style={{ flex: 1 }}>
              <View style={s.enrollmentBadge}>
                <Text style={s.enrollmentBadgeText}>NEW ENROLLMENT!</Text>
              </View>
              <Text style={s.enrollmentMessage}>{item.caption}</Text>
            </View>
          </View>

          {renderStatsBar(item, isLiked)}
          {renderActionBar(item, isLiked, isCurrentUserPost)}
        </View>
      );
    }

    return (
      <View style={s.feedItem}>
        <View style={s.postHeader}>
          <Image source={{ uri: item.avatar }} style={s.avatar} />
          <View style={s.postHeaderInfo}>
            <Text style={s.postName}>{item.name}</Text>
            <Text style={s.postUsername}>@{item.username}</Text>
            <View style={s.locationTimeRow}>
              <Text style={s.postLocation}>📍 {item.location}</Text>
              <Text style={s.postTime}>
                {" "}
                · {formatDateTime(item.timestamp)}
              </Text>
            </View>
          </View>
          <View style={s.headerActions}>
            {isCurrentUserPost && (
              <TouchableOpacity
                style={s.fbDeleteBtn}
                onPress={() => handleDeletePost(item.id)}
              >
                <Ionicons name="trash-outline" size={15} color="#ff4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={s.fbMoreBtn}
              onPress={() => openOptionsMenu(item)}
            >
              <Ionicons name="ellipsis-horizontal" size={16} color="#65676b" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.caption}>{item.caption}</Text>

        {isSharePost && item.originalPost && (
          <View style={s.sharedPostContainer}>
            <Text style={s.sharedPostLabel}>
              🔁 Shared from {item.originalPost.name}
            </Text>
            <Text style={s.sharedPostCaption}>
              "{item.originalPost.caption}"
            </Text>
          </View>
        )}

        {item.hashtags && item.hashtags.length > 0 && (
          <View style={s.hashtagsContainer}>
            {item.hashtags.map((tag, i) => (
              <Text key={i} style={s.hashtag}>
                {tag}
              </Text>
            ))}
          </View>
        )}

        {!isFeelingPost && item.image && (
          <Image source={{ uri: item.image }} style={s.postImage} />
        )}

        {isFeelingPost && item.feeling && (
          <View
            style={[
              s.feelingBadge,
              { backgroundColor: item.feeling.bgColor || "#FFF9C4" },
            ]}
          >
            <Text style={s.feelingBadgeEmoji}>{item.feeling.emoji}</Text>
            <Text style={s.feelingBadgeText}>Feeling {item.feeling.name}</Text>
          </View>
        )}

        {renderStatsBar(item, isLiked)}
        {renderActionBar(item, isLiked, isCurrentUserPost)}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#1877f2" />
        <Text style={s.loadingText}>Loading...</Text>
      </View>
    );
  }

  const firstName = currentUser.name.split(" ")[0];

  return (
    <View style={s.container}>
      {/* ── Comment Modal ──────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={commentModalVisible}
        onRequestClose={() => {
          setCommentModalVisible(false);
          setSelectedPostForComment(null);
          setCommentText("");
        }}
      >
        <View style={s.commentModalOverlay}>
          <View style={s.commentModalContainer}>
            <View style={s.commentModalHeader}>
              <Text style={s.commentModalTitle}>Comments</Text>
              <TouchableOpacity
                onPress={() => {
                  setCommentModalVisible(false);
                  setSelectedPostForComment(null);
                  setCommentText("");
                }}
              >
                <Ionicons name="close" size={24} color="#65676b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={s.commentsList}>
              {selectedPostForComment?.comments?.length > 0 ? (
                selectedPostForComment.comments.map((c) => (
                  <View key={c.id} style={s.commentItem}>
                    <View style={s.commentHeader}>
                      <Text style={s.commentUserName}>{c.userName}</Text>
                      <Text style={s.commentTime}>
                        {formatDateTime(c.timestamp)}
                      </Text>
                    </View>
                    <Text style={s.commentText}>{c.text}</Text>
                  </View>
                ))
              ) : (
                <View style={s.noCommentsContainer}>
                  <Text style={s.noCommentsText}>
                    No comments yet. Be the first!
                  </Text>
                </View>
              )}
            </ScrollView>
            <View style={s.commentInputContainer}>
              <TextInput
                style={s.commentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[
                  s.commentSendButton,
                  !commentText.trim() && s.commentSendButtonDisabled,
                ]}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Text style={s.commentSendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Share Modal ────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={shareModalVisible}
        onRequestClose={() => {
          setShareModalVisible(false);
          setSelectedPostForShare(null);
          setShareMessage("");
        }}
      >
        <View style={s.shareModalOverlay}>
          <View style={s.shareModalContainer}>
            <View style={s.shareModalHeader}>
              <Text style={s.shareModalTitle}>Share Post</Text>
              <TouchableOpacity
                onPress={() => {
                  setShareModalVisible(false);
                  setSelectedPostForShare(null);
                  setShareMessage("");
                }}
              >
                <Ionicons name="close" size={24} color="#65676b" />
              </TouchableOpacity>
            </View>
            <View style={s.sharePreview}>
              <Text style={s.sharePreviewLabel}>
                Original post by {selectedPostForShare?.name}
              </Text>
              <Text style={s.sharePreviewCaption}>
                {selectedPostForShare?.caption}
              </Text>
            </View>
            <TextInput
              style={s.shareInput}
              placeholder="Add your thoughts (optional)..."
              value={shareMessage}
              onChangeText={setShareMessage}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={s.sharePostButton}
              onPress={handleSharePost}
            >
              <Text style={s.sharePostButtonText}>Share Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Options Modal ──────────────────────────────── */}
      <Modal
        animationType="fade"
        transparent
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity
          style={s.optionsModalOverlay}
          activeOpacity={1}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={s.optionsModalContainer}>
            <View style={s.optionsModalHeader}>
              <Text style={s.optionsModalTitle}>Post Options</Text>
              <TouchableOpacity onPress={() => setOptionsModalVisible(false)}>
                <Ionicons name="close" size={22} color="#65676b" />
              </TouchableOpacity>
            </View>
            {[
              {
                icon: "bookmark-outline",
                title: "Save Post",
                desc: "Add to your saved collection",
                action: handleSavePost,
              },
              {
                icon: "link-outline",
                title: "Copy Link",
                desc: "Copy post link to clipboard",
                action: handleCopyLink,
              },
              {
                icon: "person-outline",
                title: "View Profile",
                desc: `Go to ${selectedPostForOptions?.name}'s profile`,
                action: handleViewProfile,
              },
              {
                icon: "hand-left-outline",
                title: "Not Interested",
                desc: "See fewer posts like this",
                action: handleNotInterested,
              },
              {
                icon: "flag-outline",
                title: "Report Post",
                desc: "Report inappropriate content",
                action: handleReportPost,
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.title}
                style={s.optionItem}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={s.optionIconWrap}>
                  <Ionicons name={item.icon} size={20} color="#1877f2" />
                </View>
                <View>
                  <Text style={s.optionTitle}>{item.title}</Text>
                  <Text style={s.optionDescription}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Reaction Picker Modal ──────────────────────── */}
      <Modal
        animationType="fade"
        transparent
        visible={reactionModal.visible}
        onRequestClose={() =>
          setReactionModal({
            visible: false,
            postId: null,
            isCurrentUserPost: false,
          })
        }
      >
        <Pressable
          style={s.reactionOverlay}
          onPress={() =>
            setReactionModal({
              visible: false,
              postId: null,
              isCurrentUserPost: false,
            })
          }
        >
          <Pressable style={s.reactionBar}>
            {REACTIONS.map((r) => (
              <TouchableOpacity
                key={r.type}
                style={s.reactionBtn}
                onPress={() =>
                  handleReaction(
                    reactionModal.postId,
                    r,
                    reactionModal.isCurrentUserPost,
                  )
                }
              >
                <Text style={s.reactionEmoji}>{r.emoji}</Text>
                <Text style={[s.reactionLabel, { color: r.color }]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Events Modal ───────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={showEventsModal}
        onRequestClose={() => setShowEventsModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.eventsModalContainer}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>✈️ Travel Events</Text>
              <TouchableOpacity onPress={() => setShowEventsModal(false)}>
                <Ionicons name="close" size={24} color="#65676b" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={s.createEventButton}
              onPress={() => {
                setShowEventsModal(false);
                setShowCreateEventModal(true);
              }}
            >
              <Ionicons
                name="add-circle-outline"
                size={18}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={s.createEventButtonText}>Create Your Own Event</Text>
            </TouchableOpacity>
            {enrolledEvents.length > 0 && (
              <View style={s.myEnrollmentsSection}>
                <Text style={s.myEnrollmentsTitle}>
                  📌 My Enrollments ({enrolledEvents.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {enrolledEvents.map((ev) => (
                    <View key={ev.id} style={s.enrollmentChip}>
                      <Text style={s.enrollmentChipText}>
                        {ev.title.substring(0, 20)}...
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteEnrollment(ev.id)}
                      >
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            <Text style={s.modalSubtitle}>Upcoming Events</Text>
            <FlatList
              data={travelEvents}
              keyExtractor={(i) => i.id.toString()}
              renderItem={renderEventItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.eventsList}
            />
          </View>
        </View>
      </Modal>

      {/* ── Create Event Modal ─────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={showCreateEventModal}
        onRequestClose={() => setShowCreateEventModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.createEventModalContainer}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Create New Event</Text>
              <TouchableOpacity onPress={() => setShowCreateEventModal(false)}>
                <Ionicons name="close" size={24} color="#65676b" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.inputLabel}>Event Image (Optional)</Text>
              <TouchableOpacity
                style={s.imagePickerButton}
                onPress={pickEventImage}
              >
                {newEvent.eventImage ? (
                  <Image
                    source={{ uri: newEvent.eventImage }}
                    style={s.eventImagePreview}
                  />
                ) : (
                  <View style={s.imagePickerPlaceholder}>
                    <Ionicons name="camera-outline" size={40} color="#65676b" />
                    <Text style={s.imagePickerText}>
                      Tap to add event image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {["title", "date", "location"].map((field) => (
                <View key={field}>
                  <Text style={s.inputLabel}>
                    {field.charAt(0).toUpperCase() + field.slice(1)} *
                  </Text>
                  <TextInput
                    style={s.eventInput}
                    placeholder={`Enter ${field}`}
                    value={newEvent[field]}
                    onChangeText={(text) =>
                      setNewEvent({ ...newEvent, [field]: text })
                    }
                  />
                </View>
              ))}
              <Text style={s.inputLabel}>Description *</Text>
              <TextInput
                style={[s.eventInput, s.textArea]}
                placeholder="Describe your event"
                multiline
                numberOfLines={3}
                value={newEvent.description}
                onChangeText={(text) =>
                  setNewEvent({ ...newEvent, description: text })
                }
              />
              <Text style={s.inputLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.categoryScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      s.categorySelect,
                      newEvent.category === cat && s.categorySelectActive,
                    ]}
                    onPress={() => setNewEvent({ ...newEvent, category: cat })}
                  >
                    <Text
                      style={[
                        s.categorySelectText,
                        newEvent.category === cat && s.categorySelectTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.inputLabel}>Price</Text>
              <TextInput
                style={s.eventInput}
                placeholder="e.g., Free, $49"
                value={newEvent.price}
                onChangeText={(text) =>
                  setNewEvent({ ...newEvent, price: text })
                }
              />
              <Text style={s.inputLabel}>Available Spots</Text>
              <TextInput
                style={s.eventInput}
                placeholder="Number of spots"
                keyboardType="numeric"
                value={newEvent.spots.toString()}
                onChangeText={(text) =>
                  setNewEvent({ ...newEvent, spots: parseInt(text) || 0 })
                }
              />
              <TouchableOpacity
                style={s.submitEventButton}
                onPress={handleCreateEvent}
              >
                <Text style={s.submitEventButtonText}>Create Event</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Check-In Modal ─────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={showCheckInModal}
        onRequestClose={() => setShowCheckInModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.checkInModalContainer}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Check In</Text>
              <TouchableOpacity onPress={() => setShowCheckInModal(false)}>
                <Ionicons name="close" size={24} color="#65676b" />
              </TouchableOpacity>
            </View>
            <Text style={s.modalSubtitle}>Popular Locations</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.locationsScroll}
            >
              {popularLocations.map((loc, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.locationChip}
                  onPress={() => selectLocation(loc)}
                >
                  <Text style={s.locationChipText}>📍 {loc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={s.modalSubtitle}>Or enter custom location</Text>
            <TextInput
              style={s.checkInInput}
              placeholder="Enter location name..."
              placeholderTextColor="#999"
              value={customLocation}
              onChangeText={setCustomLocation}
            />
            <TouchableOpacity
              style={s.saveLocationButton}
              onPress={saveCustomLocation}
            >
              <Text style={s.saveLocationButtonText}>Save Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Hashtag Modal ──────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={showHashtagModal}
        onRequestClose={() => setShowHashtagModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.hashtagModalContainer}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Hashtags</Text>
              <TouchableOpacity onPress={() => setShowHashtagModal(false)}>
                <Ionicons name="close" size={24} color="#65676b" />
              </TouchableOpacity>
            </View>
            <View style={s.hashtagInputContainer}>
              <TextInput
                style={s.hashtagInput}
                placeholder="Enter hashtag..."
                placeholderTextColor="#999"
                value={hashtagInput}
                onChangeText={setHashtagInput}
                autoCapitalize="none"
              />
              <TouchableOpacity style={s.addHashtagButton} onPress={addHashtag}>
                <Text style={s.addHashtagButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {postHashtags.length > 0 && (
              <View style={s.selectedHashtagsContainer}>
                <Text style={s.selectedHashtagsTitle}>Selected:</Text>
                <View style={s.hashtagsList}>
                  {postHashtags.map((tag, i) => (
                    <View key={i} style={s.selectedHashtagItem}>
                      <Text style={s.selectedHashtagText}>{tag}</Text>
                      <TouchableOpacity onPress={() => removeHashtag(tag)}>
                        <Ionicons name="close" size={14} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
            <Text style={s.hashtagTip}>
              Tip: Hashtags help others discover your travel posts!
            </Text>
            <TouchableOpacity
              style={s.doneButton}
              onPress={() => setShowHashtagModal(false)}
            >
              <Text style={s.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Create Post Modal ──────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setPostText("");
          setSelectedImage(null);
          setSelectedLocation("");
          setPostHashtags([]);
        }}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Create Post</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setPostText("");
                  setSelectedImage(null);
                  setSelectedLocation("");
                  setPostHashtags([]);
                }}
              >
                <Ionicons name="close" size={24} color="#65676b" />
              </TouchableOpacity>
            </View>
            <View style={s.modalUserInfo}>
              <Image
                source={{ uri: currentUser.avatar }}
                style={s.modalAvatar}
              />
              <View>
                <Text style={s.modalUserName}>{currentUser.name}</Text>
                <Text style={s.modalUserUsername}>@{currentUser.username}</Text>
              </View>
            </View>
            {selectedLocation && (
              <View style={s.selectedInfoContainer}>
                <Text style={s.selectedInfoLabel}>📍</Text>
                <Text style={s.selectedInfoText}>{selectedLocation}</Text>
                <TouchableOpacity onPress={() => setSelectedLocation("")}>
                  <Ionicons name="close" size={16} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
            {postHashtags.length > 0 && (
              <View style={s.selectedInfoContainer}>
                <Text style={s.selectedInfoLabel}>🏷️</Text>
                <View style={s.selectedHashtagsPreview}>
                  {postHashtags.slice(0, 3).map((tag, i) => (
                    <Text key={i} style={s.previewHashtag}>
                      {tag}
                    </Text>
                  ))}
                  {postHashtags.length > 3 && (
                    <Text style={s.moreHashtags}>
                      +{postHashtags.length - 3}
                    </Text>
                  )}
                </View>
              </View>
            )}
            <TextInput
              style={s.modalInput}
              placeholder="What's on your mind? Share your travel experience..."
              multiline
              numberOfLines={4}
              value={postText}
              onChangeText={setPostText}
              placeholderTextColor="#999"
            />
            {selectedImage && (
              <View style={s.selectedImageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={s.selectedImagePreview}
                />
                <TouchableOpacity
                  style={s.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            <View style={s.modalImageOptions}>
              <TouchableOpacity style={s.imageOptionButton} onPress={pickImage}>
                <Ionicons name="camera-outline" size={18} color="#1877f2" />
                <Text style={s.imageOptionText}>Add Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.imageOptionButton}
                onPress={() => setShowCheckInModal(true)}
              >
                <Ionicons name="location-outline" size={18} color="#43b581" />
                <Text style={s.imageOptionText}>Check In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.imageOptionButton}
                onPress={() => setShowHashtagModal(true)}
              >
                <Ionicons name="pricetag-outline" size={18} color="#f7b125" />
                <Text style={s.imageOptionText}>Hashtag</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                s.postButton,
                !postText.trim() && !selectedImage && s.postButtonDisabled,
              ]}
              onPress={handleCreatePost}
              disabled={(!postText.trim() && !selectedImage) || isCreating}
            >
              <Text style={s.postButtonText}>
                {isCreating ? "Posting..." : "Post"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Main Header ────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Travel Feed</Text>
          {/* ✅ NO @ symbol – shows first name only */}
          <Text style={s.headerSubtitle}>Welcome, {firstName}!</Text>
        </View>
        <View style={s.headerIcons}>
          <TouchableOpacity style={s.headerIcon} onPress={navigateToProfile}>
            <Image source={{ uri: currentUser.avatar }} style={s.profileIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#1877f2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Feed List ──────────────────────────────────── */}
      <FlatList
        data={feedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFeedItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Create Post Card */}
            <View style={s.createPostCard}>
              <View style={s.createPostTop}>
                <Image
                  source={{ uri: currentUser.avatar }}
                  style={s.createPostAvatar}
                />
                <TouchableOpacity
                  style={s.createPostInput}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={s.createPostPlaceholder}>
                    What's on your mind, {firstName}?
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={s.createPostDivider} />
              <View style={s.createPostActions}>
                {/* ✅ Calendar icon for Events */}
                <TouchableOpacity
                  style={s.createPostAction}
                  onPress={() => setShowEventsModal(true)}
                >
                  <Ionicons name="calendar-outline" size={19} color="#1877f2" />
                  <Text style={[s.createPostActionText, { color: "#1877f2" }]}>
                    Events
                  </Text>
                </TouchableOpacity>
                <View style={s.createPostActionDivider} />
                <TouchableOpacity
                  style={s.createPostAction}
                  onPress={() => setModalVisible(true)}
                >
                  <Ionicons name="images-outline" size={19} color="#43b581" />
                  <Text style={[s.createPostActionText, { color: "#43b581" }]}>
                    Photo
                  </Text>
                </TouchableOpacity>
                <View style={s.createPostActionDivider} />
                <TouchableOpacity
                  style={s.createPostAction}
                  onPress={navigateToFeeling}
                >
                  <Ionicons name="happy-outline" size={19} color="#f7b125" />
                  <Text style={[s.createPostActionText, { color: "#f7b125" }]}>
                    Feeling
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Stories */}
            {currentUserPosts.length > 0 && (
              <View style={s.recentStoriesSection}>
                <View style={s.sectionHeader}>
                  <View>
                    <Text style={s.sectionTitle}>Your Recent Stories</Text>
                    <Text style={s.sectionSubtitle}>
                      Your latest travel moments
                    </Text>
                  </View>
                  <TouchableOpacity onPress={navigateToProfile}>
                    <Text style={s.seeAllButton}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={s.horizontalScrollView}
                  contentContainerStyle={s.horizontalScrollContent}
                >
                  {currentUserPosts.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={s.smallStoryCard}
                      onPress={navigateToProfile}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={s.smallStoryImage}
                      />
                      <View style={s.smallStoryOverlay}>
                        <View style={s.smallStoryBadge}>
                          <Text style={s.smallStoryBadgeText}>Your Story</Text>
                        </View>
                      </View>
                      <View style={s.smallStoryFooter}>
                        <Text style={s.smallStoryName} numberOfLines={1}>
                          {currentUser.name}
                        </Text>
                        {item.caption && (
                          <Text style={s.smallStoryCaption} numberOfLines={2}>
                            {item.caption}
                          </Text>
                        )}
                        <Text style={s.smallStoryTime}>
                          {formatDateTime(item.timestamp)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Profile Banner */}
            <TouchableOpacity
              style={s.profileBanner}
              onPress={navigateToProfile}
            >
              <View style={s.profileBannerLeft}>
                <Image
                  source={{ uri: currentUser.avatar }}
                  style={s.profileBannerAvatar}
                />
                <View>
                  <Text style={s.profileBannerName}>{currentUser.name}</Text>
                  <Text style={s.profileBannerUsername}>
                    @{currentUser.username}
                  </Text>
                  <Text style={s.profileBannerStats}>
                    {currentUserPosts.length} recent posts ·{" "}
                    {currentUser.followers} followers
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={s.viewProfileButton}
                onPress={navigateToProfile}
              >
                <Text style={s.viewProfileButtonText}>View Profile</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Feed Title */}
            <View style={s.feedTitleContainer}>
              <Text style={s.sectionTitle}>Discover Travel Posts</Text>
              <TouchableOpacity>
                <Text style={s.sortButton}>Sort by Latest</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </View>
  );
};

export default feedPage;

// ─── STYLES ───────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", marginBottom: 72 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#1877f2" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1877f2" },
  headerSubtitle: { fontSize: 12, color: "#65676b", marginTop: 2 },
  headerIcons: { flexDirection: "row", gap: 16, alignItems: "center" },
  headerIcon: { padding: 2 },
  profileIcon: { width: 35, height: 35, borderRadius: 17.5 },

  // Create post card
  createPostCard: {
    backgroundColor: "#fff",
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  createPostTop: {
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "#f0f2f5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createPostPlaceholder: { fontSize: 15, color: "#65676b" },
  createPostDivider: {
    height: 1,
    backgroundColor: "#e4e6eb",
    marginVertical: 8,
  },
  createPostActions: { flexDirection: "row", alignItems: "center" },
  createPostAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  createPostActionDivider: { width: 1, height: 22, backgroundColor: "#e4e6eb" },
  createPostActionText: { fontSize: 13.5, fontWeight: "600" },

  // Stories
  recentStoriesSection: {
    backgroundColor: "#fff",
    marginBottom: 8,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: "#1c1e21" },
  sectionSubtitle: { fontSize: 12, color: "#65676b", marginTop: 2 },
  seeAllButton: { fontSize: 14, color: "#1877f2", fontWeight: "600" },
  horizontalScrollView: { paddingLeft: 16 },
  horizontalScrollContent: { paddingRight: 16 },
  smallStoryCard: {
    width: 130,
    height: 185,
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 4,
  },
  smallStoryImage: { width: "100%", height: 118, resizeMode: "cover" },
  smallStoryOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  smallStoryBadge: {
    backgroundColor: "#1877f2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  smallStoryBadgeText: { color: "#fff", fontSize: 9, fontWeight: "600" },
  smallStoryFooter: {
    padding: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    minHeight: 62,
  },
  smallStoryName: {
    fontSize: 12,
    color: "#1c1e21",
    fontWeight: "600",
    textAlign: "center",
  },
  smallStoryCaption: {
    fontSize: 10,
    color: "#65676b",
    marginTop: 2,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  smallStoryTime: {
    fontSize: 9,
    color: "#aaa",
    marginTop: 2,
    textAlign: "center",
  },

  // Profile banner
  profileBanner: {
    backgroundColor: "#fff",
    marginBottom: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileBannerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  profileBannerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  profileBannerName: { fontSize: 15, fontWeight: "bold", color: "#1c1e21" },
  profileBannerUsername: { fontSize: 12, color: "#65676b", marginTop: 1 },
  profileBannerStats: { fontSize: 11, color: "#65676b", marginTop: 1 },
  viewProfileButton: {
    backgroundColor: "#1877f2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewProfileButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // Feed title
  feedTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 1,
  },
  sortButton: { fontSize: 13, color: "#1877f2" },

  // Feed posts
  feedItem: { backgroundColor: "#fff", marginBottom: 8 },
  enrollmentPostCard: {
    backgroundColor: "#fff",
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },

  postHeader: { flexDirection: "row", padding: 12, alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  postHeaderInfo: { flex: 1 },
  postName: { fontSize: 15, fontWeight: "bold", color: "#1c1e21" },
  postUsername: { fontSize: 11, color: "#65676b", marginTop: 1 },
  locationTimeRow: { flexDirection: "row", marginTop: 2 },
  postLocation: { fontSize: 12, color: "#65676b" },
  postTime: { fontSize: 12, color: "#65676b" },

  headerActions: { flexDirection: "row", alignItems: "center", gap: 6 },

  // ✅ Facebook-style bordered trash icon
  fbDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ffd5d5",
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  // ✅ More (ellipsis) button with border
  fbMoreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e4e6eb",
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },

  caption: {
    fontSize: 14,
    color: "#1c1e21",
    paddingHorizontal: 12,
    paddingBottom: 10,
    lineHeight: 20,
  },
  hashtagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  hashtag: { fontSize: 13, color: "#1877f2", marginRight: 8, marginBottom: 4 },
  postImage: { width: "100%", height: 380, resizeMode: "cover" },
  sharedPostContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  sharedPostLabel: { fontSize: 12, color: "#1877f2", marginBottom: 4 },
  sharedPostCaption: { fontSize: 13, color: "#65676b" },
  feelingBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  feelingBadgeEmoji: { fontSize: 16, marginRight: 6 },
  feelingBadgeText: { fontSize: 13, color: "#1c1e21", fontWeight: "500" },

  // ✅ Stats bar (no double-counting)
  fbStatsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e6eb",
  },
  fbStatsLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  fbStatsRight: { flexDirection: "row", alignItems: "center" },
  fbLikeBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1877f2",
    alignItems: "center",
    justifyContent: "center",
  },
  fbStatsText: { fontSize: 13, color: "#65676b" },

  // ✅ Facebook-style action bar
  fbActionBar: { flexDirection: "row", borderTopWidth: 0, paddingVertical: 0 },
  fbActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  fbActionDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#e4e6eb",
    alignSelf: "center",
  },
  fbActionText: { fontSize: 13.5, color: "#65676b", fontWeight: "600" },
  fbReactionIcon: { fontSize: 20 },

  // Enrollment highlight
  enrollmentHighlight: {
    flexDirection: "row",
    backgroundColor: "#e8f5e9",
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    gap: 12,
  },
  enrollmentIcon: { fontSize: 30 },
  enrollmentBadge: {
    backgroundColor: "#28a745",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  enrollmentBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  enrollmentMessage: { fontSize: 14, color: "#1c1e21", lineHeight: 20 },

  // ✅ Reaction picker
  reactionOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 110,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  reactionBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 12,
  },
  reactionBtn: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reactionEmoji: { fontSize: 32 },
  reactionLabel: { fontSize: 10, fontWeight: "700", marginTop: 3 },

  // Modals
  optionsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "87%",
    maxWidth: 360,
    overflow: "hidden",
  },
  optionsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e6eb",
  },
  optionsModalTitle: { fontSize: 17, fontWeight: "bold", color: "#1c1e21" },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
    gap: 14,
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1c1e21",
    marginBottom: 2,
  },
  optionDescription: { fontSize: 12, color: "#65676b" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 500,
  },
  eventsModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  createEventModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  checkInModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  hashtagModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 450,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e6eb",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1c1e21" },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1c1e21",
    marginTop: 14,
    marginBottom: 10,
  },

  createEventButton: {
    backgroundColor: "#1877f2",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  createEventButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  myEnrollmentsSection: {
    marginBottom: 18,
    padding: 12,
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
  },
  myEnrollmentsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1c1e21",
    marginBottom: 10,
  },
  enrollmentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1877f2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  enrollmentChipText: { color: "#fff", fontSize: 12 },
  eventsList: { paddingBottom: 20 },

  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e4e6eb",
  },
  eventImage: { width: "100%", height: 155, resizeMode: "cover" },
  eventOverlay: { position: "absolute", top: 8, right: 8 },
  eventCategory: {
    backgroundColor: "#1877f2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventCategoryText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  eventContent: { padding: 12 },
  eventTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1c1e21",
    marginBottom: 8,
  },
  eventDetail: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  eventDetailIcon: { fontSize: 12, marginRight: 6 },
  eventDetailText: { fontSize: 12, color: "#65676b" },
  eventDescription: {
    fontSize: 13,
    color: "#65676b",
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 12,
  },
  enrollButton: {
    backgroundColor: "#1877f2",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  leaveButton: { backgroundColor: "#dc3545" },
  enrollButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1c1e21",
    marginTop: 12,
    marginBottom: 6,
  },
  eventInput: {
    borderWidth: 1,
    borderColor: "#e4e6eb",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#1c1e21",
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  categoryScroll: { flexDirection: "row", marginBottom: 12 },
  categorySelect: {
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  categorySelectActive: { backgroundColor: "#1877f2" },
  categorySelectText: { fontSize: 13, color: "#65676b" },
  categorySelectTextActive: { color: "#fff" },
  submitEventButton: {
    backgroundColor: "#1877f2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  submitEventButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  imagePickerButton: { marginBottom: 16 },
  imagePickerPlaceholder: {
    height: 140,
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e4e6eb",
    borderStyle: "dashed",
    gap: 8,
  },
  imagePickerText: { fontSize: 14, color: "#65676b" },
  eventImagePreview: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    resizeMode: "cover",
  },

  locationsScroll: { marginBottom: 16 },
  locationChip: {
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  locationChipText: { fontSize: 13, color: "#1c1e21" },
  checkInInput: {
    borderWidth: 1,
    borderColor: "#e4e6eb",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#1c1e21",
    marginBottom: 16,
  },
  saveLocationButton: {
    backgroundColor: "#1877f2",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveLocationButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  hashtagInputContainer: { flexDirection: "row", marginBottom: 20 },
  hashtagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e4e6eb",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#1c1e21",
    marginRight: 12,
  },
  addHashtagButton: {
    backgroundColor: "#1877f2",
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: "center",
  },
  addHashtagButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  selectedHashtagsContainer: { marginBottom: 18 },
  selectedHashtagsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1c1e21",
    marginBottom: 8,
  },
  hashtagsList: { flexDirection: "row", flexWrap: "wrap" },
  selectedHashtagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e4e6eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
  },
  selectedHashtagText: { fontSize: 13, color: "#1c1e21" },
  hashtagTip: {
    fontSize: 12,
    color: "#65676b",
    marginBottom: 18,
    textAlign: "center",
  },
  doneButton: {
    backgroundColor: "#1877f2",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  selectedInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  selectedInfoLabel: { fontSize: 14, marginRight: 8 },
  selectedInfoText: { flex: 1, fontSize: 13, color: "#65676b" },
  selectedHashtagsPreview: { flexDirection: "row", flexWrap: "wrap", flex: 1 },
  previewHashtag: { fontSize: 12, color: "#1877f2", marginRight: 6 },
  moreHashtags: { fontSize: 12, color: "#65676b" },

  modalUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  modalUserName: { fontSize: 15, fontWeight: "600", color: "#1c1e21" },
  modalUserUsername: { fontSize: 12, color: "#65676b" },
  modalInput: {
    fontSize: 15,
    color: "#1c1e21",
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e4e6eb",
    borderRadius: 12,
    padding: 12,
  },

  selectedImageContainer: { position: "relative", marginBottom: 16 },
  selectedImagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  modalImageOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e4e6eb",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e6eb",
  },
  imageOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  imageOptionText: { fontSize: 13, color: "#1877f2", fontWeight: "500" },
  postButton: {
    backgroundColor: "#1877f2",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
  },
  postButtonDisabled: { backgroundColor: "#e4e6eb" },
  postButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  commentModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  commentModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
    maxHeight: "80%",
  },
  commentModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e6eb",
  },
  commentModalTitle: { fontSize: 19, fontWeight: "bold", color: "#1c1e21" },
  commentsList: { maxHeight: 380 },
  commentItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  commentUserName: { fontSize: 13, fontWeight: "bold", color: "#1c1e21" },
  commentTime: { fontSize: 11, color: "#999" },
  commentText: { fontSize: 14, color: "#1c1e21", lineHeight: 20 },
  noCommentsContainer: { alignItems: "center", padding: 36 },
  noCommentsText: { fontSize: 14, color: "#999" },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e4e6eb",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e4e6eb",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 14,
    maxHeight: 80,
  },
  commentSendButton: {
    backgroundColor: "#1877f2",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  commentSendButtonDisabled: { backgroundColor: "#e4e6eb" },
  commentSendText: { color: "#fff", fontWeight: "600" },

  shareModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  shareModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  shareModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e6eb",
  },
  shareModalTitle: { fontSize: 19, fontWeight: "bold", color: "#1c1e21" },
  sharePreview: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  sharePreviewLabel: { fontSize: 12, color: "#1877f2", marginBottom: 5 },
  sharePreviewCaption: { fontSize: 14, color: "#1c1e21" },
  shareInput: {
    borderWidth: 1,
    borderColor: "#e4e6eb",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1c1e21",
    textAlignVertical: "top",
    minHeight: 80,
    marginBottom: 14,
  },
  sharePostButton: {
    backgroundColor: "#1877f2",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  sharePostButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
