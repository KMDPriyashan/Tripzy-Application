import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
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
import ViewShot from 'react-native-view-shot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MyItineraries = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [itineraries, setItineraries] = useState([]);
  const [filteredItineraries, setFilteredItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [sharingItinerary, setSharingItinerary] = useState(null);
  const [highlightedPlanId, setHighlightedPlanId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [recentPlans, setRecentPlans] = useState([]);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef(null);
  const viewShotRef = useRef(null);

  // Bottom navigation items
  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/' },
    { name: 'Map', icon: 'map-outline', activeIcon: 'map', route: '/app-pages/map' },
    { name: 'Feed', icon: 'newspaper-outline', activeIcon: 'newspaper', route: '/app-pages/feed' },
    { name: 'Group', icon: 'people-outline', activeIcon: 'people', route: '/app-pages/TourGuide' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/auth/profile' },
  ];

  const [activeTab, setActiveTab] = useState('Home');

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

  const loadItineraries = async () => {
    try {
      const savedPlans = await AsyncStorage.getItem('travelPlans');
      if (savedPlans) {
        const plans = JSON.parse(savedPlans);
        // Sort by created date (newest first)
        const sortedPlans = plans.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setItineraries(sortedPlans);
        setFilteredItineraries(sortedPlans);
        
        // Get newest 5 plans for recommendations
        const newestPlans = sortedPlans.slice(0, 5);
        setRecentPlans(newestPlans);
      }
    } catch (error) {
      console.error('Error loading itineraries:', error);
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

  // Delete function
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
              const updatedItineraries = itineraries.filter(item => item.id !== id);
              await AsyncStorage.setItem('travelPlans', JSON.stringify(updatedItineraries));
              setItineraries(updatedItineraries);
              setFilteredItineraries(updatedItineraries);
              // Update recent plans
              const sortedPlans = updatedItineraries.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
              );
              setRecentPlans(sortedPlans.slice(0, 5));
              Alert.alert('Success', 'Itinerary deleted successfully');
              
              showNotification(
                'success',
                'Deleted Successfully 🗑️',
                'The itinerary has been removed',
                {}
              );
            } catch (error) {
              console.error('Error deleting itinerary:', error);
            }
          }
        }
      ]
    );
  };

  // Enhanced share function with image capture
  const handleShare = async (itinerary) => {
    setSharingItinerary(itinerary);
    setShareModalVisible(true);
  };

  const captureAndShare = async () => {
    try {
      if (!viewShotRef.current) {
        Alert.alert('Error', 'Could not capture image');
        setShareModalVisible(false);
        return;
      }

      const uri = await viewShotRef.current.capture({
        format: 'png',
        quality: 0.95,
        result: 'tmpfile',
      });

      setShareModalVisible(false);

      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Share my trip to ${sharingItinerary.destination}`,
          UTI: 'image.png',
        });
        
        showNotification(
          'success',
          'Shared Successfully! 📤',
          `Your trip to ${sharingItinerary.destination} has been shared`,
          { planId: sharingItinerary.id }
        );
      } else {
        const message = await generateShareMessage(sharingItinerary);
        await Share.share({
          message,
          title: `My Trip to ${sharingItinerary.destination || 'Amazing Destination'}`,
        });
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
      setShareModalVisible(false);
    }
  };

  // Generate text message fallback
  const generateShareMessage = async (itinerary) => {
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
💰 BUDGET BREAKDOWN:
• Transport: $${itinerary.budgetBreakdown.transport?.cost || 0}
• Accommodation: $${itinerary.budgetBreakdown.accommodation?.cost || 0}
• Food: $${itinerary.budgetBreakdown.food?.cost || 0}
• Activities: $${itinerary.budgetBreakdown.activities?.cost || 0}
━━━━━━━━━━━━━━━━━━━━
• TOTAL: $${itinerary.budgetBreakdown.total?.toFixed(2) || 0}`;
    }

    let packingText = '';
    if (itinerary.selectedPackingItems && itinerary.selectedPackingItems.length > 0) {
      const items = itinerary.selectedPackingItems.slice(0, 5).join(' • ');
      packingText = `
🎒 PACKING ESSENTIALS:
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

    return `
━━━━━━━━━━━━━━━━━━━━
   ${getTypeEmoji()}  TRAVEL ADVENTURE  ${getTypeEmoji()}
━━━━━━━━━━━━━━━━━━━━

📍 ${itinerary.destination?.toUpperCase() || 'EXCITING DESTINATION'}

${itinerary.planningLocation ? `✨ ${itinerary.planningLocation}` : ''}
${itinerary.province ? `📍 ${itinerary.province}` : ''}

━━━━━━━━━━━━━━━━━━━━
📅 TRIP DETAILS:
━━━━━━━━━━━━━━━━━━━━
• Start: ${startDate} ${itinerary.startedTime ? `at ${itinerary.startedTime}` : ''}
• End:   ${endDate}
• Status: ${getStatusEmoji(itinerary.currentStatus)} ${itinerary.currentStatus || 'Planned'}

${itinerary.postCaption ? `
💭 "${itinerary.postCaption}"
` : ''}
${budgetText}
${packingText}

━━━━━━━━━━━━━━━━━━━━
✨ Plan your own adventure with Travel Planner!
📱 Download the app and start your journey today!
━━━━━━━━━━━━━━━━━━━━

#TravelPlanner #Adventure #${itinerary.destination?.replace(/\s+/g, '') || 'Travel'} #Wanderlust`;
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
      case 'planned': return '#007AFF';
      case 'in progress': return '#FF9500';
      case 'completed': return '#34C759';
      default: return '#666';
    }
  };

  const handleNavPress = (route, tabName) => {
    setActiveTab(tabName);
    if (route) {
      router.push(route);
    }
  };

  // Share Modal Component
  const ShareModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={shareModalVisible}
      onRequestClose={() => setShareModalVisible(false)}
    >
      <View style={styles.shareModalOverlay}>
        <View style={styles.shareModalContent}>
          <Text style={styles.shareModalTitle}>Creating Share Image...</Text>
          <Text style={styles.shareModalSubtitle}>Please wait a moment</Text>
          
          {sharingItinerary && (
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.95 }}>
              <View style={styles.shareCard}>
                {sharingItinerary.image ? (
                  <Image 
                    source={{ uri: sharingItinerary.image }} 
                    style={styles.shareBackgroundImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.shareBackgroundImage, styles.sharePlaceholderBackground]}>
                    <Ionicons name="image-outline" size={60} color="#fff" />
                  </View>
                )}
                <View style={styles.shareGradient} />
                <View style={styles.shareContent}>
                  <View style={styles.shareTopSection}>
                    <View style={styles.shareDateBadge}>
                      <Ionicons name="calendar" size={14} color="#fff" />
                      <Text style={styles.shareDate}>
                        {formatDate(sharingItinerary.startDate)}
                      </Text>
                    </View>
                    <View style={styles.shareEmojiBadge}>
                      <Text style={styles.shareEmoji}>
                        {getEmojiForDestination(sharingItinerary.destination)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.shareMainContent}>
                    <Text style={styles.shareDestination}>
                      {sharingItinerary.planningLocation || 'Amazing Destination'}
                    </Text>
                    <Text style={styles.shareLocation}>
                      <Ionicons name="location" size={14} color="#FFD700" /> {sharingItinerary.province || 'Sri Lanka'}
                    </Text>
                    <View style={styles.shareTimeBadge}>
                      <Ionicons name="time" size={14} color="#FFD700" />
                      <Text style={styles.shareTimeLabel}> Starts at </Text>
                      <Text style={styles.shareTimeValue}>
                        {sharingItinerary.startedTime || '6.00 A.M'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.shareBottomSection}>
                    <View style={styles.shareStats}>
                      <View style={styles.shareStat}>
                        <Ionicons name="heart" size={16} color="#FF6B6B" />
                        <Text style={styles.shareStatText}>1.2k</Text>
                      </View>
                      <View style={styles.shareStat}>
                        <Ionicons name="chatbubble" size={16} color="#4A90E2" />
                        <Text style={styles.shareStatText}>1.75k</Text>
                      </View>
                    </View>

                    {sharingItinerary.postCaption && (
                      <View style={styles.shareCaptionContainer}>
                        <Text style={styles.shareCaptionLabel}>Caption</Text>
                        <Text style={styles.shareCaption} numberOfLines={2}>
                          "{sharingItinerary.postCaption}"
                        </Text>
                      </View>
                    )}

                    <View style={styles.shareBranding}>
                      <Text style={styles.shareBrandingText}>Travel Planner</Text>
                      <Text style={styles.shareBrandingSub}>Plan Your Perfect Journey</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ViewShot>
          )}

          <TouchableOpacity 
            style={styles.shareModalButton}
            onPress={captureAndShare}
          >
            <Text style={styles.shareModalButtonText}>Continue Sharing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareModalCancel}
            onPress={() => setShareModalVisible(false)}
          >
            <Text style={styles.shareModalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const getEmojiForDestination = (destination) => {
    const dest = (destination || '').toLowerCase();
    if (dest.includes('beach')) return '🏖️';
    if (dest.includes('mountain')) return '⛰️';
    if (dest.includes('waterfall')) return '🌊';
    if (dest.includes('city')) return '🏙️';
    if (dest.includes('adventure')) return '🧗';
    return '✈️';
  };

  const ItineraryCard = ({ item }) => {
    const formattedDate = formatDate(item.startDate);
    const isHighlighted = item.id === highlightedPlanId;
    
    const getEmoji = () => {
      const dest = (item.destination || '').toLowerCase();
      if (dest.includes('beach')) return '🏖️';
      if (dest.includes('mountain')) return '⛰️';
      if (dest.includes('waterfall')) return '🌊';
      if (dest.includes('city')) return '🏙️';
      if (dest.includes('adventure')) return '🧗';
      return '🏠️';
    };

    return (
      <View style={[styles.card, isHighlighted && styles.highlightedCard]}>
        <TouchableOpacity 
          style={styles.cardContent}
          onPress={() => {
            setSelectedItinerary(item);
            setModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.cardDateHeader}>
            <Text style={styles.cardDate}>
              {formattedDate}
            </Text>
            <Text style={styles.cardHeaderEmoji}>{getEmoji()}</Text>
          </View>

          <Text style={styles.cardLocationTitle}>
            {item.planningLocation || 'Bopath Alla Waterfall'}
          </Text>

          <Text style={styles.cardAddress} numberOfLines={2}>
            {item.province || 'Agalwatte village, Kuruwita, in the Ratnapura District of Sri Lanka.'}
          </Text>

          <View style={styles.startTimeRow}>
            <Text style={styles.startTimeLabel}>Start By :</Text>
            <Text style={styles.startTimeValue}>{item.startedTime || '6.00 A.M'}</Text>
          </View>

          <TouchableOpacity style={styles.approveButton}>
            <Text style={styles.approveButtonText}>Approve the Travel Guide</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.seeMoreButton}
            onPress={() => {
              setSelectedItinerary(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.seeMoreButtonText}>See More</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={18} color="#FF6B6B" />
            <Text style={styles.statText}>1.2 k Reps</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={18} color="#4A90E2" />
            <Text style={styles.statText}>1.75 k Comments</Text>
          </View>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => handleUpdateItinerary(item)}
          >
            <Text style={styles.updateButtonText}>UPDATE</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => handleShare(item)}
          >
            <Text style={styles.shareButtonText}>SHARE</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteItinerary(item.id)}
          >
            <Text style={styles.deleteButtonText}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Recent Plan Card Component for Recommendations
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

    return (
      <TouchableOpacity 
        style={styles.recentPlanCard}
        onPress={() => {
          setSelectedItinerary(plan);
          setModalVisible(true);
        }}
      >
        {/* Card Image */}
        {plan.image ? (
          <Image source={{ uri: plan.image }} style={styles.recentPlanImage} />
        ) : (
          <View style={[styles.recentPlanImage, styles.recentPlanImagePlaceholder]}>
            <Text style={styles.recentPlanEmoji}>{getPlanEmoji()}</Text>
          </View>
        )}
        
        {/* Overlay */}
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

  const ItineraryDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedItinerary && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Trip Details</Text>
                  <TouchableOpacity onPress={() => handleShare(selectedItinerary)}>
                    <Ionicons name="share-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>
                </View>

                {selectedItinerary.image ? (
                  <Image source={{ uri: selectedItinerary.image }} style={styles.modalImage} />
                ) : (
                  <View style={[styles.modalImage, styles.modalPlaceholderImage]}>
                    <Ionicons name="image-outline" size={50} color="#ccc" />
                  </View>
                )}

                <View style={styles.modalBody}>
                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalDestination}>
                      {selectedItinerary.destination || 'Untitled Destination'}
                    </Text>
                    <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedItinerary.currentStatus) }]}>
                      <Text style={styles.modalStatusText}>{selectedItinerary.currentStatus || 'Planned'}</Text>
                    </View>
                  </View>

                  {selectedItinerary.postCaption && (
                    <Text style={styles.modalCaption}>"{selectedItinerary.postCaption}"</Text>
                  )}

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailCard}>
                      <Ionicons name="calendar" size={20} color="#007AFF" />
                      <Text style={styles.detailLabel}>Start Date</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedItinerary.startDate)}</Text>
                    </View>
                    <View style={styles.detailCard}>
                      <Ionicons name="calendar" size={20} color="#FF6B6B" />
                      <Text style={styles.detailLabel}>End Date</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedItinerary.endDate)}</Text>
                    </View>
                    <View style={styles.detailCard}>
                      <Ionicons name="time" size={20} color="#34C759" />
                      <Text style={styles.detailLabel}>Start Time</Text>
                      <Text style={styles.detailValue}>{selectedItinerary.startedTime || 'Not set'}</Text>
                    </View>
                    <View style={styles.detailCard}>
                      <Ionicons name="people" size={20} color="#FF9500" />
                      <Text style={styles.detailLabel}>Collaborators</Text>
                      <Text style={styles.detailValue}>0</Text>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>📍 Location Details</Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="location" size={16} color="#666" />
                      <Text style={styles.infoText}>
                        {selectedItinerary.planningLocation || 'Location not specified'}
                        {selectedItinerary.province ? `, ${selectedItinerary.province}` : ''}
                      </Text>
                    </View>
                  </View>

                  {selectedItinerary.budgetBreakdown && (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>💰 Budget Breakdown</Text>
                      <View style={styles.budgetItems}>
                        <View style={styles.budgetItem}>
                          <Text style={styles.budgetItemLabel}>Transport</Text>
                          <Text style={styles.budgetItemValue}>
                            ${selectedItinerary.budgetBreakdown.transport?.cost || 0}
                          </Text>
                        </View>
                        <View style={styles.budgetItem}>
                          <Text style={styles.budgetItemLabel}>Accommodation</Text>
                          <Text style={styles.budgetItemValue}>
                            ${selectedItinerary.budgetBreakdown.accommodation?.cost || 0}
                          </Text>
                        </View>
                        <View style={styles.budgetItem}>
                          <Text style={styles.budgetItemLabel}>Food</Text>
                          <Text style={styles.budgetItemValue}>
                            ${selectedItinerary.budgetBreakdown.food?.cost || 0}
                          </Text>
                        </View>
                        <View style={styles.budgetItem}>
                          <Text style={styles.budgetItemLabel}>Activities</Text>
                          <Text style={styles.budgetItemValue}>
                            ${selectedItinerary.budgetBreakdown.activities?.cost || 0}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.totalBudget}>
                        <Text style={styles.totalBudgetLabel}>Total</Text>
                        <Text style={styles.totalBudgetValue}>
                          ${selectedItinerary.budgetBreakdown.total?.toFixed(2) || 0}
                        </Text>
                      </View>
                    </View>
                  )}

                  {selectedItinerary.selectedPackingItems?.length > 0 && (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>🎒 Packing List</Text>
                      <View style={styles.packingItems}>
                        {selectedItinerary.selectedPackingItems.map((item, index) => (
                          <View key={index} style={styles.packingItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                            <Text style={styles.packingItemText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {selectedItinerary.tripNotes && (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>📝 Trip Notes</Text>
                      <Text style={styles.notesText}>{selectedItinerary.tripNotes}</Text>
                    </View>
                  )}

                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.whatsappButton} onPress={() => handleShare(selectedItinerary)}>
                      <Ionicons name="share-social" size={18} color="#fff" />
                      <Text style={styles.whatsappButtonText}>Share This Adventure</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.reserveButton}
                      onPress={() => {
                        setModalVisible(false);
                        Alert.alert('Reserve', 'Reservation feature coming soon!');
                      }}
                    >
                      <Text style={styles.reserveButtonText}>Reserve for 'Travel Guide'</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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

  return (
    <View style={styles.container}>
      {/* Notification Component */}
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
          {/* Centered Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome to Your</Text>
            <Text style={styles.headerTitle}>Creative Travel Planner</Text>
          </View>

          {/* Centered Subtitle */}
          <Text style={styles.subtitle}>
            Start your journey by creating, organizing, and exploring your perfect trip with your Anyone !.
          </Text>

          {/* Search Bar and Add Button */}
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

          {/* Search Results Count */}
          {searchQuery.length > 0 && (
            <Text style={styles.searchResultText}>
              Found {filteredItineraries.length} result{filteredItineraries.length !== 1 ? 's' : ''}
            </Text>
          )}

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Itineraries</Text>
            <Text style={styles.sectionSubtitle}>
              Time to map out the voyage — one bold step at a time 🚶‍♀️
            </Text>
          </View>

          {/* Recent Plans Section - Newest 5 Plans */}
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
                  <Text style={styles.recentSeeAll}>See All</Text>
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

          {/* Itineraries List */}
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
        </ScrollView>
      </SafeAreaView>

      {/* Detail Modal */}
      <ItineraryDetailModal />

      {/* Share Modal */}
      <ShareModal />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => handleNavPress(item.route, item.name)}
          >
            <Ionicons 
              name={activeTab === item.name ? item.activeIcon : item.icon} 
              size={24} 
              color={activeTab === item.name ? '#007AFF' : '#8E8E93'} 
            />
            <Text style={[
              styles.navText, 
              activeTab === item.name && styles.navTextActive
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
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
    backgroundColor: '#F2F2F7',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
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
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  // Recent Plans Section Styles
  recentSection: {
    marginBottom: 20,
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
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  recentPlanImagePlaceholder: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentPlanEmoji: {
    fontSize: 40,
  },
  recentPlanOverlay: {
    padding: 10,
    backgroundColor: '#fff',
  },
  recentPlanTag: {
    backgroundColor: '#007AFF20',
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
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightedCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    width: '100%',
  },
  cardDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardDate: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  cardHeaderEmoji: {
    fontSize: 20,
  },
  cardLocationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  cardAddress: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 18,
  },
  startTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  startTimeLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  startTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  approveButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  approveButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  seeMoreButton: {
    marginBottom: 16,
  },
  seeMoreButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 6,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginLeft: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalPlaceholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalDestination: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  modalStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalCaption: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  budgetItems: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  budgetItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  budgetItemValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalBudget: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  totalBudgetLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalBudgetValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  packingItems: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  packingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  packingItemText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
  },
  actionButtons: {
    marginTop: 20,
  },
  whatsappButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reserveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  navTextActive: {
    color: '#007AFF',
    fontWeight: '500',
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
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  shareModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  shareModalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  shareModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareModalCancel: {
    paddingVertical: 10,
  },
  shareModalCancelText: {
    color: '#999',
    fontSize: 14,
  },
  shareCard: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  shareBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  sharePlaceholderBackground: {
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  shareContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  shareTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  shareDate: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  shareEmojiBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareEmoji: {
    fontSize: 22,
  },
  shareMainContent: {
    alignItems: 'center',
  },
  shareDestination: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  shareLocation: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shareTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },
  shareTimeLabel: {
    color: '#fff',
    fontSize: 12,
    marginHorizontal: 2,
  },
  shareTimeValue: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  shareBottomSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 15,
  },
  shareStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  shareStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareStatText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  shareCaptionContainer: {
    marginBottom: 12,
  },
  shareCaptionLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginBottom: 2,
  },
  shareCaption: {
    color: '#fff',
    fontSize: 12,
    fontStyle: 'italic',
  },
  shareBranding: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
  },
  shareBrandingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  shareBrandingSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },
});

export default MyItineraries;