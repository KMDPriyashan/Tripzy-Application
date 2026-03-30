import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

const TourGuidePage = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [destination, setDestination] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for enhanced functionality
  const [tourGuides, setTourGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const searchInputRef = useRef(null);
  const debounceTimeout = useRef(null);

  // Price rates (example)
  const BASE_PRICE_PER_DAY = 50;
  const PRICE_PER_PERSON = 25;

  useEffect(() => {
    loadCurrentUser();
    loadTourGuides();
  }, []);

  useEffect(() => {
    calculatePrice();
  }, [groupSize, selectedGuide]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadTourGuides = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tour_guides')
        .select('*')
        .eq('is_tour_guide', true)
        .order('full_name');

      if (error) throw error;
      setTourGuides(data || []);
      setFilteredGuides(data || []);
    } catch (error) {
      console.error('Error loading tour guides:', error);
      Alert.alert('Error', 'Failed to load tour guides');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    let price = BASE_PRICE_PER_DAY;
    if (groupSize && parseInt(groupSize) > 1) {
      price += (parseInt(groupSize) - 1) * PRICE_PER_PERSON;
    }
    setTotalPrice(price);
  };

  // Handle search input change with debouncing
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Debounce search to avoid too many re-renders
    debounceTimeout.current = setTimeout(() => {
      if (text.trim() === '') {
        setFilteredGuides(tourGuides);
        setShowSuggestions(false);
      } else {
        const filtered = tourGuides.filter(guide =>
          guide.full_name?.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredGuides(filtered);
        // Only show suggestions if there are results and user is still typing
        if (filtered.length > 0) {
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      }
    }, 300);
  };

  const handleSelectGuide = (guide) => {
    setSearchQuery(guide.full_name);
    setSelectedGuide(guide);
    setShowSuggestions(false);
    // Dismiss keyboard after selection
    searchInputRef.current?.blur();
  };

  const checkAvailability = async () => {
    if (!selectedGuide || !selectedDate) return true;
    
    try {
      const { data, error } = await supabase
        .from('tour_guide_bookings')
        .select('*')
        .eq('tour_guide_id', selectedGuide.id)
        .eq('booking_date', `${selectedDate}/${currentMonth + 1}/${currentYear}`)
        .eq('status', 'confirmed');

      if (error) throw error;
      return data.length === 0;
    } catch (error) {
      console.error('Error checking availability:', error);
      return true;
    }
  };

  const handleBooking = async () => {
    // Validation
    if (!selectedGuide) {
      Alert.alert('Error', 'Please select a tour guide');
      return;
    }
    
    if (!destination) {
      Alert.alert('Error', 'Please enter destination');
      return;
    }
    
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    
    if (!groupSize || parseInt(groupSize) < 1) {
      Alert.alert('Error', 'Please enter valid group size');
      return;
    }

    // Check availability
    const isAvailable = await checkAvailability();
    if (!isAvailable) {
      Alert.alert('Not Available', 'This tour guide is already booked on this date. Please select another date.');
      return;
    }
    
    // Show booking summary
    Alert.alert(
      'Confirm Booking',
      `📋 Booking Summary:\n\n` +
      `Guide: ${selectedGuide.full_name}\n` +
      `📍 Destination: ${destination}\n` +
      `📅 Date: ${selectedDate}/${currentMonth + 1}/${currentYear}\n` +
      `👥 Group Size: ${groupSize}\n` +
      `💰 Total Price: $${totalPrice}\n` +
      `${specialRequests ? `📝 Special Requests: ${specialRequests}\n` : ''}\n` +
      `Confirm your booking?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: submitBooking }
      ]
    );
  };

  const submitBooking = async () => {
    setLoading(true);
    
    // Generate UUID for booking
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    const bookingData = {
      id: generateUUID(),
      tour_guide_id: selectedGuide.id,
      tour_guide_name: selectedGuide.full_name,
      user_id: currentUser?.id,
      user_name: currentUser?.user_metadata?.full_name || 'Guest',
      user_email: currentUser?.email,
      destination: destination,
      booking_date: `${selectedDate}/${currentMonth + 1}/${currentYear}`,
      group_size: parseInt(groupSize),
      total_price: totalPrice,
      special_requests: specialRequests,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('tour_guide_bookings')
        .insert([bookingData]);

      if (error) throw error;

      Alert.alert(
        'Booking Successful! 🎉',
        `Your booking request has been sent to ${selectedGuide.full_name}. They will contact you soon.`,
        [{ text: 'OK', onPress: resetForm }]
      );
    } catch (error) {
      console.error('Error booking:', error);
      Alert.alert('Error', 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSelectedGuide(null);
    setDestination('');
    setGroupSize('');
    setSpecialRequests('');
    setSelectedDate(new Date().getDate());
    setTotalPrice(0);
  };

  const handleFindBooking = () => {
    router.push('/app-pages/TourGuideList');
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  };

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', isCurrentMonth: false, key: `empty-${i}` });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        isCurrentMonth: true,
        isToday: i === new Date().getDate() && 
                 currentMonth === new Date().getMonth() && 
                 currentYear === new Date().getFullYear(),
        key: `day-${i}`
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectGuide(item)}>
      <Ionicons name="person-circle-outline" size={30} color="#007AFF" />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName}>{item.full_name}</Text>
        <Text style={styles.suggestionDetails}>
          {item.experience || 'N/A'} exp • {item.languages || 'Multiple languages'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Easy Guide Booking</Text>
          <Text style={styles.heroSubtitle}>
            Pick your place, set your date, and book instantly
          </Text>
        </View>

        {/* Search Tour Guide Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👤 Who did you select?</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#8E8E93" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search tour guide name..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              onFocus={() => {
                // Only show suggestions if there's text and filtered results
                if (searchQuery.trim() !== '' && filteredGuides.length > 0) {
                  setShowSuggestions(true);
                }
              }}
            />
            {loading && <ActivityIndicator size="small" color="#007AFF" />}
            {!loading && searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setFilteredGuides(tourGuides);
                setShowSuggestions(false);
              }}>
                <Ionicons name="close-circle" size={18} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          {/* Selected Guide Info */}
          {selectedGuide && (
            <TouchableOpacity 
              style={styles.selectedGuideCard}
              onPress={() => setShowGuideModal(true)}
            >
              <View style={styles.selectedGuideHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.selectedGuideTitle}>Selected Guide</Text>
              </View>
              <Text style={styles.selectedGuideName}>{selectedGuide.full_name}</Text>
              <View style={styles.selectedGuideTags}>
                <View style={styles.tag}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.tagText}>4.8 ★</Text>
                </View>
                <View style={styles.tag}>
                  <Ionicons name="language" size={12} color="#007AFF" />
                  <Text style={styles.tagText}>Multi-lingual</Text>
                </View>
                <View style={styles.tag}>
                  <Ionicons name="cash" size={12} color="#34C759" />
                  <Text style={styles.tagText}>${BASE_PRICE_PER_DAY}/day</Text>
                </View>
              </View>
              <Text style={styles.viewProfileText}>Tap to view full profile →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Price Calculator Section */}
        {selectedGuide && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>💰 Price Calculator</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Base Price (per day):</Text>
              <Text style={styles.priceValue}>${BASE_PRICE_PER_DAY}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Extra person fee:</Text>
              <Text style={styles.priceValue}>${PRICE_PER_PERSON}/person</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Price:</Text>
              <Text style={styles.totalValue}>${totalPrice}</Text>
            </View>
            <TouchableOpacity 
              style={styles.priceInfoButton}
              onPress={() => setShowPriceBreakdown(!showPriceBreakdown)}
            >
              <Text style={styles.priceInfoText}>
                {showPriceBreakdown ? 'Hide' : 'Show'} price breakdown
              </Text>
            </TouchableOpacity>
            {showPriceBreakdown && (
              <View style={styles.priceBreakdown}>
                <Text style={styles.breakdownText}>
                  • Base price: ${BASE_PRICE_PER_DAY}
                  {groupSize && parseInt(groupSize) > 1 && `\n• Extra ${parseInt(groupSize) - 1} persons: $${(parseInt(groupSize) - 1) * PRICE_PER_PERSON}`}
                  {groupSize && parseInt(groupSize) > 1 && `\n• Total: $${totalPrice}`}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Black Info Card */}
        <View style={styles.blackInfoCard}>
          <Text style={styles.blackInfoText}>
            You should quickly find a tour guide and book after reviewing their profile.
          </Text>
          <TouchableOpacity 
            style={styles.findBookingButton}
            onPress={handleFindBooking}
          >
            <Text style={styles.findBookingButtonText}>Find Booking</Text>
          </TouchableOpacity>
        </View>

        {/* Destination Input */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📍 Where do you want to go?</Text>
          <View style={styles.destinationInputContainer}>
            <Ionicons name="location-outline" size={20} color="#007AFF" />
            <TextInput
              style={styles.destinationInput}
              placeholder="Enter destination (e.g., Kandy, Galle, Colombo)"
              value={destination}
              onChangeText={setDestination}
            />
          </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarCard}>
          <Text style={styles.sectionTitle}>📅 Date Picker</Text>
          <Text style={styles.calendarSubtitle}>
            Pick your suitable date for booking Tour Guide
          </Text>

          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthNavButton}>
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
              {getMonthName(currentMonth)} {currentYear}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavButton}>
              <Ionicons name="chevron-forward" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysRow}>
            {weekDays.map((day, index) => (
              <Text key={index} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.calendarDay,
                  !item.isCurrentMonth && styles.otherMonthDay,
                  item.isToday && styles.todayDay,
                  selectedDate === item.day && item.isCurrentMonth && styles.selectedDay
                ]}
                onPress={() => item.isCurrentMonth && setSelectedDate(item.day)}
                disabled={!item.isCurrentMonth}
              >
                <Text style={[
                  styles.calendarDayText,
                  !item.isCurrentMonth && styles.otherMonthDayText,
                  item.isToday && styles.todayDayText,
                  selectedDate === item.day && item.isCurrentMonth && styles.selectedDayText
                ]}>
                  {item.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Group Size */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👥 Group Size</Text>
          <TextInput
            style={styles.groupSizeInput}
            placeholder="Enter number of people"
            value={groupSize}
            onChangeText={setGroupSize}
            keyboardType="numeric"
          />
          <Text style={styles.helperText}>
            Additional persons will incur extra charges
          </Text>
        </View>

        {/* Special Requests */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📝 Special Requests</Text>
          <TextInput
            style={[styles.groupSizeInput, styles.textArea]}
            placeholder="Any special requirements? (dietary needs, accessibility, preferred language, etc.)"
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Ready to Book Text */}
        <Text style={styles.readyToBookText}>
          Ready to book your guide? Start your journey now.
        </Text>

        {/* Ask Booking Button */}
        <TouchableOpacity 
          style={[styles.askBookingButton, (!selectedGuide || loading) && styles.disabledButton]}
          onPress={handleBooking}
          disabled={!selectedGuide || loading}
        >
          <Text style={styles.askBookingButtonText}>
            {loading ? 'Processing...' : 'Ask Booking'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Suggestions Modal */}
      <Modal
        visible={showSuggestions && filteredGuides.length > 0}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuggestions(false)}
        >
          <View style={styles.suggestionsModal}>
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsHeaderText}>
                Select a Tour Guide ({filteredGuides.length} found)
              </Text>
              <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredGuides}
              renderItem={renderSuggestionItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="always"
              initialNumToRender={10}
              maxToRenderPerBatch={10}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* No Results Modal */}
      <Modal
        visible={showSuggestions && searchQuery.trim() !== '' && filteredGuides.length === 0 && !loading}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuggestions(false)}
        >
          <View style={styles.noResultsModal}>
            <Ionicons name="person-outline" size={50} color="#ccc" />
            <Text style={styles.noResultsText}>No tour guides found</Text>
            <Text style={styles.noResultsSubtext}>
              No registered tour guides match "{searchQuery}"
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSuggestions(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Tour Guide Profile Modal */}
      <Modal visible={showGuideModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.profileModal}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileTitle}>Tour Guide Profile</Text>
              <TouchableOpacity onPress={() => setShowGuideModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.profileContent}>
                <Ionicons name="person-circle" size={80} color="#007AFF" />
                <Text style={styles.profileName}>{selectedGuide?.full_name}</Text>
                <Text style={styles.profileEmail}>{selectedGuide?.user_email}</Text>
                
                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>Experience</Text>
                  <Text>{selectedGuide?.experience || 'Not specified'} years</Text>
                </View>
                
                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>Languages</Text>
                  <Text>{selectedGuide?.languages || 'Not specified'}</Text>
                </View>
                
                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>Description</Text>
                  <Text>{selectedGuide?.description || 'No description provided'}</Text>
                </View>
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
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 70,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    paddingVertical: 0,
  },
  selectedGuideCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E8F1FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF20',
  },
  selectedGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedGuideTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 4,
  },
  selectedGuideName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedGuideTags: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  viewProfileText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  priceInfoButton: {
    marginTop: 8,
    alignItems: 'center',
  },
  priceInfoText: {
    fontSize: 12,
    color: '#007AFF',
  },
  priceBreakdown: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  breakdownText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  blackInfoCard: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  blackInfoText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  findBookingButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  findBookingButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  destinationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  destinationInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    paddingVertical: 0,
  },
  calendarCard: {
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
  calendarSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  monthNavButton: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 30,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 5,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  otherMonthDay: {
    opacity: 0.2,
  },
  todayDay: {
    backgroundColor: '#E8F1FF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectedDay: {
    backgroundColor: '#007AFF',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  otherMonthDayText: {
    color: '#999',
  },
  todayDayText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  groupSizeInput: {
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
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },
  readyToBookText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  askBookingButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  askBookingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionsHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionContent: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  suggestionDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noResultsModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  profileContent: {
    padding: 20,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileSection: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
});

export default TourGuidePage;