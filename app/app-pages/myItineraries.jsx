import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MyItineraries = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [itineraries, setItineraries] = useState([]);
  const [filteredItineraries, setFilteredItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedPlanId, setHighlightedPlanId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [recentPlans, setRecentPlans] = useState([]);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef(null);

  // Function to validate and fix image URIs
  const validateImageUri = (uri) => {
    if (!uri) return null;
    
    if (uri.startsWith('file://') || uri.startsWith('content://')) {
      return uri;
    }
    
    if (uri.startsWith('data:image')) {
      return uri;
    }
    
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri;
    }
    
    return null;
  };

  // Function to copy image to permanent storage using new API
  const copyImageToPermanentStorage = async (tempUri) => {
    if (!tempUri) return null;
    
    try {
      const permanentDir = new Directory(Paths.document, 'travel_images');
      
      if (!permanentDir.exists) {
        permanentDir.create({ intermediates: true });
      }
      
      const filename = `plan_image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const permanentFile = new File(permanentDir, filename);
      const sourceFile = new File(tempUri);
      sourceFile.copy(permanentFile);
      
      return permanentFile.uri;
    } catch (error) {
      console.error('Error copying image:', error);
      return tempUri;
    }
  };

  // Function to clean up old/unused images using new API
  const cleanupOldImages = async () => {
    try {
      const savedPlans = await AsyncStorage.getItem('travelPlans');
      if (!savedPlans) return;
      
      const plans = JSON.parse(savedPlans);
      const usedImages = new Set();
      
      plans.forEach(plan => {
        if (plan.image && plan.image.includes('/travel_images/')) {
          usedImages.add(plan.image);
        }
      });
      
      const permanentDir = new Directory(Paths.document, 'travel_images');
      
      if (permanentDir.exists) {
        const contents = permanentDir.list();
        
        for (const item of contents) {
          if (item instanceof File) {
            if (!usedImages.has(item.uri)) {
              item.delete();
            }
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up images:', error);
    }
  };

  // Load itineraries with image validation
  const loadItineraries = async () => {
    try {
      const savedPlans = await AsyncStorage.getItem('travelPlans');
      if (savedPlans) {
        let plans = JSON.parse(savedPlans);
        
        let needsUpdate = false;
        const validatedPlans = plans.map(plan => {
          if (plan.image && plan.image.includes('/travel_images/')) {
            try {
              const imageFile = new File(plan.image);
              if (!imageFile.exists) {
                needsUpdate = true;
                return { ...plan, image: null };
              }
            } catch (e) {
              needsUpdate = true;
              return { ...plan, image: null };
            }
          }
          
          const validatedImage = validateImageUri(plan.image);
          if (validatedImage !== plan.image) {
            needsUpdate = true;
            return { ...plan, image: validatedImage };
          }
          return plan;
        });
        
        if (needsUpdate) {
          await AsyncStorage.setItem('travelPlans', JSON.stringify(validatedPlans));
        }
        
        const sortedPlans = validatedPlans.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setItineraries(sortedPlans);
        setFilteredItineraries(sortedPlans);
        
        const newestPlans = sortedPlans.slice(0, 5);
        setRecentPlans(newestPlans);
      }
    } catch (error) {
      console.error('Error loading itineraries:', error);
    }
  };

  // Function to save plan with permanent image storage
  const savePlanWithPermanentImage = async (planData) => {
    try {
      let finalImageUri = planData.image;
      
      if (planData.image && (
        planData.image.startsWith('file://') || 
        planData.image.startsWith('content://')
      )) {
        const permanentUri = await copyImageToPermanentStorage(planData.image);
        if (permanentUri) {
          finalImageUri = permanentUri;
        }
      }
      
      const savedPlans = await AsyncStorage.getItem('travelPlans');
      let plans = savedPlans ? JSON.parse(savedPlans) : [];
      
      if (planData.id) {
        const index = plans.findIndex(p => p.id === planData.id);
        if (index !== -1) {
          plans[index] = { ...planData, image: finalImageUri };
        }
      } else {
        plans.push({ ...planData, image: finalImageUri, id: Date.now().toString(), createdAt: new Date().toISOString() });
      }
      
      await AsyncStorage.setItem('travelPlans', JSON.stringify(plans));
      await loadItineraries();
      
      return true;
    } catch (error) {
      console.error('Error saving plan:', error);
      return false;
    }
  };

  // Show notification function
  const showNotification = (type, title, message, data = {}) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification({ type, title, message, data });
    setNotificationVisible(true);

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();

    timeoutRef.current = setTimeout(() => {
      dismissNotification();
    }, 5000);
  };

  const dismissNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNotificationVisible(false);
      setNotification(null);
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleNotificationPress = () => {
    if (notification?.data?.planId) {
      dismissNotification();
      setHighlightedPlanId(notification.data.planId);
      setTimeout(() => {
        setHighlightedPlanId(null);
      }, 3000);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'plan':
        return { name: 'map', color: '#007AFF' };
      case 'budget':
        return { name: 'wallet', color: '#FF9800' };
      case 'packing':
        return { name: 'bag', color: '#9C27B0' };
      default:
        return { name: 'notifications', color: '#007AFF' };
    }
  };

  // Search function
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredItineraries(itineraries);
    } else {
      const filtered = itineraries.filter(item => 
        (item.destination && item.destination.toLowerCase().includes(text.toLowerCase())) ||
        (item.planningLocation && item.planningLocation.toLowerCase().includes(text.toLowerCase())) ||
        (item.province && item.province.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredItineraries(filtered);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await cleanupOldImages();
    await loadItineraries();
    setSearchQuery('');
    setRefreshing(false);
  };

  // Update function - navigate to createPlan with existing data
  const handleUpdateItinerary = (item) => {
    const planData = {
      savedDestination: item.destination,
      savedPostCaption: item.postCaption,
      savedSelectedImage: item.image,
      savedPlanningLocation: item.planningLocation,
      savedStartedTime: item.startedTime,
      savedProvince: item.province,
      savedStartDate: item.startDate,
      savedEndDate: item.endDate,
      savedTripNotes: item.tripNotes,
      savedCurrentStatus: item.currentStatus,
      savedSelectedPackingItems: JSON.stringify(item.selectedPackingItems || []),
      savedBudgetEstimate: JSON.stringify(item.budgetEstimate || {}),
      savedShowBudgetSummary: item.budgetBreakdown ? 'true' : 'false',
      savedBudgetBreakdown: JSON.stringify(item.budgetBreakdown || null),
      isUpdating: 'true',
      planId: item.id
    };

    router.push({
      pathname: '/app-pages/createPlan',
      params: planData
    });
  };

  // Delete function with image cleanup using new API
  const handleDeleteItinerary = (id) => {
    Alert.alert(
      'Delete Itinerary',
      'Are you sure you want to delete this itinerary?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const planToDelete = itineraries.find(item => item.id === id);
              
              if (planToDelete?.image && planToDelete.image.includes('/travel_images/')) {
                try {
                  const imageFile = new File(planToDelete.image);
                  if (imageFile.exists) {
                    imageFile.delete();
                  }
                } catch (e) {
                  console.log('Image already deleted or not found');
                }
              }
              
              const updatedItineraries = itineraries.filter(item => item.id !== id);
              await AsyncStorage.setItem('travelPlans', JSON.stringify(updatedItineraries));
              setItineraries(updatedItineraries);
              setFilteredItineraries(updatedItineraries);
              
              const sortedPlans = updatedItineraries.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
              );
              setRecentPlans(sortedPlans.slice(0, 5));
              
              showNotification(
                'success',
                'Deleted Successfully 🗑️',
                'The itinerary has been removed',
                {}
              );
            } catch (error) {
              console.error('Error deleting itinerary:', error);
              Alert.alert('Error', 'Failed to delete itinerary');
            }
          }
        }
      ]
    );
  };

  // Image component with error handling
  const PlanImage = ({ imageUri, style, placeholderEmoji }) => {
    const [imageError, setImageError] = useState(false);
    const [validUri, setValidUri] = useState(null);

    useEffect(() => {
      const validated = validateImageUri(imageUri);
      setValidUri(validated);
      setImageError(!validated);
    }, [imageUri]);

    if (imageError || !validUri) {
      return (
        <View style={[style, styles.cardImagePlaceholder]}>
          <Text style={styles.cardImageEmoji}>{placeholderEmoji || '🏠️'}</Text>
        </View>
      );
    }

    return (
      <Image 
        source={{ uri: validUri }}
        style={style}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />
    );
  };

  // Recent Plan Image Component
  const RecentPlanImage = ({ imageUri, style, placeholderEmoji }) => {
    const [imageError, setImageError] = useState(false);
    const [validUri, setValidUri] = useState(null);

    useEffect(() => {
      const validated = validateImageUri(imageUri);
      setValidUri(validated);
      setImageError(!validated);
    }, [imageUri]);

    if (imageError || !validUri) {
      return (
        <View style={[style, styles.recentPlanImagePlaceholder]}>
          <Text style={styles.recentPlanEmoji}>{placeholderEmoji || '✈️'}</Text>
        </View>
      );
    }

    return (
      <Image 
        source={{ uri: validUri }}
        style={style}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />
    );
  };

  // Generate share message for any platform
  const generateShareMessage = (itinerary) => {
    const startDate = formatDate(itinerary.startDate);
    const endDate = formatDate(itinerary.endDate);
    
    const getTypeEmoji = () => {
      const dest = (itinerary.destination || '').toLowerCase();
      if (dest.includes('beach')) return '🏖️';
      if (dest.includes('mountain')) return '⛰️';
      if (dest.includes('waterfall')) return '🌊';
      if (dest.includes('city')) return '🏙️';
      if (dest.includes('adventure')) return '🧗';
      return '✈️';
    };

    let budgetText = '';
    if (itinerary.budgetBreakdown) {
      budgetText = `
💰 *BUDGET BREAKDOWN:*
• Transport: $${itinerary.budgetBreakdown.transport?.cost || 0}
• Accommodation: $${itinerary.budgetBreakdown.accommodation?.cost || 0}
• Food: $${itinerary.budgetBreakdown.food?.cost || 0}
• Activities: $${itinerary.budgetBreakdown.activities?.cost || 0}
━━━━━━━━━━━━━━━━━━━━
• *TOTAL: $${itinerary.budgetBreakdown.total?.toFixed(2) || 0}*`;
    }

    let packingText = '';
    if (itinerary.selectedPackingItems && itinerary.selectedPackingItems.length > 0) {
      const items = itinerary.selectedPackingItems.slice(0, 5).join(' • ');
      packingText = `
🎒 *PACKING ESSENTIALS:*
${items}${itinerary.selectedPackingItems.length > 5 ? ` +${itinerary.selectedPackingItems.length - 5} more` : ''}`;
    }

    const getStatusEmoji = (status) => {
      switch (status?.toLowerCase()) {
        case 'planned': return '📅';
        case 'in progress': return '🔄';
        case 'completed': return '✅';
        default: return '📍';
      }
    };

    return `*${getTypeEmoji()}  TRAVEL ADVENTURE  ${getTypeEmoji()}*

📍 *${itinerary.destination?.toUpperCase() || 'EXCITING DESTINATION'}*

${itinerary.planningLocation ? `✨ ${itinerary.planningLocation}` : ''}
${itinerary.province ? `📍 ${itinerary.province}` : ''}

━━━━━━━━━━━━━━━━━━━━
*📅 TRIP DETAILS:*
━━━━━━━━━━━━━━━━━━━━
• Start: ${startDate} ${itinerary.startedTime ? `at ${itinerary.startedTime}` : ''}
• End:   ${endDate}
• Status: ${getStatusEmoji(itinerary.currentStatus)} ${itinerary.currentStatus || 'Planned'}

${itinerary.postCaption ? `
💭 *"${itinerary.postCaption}"*
` : ''}
${budgetText}
${packingText}

━━━━━━━━━━━━━━━━━━━━
✨ *Plan your own adventure with Tripzy!*
📱 Download the app and start your journey today!
━━━━━━━━━━━━━━━━━━━━

#Tripzy #TravelPlanner #Adventure #${itinerary.destination?.replace(/\s+/g, '') || 'Travel'} #Wanderlust`;
  };

  // Share function - Opens native share sheet for ANY platform
  const shareToAnyPlatform = async (itinerary) => {
    try {
      const shareMessage = generateShareMessage(itinerary);
      
      const result = await Share.share({
        message: shareMessage,
        title: `My Trip to ${itinerary.destination || 'Amazing Destination'}`,
      });
      
      if (result.action === Share.sharedAction) {
        showNotification(
          'success',
          'Shared Successfully! 📤',
          `Your trip to ${itinerary.destination} has been shared`,
          { planId: itinerary.id }
        );
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'long' });
      return `${day}${getDaySuffix(day)} of ${month}`;
    } catch (e) {
      return dateString;
    }
  };

  const getDaySuffix = (day) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'planned': return '#2196F3';
      case 'in progress': return '#FF9800';
      case 'completed': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  // Check for highlighted plan from notification
  useEffect(() => {
    if (params.highlightPlan) {
      setHighlightedPlanId(params.highlightPlan);
      setTimeout(() => {
        setHighlightedPlanId(null);
      }, 3000);
    }
  }, [params.highlightPlan]);

  // Load itineraries when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadItineraries();
    }, [])
  );

  // Clean up old images on app start
  useEffect(() => {
    cleanupOldImages();
  }, []);

  // Pan responder for swipe to dismiss notification
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) {
          dismissNotification();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // ============================================
  // REDESIGNED ITINERARY CARD COMPONENT
  // ============================================
  const ItineraryCard = ({ item }) => {
    const formattedDate = formatDate(item.startDate);
    const isHighlighted = item.id === highlightedPlanId;
    
    const getCategoryEmoji = () => {
      const dest = (item.destination || '').toLowerCase();
      if (dest.includes('beach')) return '🏖️';
      if (dest.includes('mountain')) return '⛰️';
      if (dest.includes('waterfall')) return '🌊';
      if (dest.includes('city')) return '🏙️';
      if (dest.includes('adventure')) return '🧗';
      return '✈️';
    };

    const getStatusBadge = () => {
      const status = item.currentStatus?.toLowerCase();
      if (status === 'planned') return { bg: '#E3F2FD', text: '#1976D2', icon: 'calendar-outline' };
      if (status === 'in progress') return { bg: '#FFF3E0', text: '#F57C00', icon: 'time-outline' };
      if (status === 'completed') return { bg: '#E8F5E9', text: '#388E3C', icon: 'checkmark-circle-outline' };
      return { bg: '#F5F5F5', text: '#757575', icon: 'help-outline' };
    };

    const statusBadge = getStatusBadge();

    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => {
          setSelectedItinerary(item);
          setModalVisible(true);
        }}
      >
        <View style={[styles.card, isHighlighted && styles.highlightedCard]}>
          <View style={styles.cardImageWrapper}>
            <PlanImage 
              imageUri={item.image}
              style={styles.cardImage}
              placeholderEmoji={getCategoryEmoji()}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageGradient}
            />
            
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
              <Ionicons name={statusBadge.icon} size={12} color={statusBadge.text} />
              <Text style={[styles.statusText, { color: statusBadge.text }]}>
                {item.currentStatus || 'Planned'}
              </Text>
            </View>
            
            <View style={styles.dateBadge}>
              <Text style={styles.dateDay}>{formattedDate.split(' ')[0]}</Text>
              <Text style={styles.dateMonth}>{formattedDate.split(' ')[2]}</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.destinationHeader}>
              <Text style={styles.destinationIcon}>{getCategoryEmoji()}</Text>
              <Text style={styles.destinationName} numberOfLines={1}>
                {item.destination || 'Amazing Destination'}
              </Text>
            </View>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.planningLocation || item.province || 'Location not specified'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoChip}>
                <Ionicons name="calendar-outline" size={12} color="#007AFF" />
                <Text style={styles.infoChipText}>
                  {item.startDate && item.endDate ? 
                    `${formatShortDate(item.startDate)} - ${formatShortDate(item.endDate)}` : 
                    'Date TBD'}
                </Text>
              </View>
              {item.startedTime && (
                <View style={styles.infoChip}>
                  <Ionicons name="time-outline" size={12} color="#007AFF" />
                  <Text style={styles.infoChipText}>Starts at {item.startedTime}</Text>
                </View>
              )}
            </View>

            {item.budgetBreakdown && (
              <View style={styles.budgetPreview}>
                <View style={styles.budgetBar}>
                  <View style={[styles.budgetFill, { width: `${Math.min((item.budgetBreakdown.total / 1000) * 100, 100)}%` }]} />
                </View>
                <View style={styles.budgetInfo}>
                  <Ionicons name="wallet-outline" size={12} color="#FF9800" />
                  <Text style={styles.budgetText}>
                    Budget: ${item.budgetBreakdown.total?.toFixed(2) || 0}
                  </Text>
                </View>
              </View>
            )}

            {item.postCaption && (
              <Text style={styles.captionPreview} numberOfLines={2}>
                "{item.postCaption}"
              </Text>
            )}

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={styles.updateBtn}
                onPress={() => handleUpdateItinerary(item)}
              >
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text style={styles.updateBtnText}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareBtn}
                onPress={() => shareToAnyPlatform(item)}
              >
                <Ionicons name="share-social-outline" size={16} color="#fff" />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => handleDeleteItinerary(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Recent Plan Card Component
  const RecentPlanCard = ({ plan }) => {
    const getPlanEmoji = () => {
      const dest = (plan.destination || '').toLowerCase();
      if (dest.includes('beach')) return '🏖️';
      if (dest.includes('mountain')) return '⛰️';
      if (dest.includes('waterfall')) return '🌊';
      if (dest.includes('city')) return '🏙️';
      if (dest.includes('adventure')) return '🧗';
      return '✈️';
    };

    return (
      <TouchableOpacity 
        style={styles.recentPlanCard}
        onPress={() => {
          setSelectedItinerary(plan);
          setModalVisible(true);
        }}
      >
        <RecentPlanImage 
          imageUri={plan.image}
          style={styles.recentPlanImage}
          placeholderEmoji={getPlanEmoji()}
        />
        
        <View style={styles.recentPlanOverlay}>
          <View style={styles.recentPlanTag}>
            <Text style={styles.recentPlanTagText}>
              {plan.currentStatus || 'Planned'}
            </Text>
          </View>
          <Text style={styles.recentPlanName} numberOfLines={1}>
            {plan.destination || 'Untitled Trip'}
          </Text>
          <Text style={styles.recentPlanLocation} numberOfLines={1}>
            {plan.planningLocation || plan.province || 'Location not set'}
          </Text>
          <View style={styles.recentPlanDate}>
            <Ionicons name="calendar-outline" size={10} color="#fff" />
            <Text style={styles.recentPlanDateText}>
              {formatShortDate(plan.startDate) || 'Date TBD'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ============================================
  // REDESIGNED TRIP DETAILS MODAL
  // ============================================
  const ItineraryDetailModal = () => {
    const [modalImageError, setModalImageError] = useState(false);
    const [validModalImageUri, setValidModalImageUri] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'budget', 'packing'

    useEffect(() => {
      if (selectedItinerary?.image) {
        const validated = validateImageUri(selectedItinerary.image);
        setValidModalImageUri(validated);
        setModalImageError(!validated);
      }
    }, [selectedItinerary]);

    if (!selectedItinerary) return null;

    const getCategoryIcon = () => {
      const dest = (selectedItinerary.destination || '').toLowerCase();
      if (dest.includes('beach')) return '🏖️';
      if (dest.includes('mountain')) return '⛰️';
      if (dest.includes('waterfall')) return '🌊';
      if (dest.includes('city')) return '🏙️';
      if (dest.includes('adventure')) return '🧗';
      return '✈️';
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Hero Image Section */}
              <View style={styles.modalHeroSection}>
                {!modalImageError && validModalImageUri ? (
                  <Image 
                    source={{ uri: validModalImageUri }}
                    style={styles.modalHeroImage}
                    onError={() => setModalImageError(true)}
                  />
                ) : (
                  <View style={[styles.modalHeroImage, styles.modalHeroPlaceholder]}>
                    <Text style={styles.modalHeroEmoji}>{getCategoryIcon()}</Text>
                  </View>
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.modalHeroGradient}
                />
                
                {/* Status Badge */}
                <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedItinerary.currentStatus) }]}>
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
                  <Text style={styles.modalStatusText}>{selectedItinerary.currentStatus || 'Planned'}</Text>
                </View>
                
                {/* Title Section */}
                <View style={styles.modalHeroContent}>
                  <Text style={styles.modalHeroDestination}>
                    {selectedItinerary.destination || 'Amazing Destination'}
                  </Text>
                  <View style={styles.modalHeroLocation}>
                    <Ionicons name="location" size={16} color="#FFD700" />
                    <Text style={styles.modalHeroLocationText}>
                      {selectedItinerary.planningLocation || selectedItinerary.province || 'Location not specified'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Quote/Caption */}
              {selectedItinerary.postCaption && (
                <View style={styles.modalQuoteContainer}>
                  <Ionicons name="quote" size={24} color="#007AFF" style={styles.quoteIcon} />
                  <Text style={styles.modalQuoteText}>"{selectedItinerary.postCaption}"</Text>
                </View>
              )}

              {/* Tab Navigation */}
              <View style={styles.modalTabBar}>
                <TouchableOpacity 
                  style={[styles.modalTab, activeTab === 'overview' && styles.modalTabActive]}
                  onPress={() => setActiveTab('overview')}
                >
                  <Ionicons name="information-circle-outline" size={20} color={activeTab === 'overview' ? '#007AFF' : '#666'} />
                  <Text style={[styles.modalTabText, activeTab === 'overview' && styles.modalTabTextActive]}>Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalTab, activeTab === 'budget' && styles.modalTabActive]}
                  onPress={() => setActiveTab('budget')}
                >
                  <Ionicons name="wallet-outline" size={20} color={activeTab === 'budget' ? '#007AFF' : '#666'} />
                  <Text style={[styles.modalTabText, activeTab === 'budget' && styles.modalTabTextActive]}>Budget</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalTab, activeTab === 'packing' && styles.modalTabActive]}
                  onPress={() => setActiveTab('packing')}
                >
                  <Ionicons name="bag-outline" size={20} color={activeTab === 'packing' ? '#007AFF' : '#666'} />
                  <Text style={[styles.modalTabText, activeTab === 'packing' && styles.modalTabTextActive]}>Packing</Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              <View style={styles.modalTabContent}>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <View>
                    {/* Date & Time Section */}
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.modalInfoTitle}>📅 Date & Time</Text>
                      <View style={styles.modalInfoRow}>
                        <View style={styles.modalInfoItem}>
                          <Ionicons name="calendar" size={20} color="#007AFF" />
                          <View>
                            <Text style={styles.modalInfoLabel}>Start Date</Text>
                            <Text style={styles.modalInfoValue}>{formatDate(selectedItinerary.startDate)}</Text>
                          </View>
                        </View>
                        <View style={styles.modalInfoItem}>
                          <Ionicons name="calendar" size={20} color="#FF6B6B" />
                          <View>
                            <Text style={styles.modalInfoLabel}>End Date</Text>
                            <Text style={styles.modalInfoValue}>{formatDate(selectedItinerary.endDate)}</Text>
                          </View>
                        </View>
                      </View>
                      {selectedItinerary.startedTime && (
                        <View style={styles.modalInfoItemFull}>
                          <Ionicons name="time" size={20} color="#FF9800" />
                          <View>
                            <Text style={styles.modalInfoLabel}>Start Time</Text>
                            <Text style={styles.modalInfoValue}>{selectedItinerary.startedTime}</Text>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Location Details */}
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.modalInfoTitle}>📍 Location Details</Text>
                      <View style={styles.modalInfoItemFull}>
                        <Ionicons name="location" size={20} color="#666" />
                        <View>
                          <Text style={styles.modalInfoLabel}>Planning Location</Text>
                          <Text style={styles.modalInfoValue}>{selectedItinerary.planningLocation || 'Not specified'}</Text>
                        </View>
                      </View>
                      {selectedItinerary.province && (
                        <View style={styles.modalInfoItemFull}>
                          <Ionicons name="flag" size={20} color="#666" />
                          <View>
                            <Text style={styles.modalInfoLabel}>Province/Region</Text>
                            <Text style={styles.modalInfoValue}>{selectedItinerary.province}</Text>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Trip Notes */}
                    {selectedItinerary.tripNotes && (
                      <View style={styles.modalInfoCard}>
                        <Text style={styles.modalInfoTitle}>📝 Trip Notes</Text>
                        <Text style={styles.modalNotesText}>{selectedItinerary.tripNotes}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Budget Tab */}
                {activeTab === 'budget' && selectedItinerary.budgetBreakdown && (
                  <View>
                    {/* Total Budget */}
                    <View style={styles.modalBudgetTotalCard}>
                      <Text style={styles.modalBudgetTotalLabel}>Total Budget</Text>
                      <Text style={styles.modalBudgetTotalValue}>
                        ${selectedItinerary.budgetBreakdown.total?.toFixed(2) || 0}
                      </Text>
                    </View>

                    {/* Budget Breakdown */}
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.modalInfoTitle}>💰 Breakdown</Text>
                      <View style={styles.modalBudgetItem}>
                        <View style={styles.modalBudgetItemLeft}>
                          <Ionicons name="car-outline" size={20} color="#2196F3" />
                          <Text style={styles.modalBudgetItemLabel}>Transport</Text>
                        </View>
                        <Text style={styles.modalBudgetItemValue}>
                          ${selectedItinerary.budgetBreakdown.transport?.cost || 0}
                        </Text>
                      </View>
                      <View style={styles.modalBudgetItem}>
                        <View style={styles.modalBudgetItemLeft}>
                          <Ionicons name="bed-outline" size={20} color="#4CAF50" />
                          <Text style={styles.modalBudgetItemLabel}>Accommodation</Text>
                        </View>
                        <Text style={styles.modalBudgetItemValue}>
                          ${selectedItinerary.budgetBreakdown.accommodation?.cost || 0}
                        </Text>
                      </View>
                      <View style={styles.modalBudgetItem}>
                        <View style={styles.modalBudgetItemLeft}>
                          <Ionicons name="restaurant-outline" size={20} color="#FF9800" />
                          <Text style={styles.modalBudgetItemLabel}>Food</Text>
                        </View>
                        <Text style={styles.modalBudgetItemValue}>
                          ${selectedItinerary.budgetBreakdown.food?.cost || 0}
                        </Text>
                      </View>
                      <View style={styles.modalBudgetItem}>
                        <View style={styles.modalBudgetItemLeft}>
                          <Ionicons name="bicycle-outline" size={20} color="#9C27B0" />
                          <Text style={styles.modalBudgetItemLabel}>Activities</Text>
                        </View>
                        <Text style={styles.modalBudgetItemValue}>
                          ${selectedItinerary.budgetBreakdown.activities?.cost || 0}
                        </Text>
                      </View>
                    </View>

                    {/* Budget Visualization */}
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.modalInfoTitle}>📊 Budget Distribution</Text>
                      <View style={styles.modalBudgetBarContainer}>
                        <View style={styles.modalBudgetBarLabel}>
                          <Text style={styles.modalBudgetBarText}>Transport</Text>
                          <Text style={styles.modalBudgetBarPercent}>
                            {selectedItinerary.budgetBreakdown.total ? 
                              Math.round((selectedItinerary.budgetBreakdown.transport?.cost || 0) / selectedItinerary.budgetBreakdown.total * 100) : 0}%
                          </Text>
                        </View>
                        <View style={styles.modalBudgetBarTrack}>
                          <View style={[styles.modalBudgetBarFill, { 
                            width: `${selectedItinerary.budgetBreakdown.total ? 
                              Math.min((selectedItinerary.budgetBreakdown.transport?.cost || 0) / selectedItinerary.budgetBreakdown.total * 100, 100) : 0}%`,
                            backgroundColor: '#2196F3'
                          }]} />
                        </View>
                        
                        <View style={styles.modalBudgetBarLabel}>
                          <Text style={styles.modalBudgetBarText}>Accommodation</Text>
                          <Text style={styles.modalBudgetBarPercent}>
                            {selectedItinerary.budgetBreakdown.total ? 
                              Math.round((selectedItinerary.budgetBreakdown.accommodation?.cost || 0) / selectedItinerary.budgetBreakdown.total * 100) : 0}%
                          </Text>
                        </View>
                        <View style={styles.modalBudgetBarTrack}>
                          <View style={[styles.modalBudgetBarFill, { 
                            width: `${selectedItinerary.budgetBreakdown.total ? 
                              Math.min((selectedItinerary.budgetBreakdown.accommodation?.cost || 0) / selectedItinerary.budgetBreakdown.total * 100, 100) : 0}%`,
                            backgroundColor: '#4CAF50'
                          }]} />
                        </View>
                        
                        <View style={styles.modalBudgetBarLabel}>
                          <Text style={styles.modalBudgetBarText}>Food</Text>
                          <Text style={styles.modalBudgetBarPercent}>
                            {selectedItinerary.budgetBreakdown.total ? 
                              Math.round((selectedItinerary.budgetBreakdown.food?.cost || 0) / selectedItinerary.budgetBreakdown.total * 100) : 0}%
                          </Text>
                        </View>
                        <View style={styles.modalBudgetBarTrack}>
                          <View style={[styles.modalBudgetBarFill, { 
                            width: `${selectedItinerary.budgetBreakdown.total ? 
                              Math.min((selectedItinerary.budgetBreakdown.food?.cost || 0) / selectedItinerary.budgetBreakdown.total * 100, 100) : 0}%`,
                            backgroundColor: '#FF9800'
                          }]} />
                        </View>
                        
                        <View style={styles.modalBudgetBarLabel}>
                          <Text style={styles.modalBudgetBarText}>Activities</Text>
                          <Text style={styles.modalBudgetBarPercent}>
                            {selectedItinerary.budgetBreakdown.total ? 
                              Math.round((selectedItinerary.budgetBreakdown.activities?.cost || 0) / selectedItinerary.budgetBreakdown.total * 100) : 0}%
                          </Text>
                        </View>
                        <View style={styles.modalBudgetBarTrack}>
                          <View style={[styles.modalBudgetBarFill, { 
                            width: `${selectedItinerary.budgetBreakdown.total ? 
                              Math.min((selectedItinerary.budgetBreakdown.activities?.cost || 0) / selectedItinerary.budgetBreakdown.total * 100, 100) : 0}%`,
                            backgroundColor: '#9C27B0'
                          }]} />
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* Packing Tab */}
                {activeTab === 'packing' && (
                  <View>
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.modalInfoTitle}>🎒 Packing List</Text>
                      {selectedItinerary.selectedPackingItems?.length > 0 ? (
                        selectedItinerary.selectedPackingItems.map((item, index) => (
                          <View key={index} style={styles.modalPackingItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            <Text style={styles.modalPackingItemText}>{item}</Text>
                          </View>
                        ))
                      ) : (
                        <View style={styles.modalEmptyState}>
                          <Ionicons name="bag-outline" size={40} color="#ccc" />
                          <Text style={styles.modalEmptyText}>No packing items added yet</Text>
                        </View>
                      )}
                    </View>

                    {/* Packing Tips */}
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.modalInfoTitle}>💡 Packing Tips</Text>
                      <View style={styles.modalTipItem}>
                        <Ionicons name="checkmark" size={16} color="#4CAF50" />
                        <Text style={styles.modalTipText}>Pack light - you can always do laundry</Text>
                      </View>
                      <View style={styles.modalTipItem}>
                        <Ionicons name="checkmark" size={16} color="#4CAF50" />
                        <Text style={styles.modalTipText}>Roll clothes to save space</Text>
                      </View>
                      <View style={styles.modalTipItem}>
                        <Ionicons name="checkmark" size={16} color="#4CAF50" />
                        <Text style={styles.modalTipText}>Keep essentials in carry-on</Text>
                      </View>
                      <View style={styles.modalTipItem}>
                        <Ionicons name="checkmark" size={16} color="#4CAF50" />
                        <Text style={styles.modalTipText}>Check weather before packing</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionButtons}>
                <TouchableOpacity 
                  style={styles.modalShareButton}
                  onPress={() => shareToAnyPlatform(selectedItinerary)}
                >
                  <Ionicons name="share-social-outline" size={20} color="#fff" />
                  <Text style={styles.modalShareButtonText}>Share Trip</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalGuideButton}
                  onPress={() => {
                    setModalVisible(false);
                    router.push('/app-pages/TourGuideList');
                  }}
                >
                  <Ionicons name="people-outline" size={20} color="#007AFF" />
                  <Text style={styles.modalGuideButtonText}>Find a Guide</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="map-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Itineraries Yet</Text>
      <Text style={styles.emptyText}>
        Start planning your first adventure! Create a travel plan to see it here.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => router.push('/app-pages/createPlan')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Create Your First Plan</Text>
      </TouchableOpacity>
    </View>
  );

  const Footer = () => (
    <View style={styles.footerContainer}>
      <View style={styles.footerDivider} />
      <Text style={styles.footerQuote}>
        "Travel far enough to meet yourself."
      </Text>
      <Text style={styles.footerText}>
        Every journey begins with a single step. Your adventures are waiting — start planning your next unforgettable experience today.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* NEW HEADER SECTION ADDED AT THE TOP */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>Trip Planner</Text>
        <View style={styles.pageHeaderButtons}>
          <TouchableOpacity onPress={() => router.back()} style={styles.pageBackButton}>
            <Text style={styles.pageBackButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      {notificationVisible && notification && (
        <Animated.View
          style={[
            styles.notificationContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.notificationContent}
            onPress={handleNotificationPress}
            activeOpacity={0.9}
          >
            <View style={[styles.notificationIcon, { backgroundColor: getIconForType(notification.type).color + '20' }]}>
              <Ionicons 
                name={getIconForType(notification.type).name} 
                size={24} 
                color={getIconForType(notification.type).color} 
              />
            </View>
            
            <View style={styles.notificationTextContainer}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {notification.title}
              </Text>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {notification.message}
              </Text>
            </View>

            <TouchableOpacity onPress={dismissNotification} style={styles.notificationClose}>
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome to Your</Text>
            <Text style={styles.headerTitle}>Creative Travel Planner</Text>
          </View>

          <Text style={styles.subtitle}>
            Start your journey by creating, organizing, and exploring your perfect trip with your Anyone !.
          </Text>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#8E8E93" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destinations, locations..."
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/app-pages/createPlan')}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {searchQuery.length > 0 && (
            <Text style={styles.searchResultText}>
              Found {filteredItineraries.length} result{filteredItineraries.length !== 1 ? 's' : ''}
            </Text>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Itineraries</Text>
            <Text style={styles.sectionSubtitle}>
              Time to map out the voyage — one bold step at a time 🚶‍♀️
            </Text>
          </View>

          {recentPlans.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>🔥 Recent Adventures</Text>
                <TouchableOpacity onPress={() => {
                  if (recentPlans.length > 0) {
                    setSelectedItinerary(recentPlans[0]);
                    setModalVisible(true);
                  }
                }}>
                  <Text style={styles.recentSeeAll}>See More.. </Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentScrollContent}
              >
                {recentPlans.map((plan) => (
                  <RecentPlanCard key={plan.id} plan={plan} />
                ))}
              </ScrollView>
            </View>
          )}

          <FlatList
            data={filteredItineraries}
            renderItem={({ item }) => <ItineraryCard item={item} />}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={searchQuery.length > 0 ? 
              () => (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search-outline" size={50} color="#ccc" />
                  <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
                </View>
              ) : 
              EmptyState
            }
            scrollEnabled={false}
          />

          <Footer />
        </ScrollView>
      </SafeAreaView>

      <ItineraryDetailModal />
    </View>
  );
};

// ============================================
// UPDATED STYLES FOR REDESIGNED MODAL
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // NEW PAGE HEADER STYLES
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pageHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  pageHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageBackButton: {
    padding: 8,
  },
  pageBackButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: -60,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#000000',
    paddingVertical: 0,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  searchResultText: {
    fontSize: 14,
    color: '#666666',
    paddingHorizontal: 20,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  recentSection: {
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  recentSeeAll: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  recentScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 5,
  },
  recentPlanCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentPlanImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#f5f5f5',
  },
  recentPlanImagePlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentPlanEmoji: {
    fontSize: 36,
  },
  recentPlanOverlay: {
    padding: 10,
    backgroundColor: '#fff',
  },
  recentPlanTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  recentPlanTagText: {
    fontSize: 9,
    color: '#007AFF',
    fontWeight: '500',
  },
  recentPlanName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  recentPlanLocation: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  recentPlanDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentPlanDateText: {
    fontSize: 9,
    color: '#999',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  highlightedCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.2,
    elevation: 8,
  },
  cardImageWrapper: {
    position: 'relative',
    height: 180,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageEmoji: {
    fontSize: 50,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 55,
  },
  dateDay: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  dateMonth: {
    fontSize: 10,
    color: '#ddd',
  },
  cardContent: {
    padding: 16,
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  destinationIcon: {
    fontSize: 24,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666666',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
  },
  infoChipText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  budgetPreview: {
    marginBottom: 12,
  },
  budgetBar: {
    height: 4,
    backgroundColor: '#E8ECEF',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  budgetFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  budgetText: {
    fontSize: 11,
    color: 'black',
    fontWeight: '500',
  },
  captionPreview: {
    fontSize: 13,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 14,
    lineHeight: 18,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  updateBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  updateBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: 'red',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
    textAlign: 'center',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 3,
    paddingBottom: 5,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 5,
  },
  footerDivider: {
    width: 50,
    height: 2,
    backgroundColor: '#007AFF',
    borderRadius: 1,
    marginBottom: 10,
  },
  footerQuote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  notificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  notificationContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  notificationClose: {
    padding: 6,
  },

  // ============================================
  // REDESIGNED MODAL STYLES
  // ============================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalScrollContent: {
    paddingBottom: 30,
  },
  modalHeroSection: {
    position: 'relative',
    height: SCREEN_HEIGHT * 0.35,
  },
  modalHeroImage: {
    width: '100%',
    height: '100%',
  },
  modalHeroPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeroEmoji: {
    fontSize: 60,
  },
  modalHeroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  modalStatusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  modalStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalHeroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  modalHeroDestination: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  modalHeroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalHeroLocationText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '500',
  },
  modalQuoteContainer: {
    backgroundColor: '#F0F7F0',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 8,
    left: 12,
    opacity: 0.3,
  },
  modalQuoteText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 22,
    paddingLeft: 24,
  },
  modalTabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    padding: 4,
  },
  modalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
  },
  modalTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  modalTabTextActive: {
    color: '#007AFF',
  },
  modalTabContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalInfoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  modalInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 14,
  },
  modalInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
  },
  modalInfoItemFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  modalNotesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  modalBudgetTotalCard: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  modalBudgetTotalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  modalBudgetTotalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  modalBudgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalBudgetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalBudgetItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalBudgetItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalBudgetBarContainer: {
    marginTop: 8,
  },
  modalBudgetBarLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 12,
  },
  modalBudgetBarText: {
    fontSize: 12,
    color: '#666',
  },
  modalBudgetBarPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  modalBudgetBarTrack: {
    height: 8,
    backgroundColor: '#E8ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalBudgetBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalPackingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalPackingItemText: {
    fontSize: 14,
    color: '#555',
  },
  modalEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  modalEmptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  modalTipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  modalTipText: {
    fontSize: 13,
    color: '#666',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  modalShareButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalShareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalGuideButton: {
    flex: 1,
    backgroundColor: '#F0F7F0',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  modalGuideButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyItineraries;