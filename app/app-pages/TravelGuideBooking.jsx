import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const TravelGuideBooking = ({ navigation }) => {
  // ============ STATE VARIABLES ============
  const [selectedGuide, setSelectedGuide] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [groupSize, setGroupSize] = useState(1);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [selectedYear, setSelectedYear] = useState('2026');
  
  // Sample data
  const guideNames = ['Alex Johnson', 'Maria Garcia', 'Wei Chen', 'Fatima Hassan'];
  
  // FIXED: Changed to use objects with unique IDs instead of strings
  const weekdays = [
    { id: 'sun', label: 'S' },
    { id: 'mon', label: 'M' },
    { id: 'tue', label: 'T' },
    { id: 'wed', label: 'W' },
    { id: 'thu', label: 'T' },
    { id: 'fri', label: 'F' },
    { id: 'sat', label: 'S' }
  ];
  
  // Guide profiles with details
  const guideProfiles = [
    { 
      id: 1,
      name: 'Alex Johnson', 
      rating: 4.8, 
      reviews: 124, 
      price: '$45/hour',
      languages: 'English, Spanish',
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    { 
      id: 2,
      name: 'Maria Garcia', 
      rating: 4.9, 
      reviews: 89, 
      price: '$50/hour',
      languages: 'English, French',
      image: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    { 
      id: 3,
      name: 'Wei Chen', 
      rating: 4.7, 
      reviews: 156, 
      price: '$40/hour',
      languages: 'English, Mandarin',
      image: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    { 
      id: 4,
      name: 'Fatima Hassan', 
      rating: 5.0, 
      reviews: 67, 
      price: '$55/hour',
      languages: 'English, Arabic',
      image: 'https://randomuser.me/api/portraits/women/4.jpg'
    }
  ];

  // Calendar days for October 2026
  const calendarDays = [
    [1, null, null, null, null, null, 8],
    [2, 3, 4, 5, 6, 7, 9],
    [10, 11, 12, 13, 14, 15, 16],
    [17, 18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29, 30]
  ];

  // ============ FUNCTION 1: Handle Guide Selection ============
  const handleGuideChange = (value) => {
    setSelectedGuide(value);
    setShowGuideModal(false);
  };

  // ============ FUNCTION 2: Handle Destination Input ============
  const handleDestinationChange = (text) => {
    setDestination(text);
  };

  // ============ FUNCTION 3: Handle Date Selection ============
  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(day);
      console.log(`Date selected: ${day}`);
    }
  };

  // ============ FUNCTION 4: Handle Group Size Change ============
  const handleGroupSizeChange = (text) => {
    const value = parseInt(text) || 1;
    if (value > 0 && value <= 20) {
      setGroupSize(value);
    } else if (value > 20) {
      Alert.alert('Maximum Limit', 'Group size cannot exceed 20 people.');
      setGroupSize(20);
    }
  };

  // ============ FUNCTION 5: Handle Increment Group Size ============
  const incrementGroupSize = () => {
    if (groupSize < 20) {
      setGroupSize(groupSize + 1);
    }
  };

  // ============ FUNCTION 6: Handle Decrement Group Size ============
  const decrementGroupSize = () => {
    if (groupSize > 1) {
      setGroupSize(groupSize - 1);
    }
  };

  // ============ FUNCTION 7: Handle Ask Booking (Submit) ============
  const handleAskBooking = () => {
    if (!selectedGuide) {
      Alert.alert('Error', 'Please select a tour guide.');
      return;
    }
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination.');
      return;
    }
    if (!selectedDate) {
      Alert.alert('Error', 'Please pick a date.');
      return;
    }
    
    const guideDetail = guideProfiles.find(g => g.name === selectedGuide);
    
    Alert.alert(
      'Booking Request Submitted!',
      `Guide: ${selectedGuide}\n` +
      `Destination: ${destination}\n` +
      `Date: ${selectedMonth} ${selectedDate}\n` +
      `Group Size: ${groupSize}\n` +
      `Price: ${guideDetail ? guideDetail.price : '$45/hour'}\n\n` +
      `Total Estimated: $${groupSize * 45}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Booking', onPress: () => handleConfirmBooking() }
      ]
    );
  };

  // ============ FUNCTION 8: Handle Confirm Booking ============
  const handleConfirmBooking = () => {
    Alert.alert(
      'Success!',
      'Your booking has been confirmed. Check your email for details.',
      [
        { 
          text: 'View Bookings', 
          onPress: () => navigateToPage('MyBookings')
        },
        { 
          text: 'OK', 
          onPress: () => console.log('Booking confirmed')
        }
      ]
    );
  };

  // ============ FUNCTION 9: Handle Find Booking ============
  const handleFindBooking = () => {
    Alert.alert(
      'Find Booking',
      'Search for existing bookings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Search', 
          onPress: () => navigateToPage('BookingSearch')
        }
      ]
    );
  };

  // ============ FUNCTION 10: View Guide Profile ============
  const viewGuideProfile = (guideName) => {
    const guide = guideProfiles.find(g => g.name === guideName);
    if (guide) {
      Alert.alert(
        guide.name,
        `Rating: ${guide.rating} ⭐ (${guide.reviews} reviews)\n` +
        `Languages: ${guide.languages}\n` +
        `Price: ${guide.price}\n\n` +
        `Would you like to book this guide?`,
        [
          { text: 'View More', onPress: () => navigateToPage('GuideProfile', { guideId: guide.id }) },
          { text: 'Book Now', onPress: () => setSelectedGuide(guide.name) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  // ============ FUNCTION 11: Change Month ============
  const changeMonth = (direction) => {
    const months = ['September 2026', 'October 2026', 'November 2026'];
    const currentIndex = months.indexOf(selectedMonth);
    if (direction === 'next' && currentIndex < months.length - 1) {
      setSelectedMonth(months[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setSelectedMonth(months[currentIndex - 1]);
    }
  };

  // ============ FUNCTION 12: Navigation Helper ============
  const navigateToPage = (pageName, params = {}) => {
    Alert.alert('Navigation', `Navigating to ${pageName} page`);
    console.log(`Navigating to: ${pageName}`, params);
  };

  // ============ FUNCTION 13: Reset Form ============
  const resetForm = () => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to clear all fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: () => {
            setSelectedGuide('');
            setDestination('');
            setSelectedDate(null);
            setGroupSize(1);
          }
        }
      ]
    );
  };

  // ============ FUNCTION 14: Validate Before Submit ============
  const validateForm = () => {
    if (!selectedGuide) return 'Please select a guide';
    if (!destination.trim()) return 'Please enter destination';
    if (!selectedDate) return 'Please select a date';
    if (groupSize < 1) return 'Group size must be at least 1';
    return null;
  };

  // ============ RENDER FUNCTIONS ============

  // Render guide selection modal
  const renderGuideModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showGuideModal}
      onRequestClose={() => setShowGuideModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select a Tour Guide</Text>
          <FlatList
            data={guideProfiles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.guideItem}
                onPress={() => {
                  setSelectedGuide(item.name);
                  setShowGuideModal(false);
                }}
              >
                <View style={styles.guideAvatar}>
                  <Text style={styles.guideAvatarText}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.guideInfo}>
                  <Text style={styles.guideName}>{item.name}</Text>
                  <Text style={styles.guideDetails}>
                    ⭐ {item.rating} • {item.reviews} reviews • {item.price}
                  </Text>
                  <Text style={styles.guideLanguages}>{item.languages}</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewProfileBtn}
                  onPress={() => viewGuideProfile(item.name)}
                >
                  <Text style={styles.viewProfileText}>View</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={() => setShowGuideModal(false)}
          >
            <Text style={styles.closeModalText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Easy Guide Booking</Text>
          <TouchableOpacity onPress={resetForm}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Pick your place, set your date, and book instantly</Text>
      </View>

      {/* Guide Selection Section */}
      <View style={styles.guideSelector}>
        <Text style={styles.sectionLabel}>Who did you select?</Text>
        <TouchableOpacity
          style={styles.guideSelectorBtn}
          onPress={() => setShowGuideModal(true)}
        >
          <Text style={selectedGuide ? styles.selectedGuideText : styles.placeholderText}>
            {selectedGuide || "Tour Guide Name"}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
        <Text style={styles.guideNote}>
          You should quickly find a tour guide and book after reviewing their profile.
        </Text>
      </View>

      {/* Find Booking Button */}
      <TouchableOpacity style={styles.findBookingBtn} onPress={handleFindBooking}>
        <Text style={styles.findBookingBtnText}>Find Booking</Text>
      </TouchableOpacity>

      {/* Destination Section */}
      <View style={styles.destinationSection}>
        <Text style={styles.sectionLabel}>Where do you want to go?</Text>
        <View style={styles.destinationInputContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <TextInput
            style={styles.destinationInput}
            placeholder="Destination"
            value={destination}
            onChangeText={handleDestinationChange}
            placeholderTextColor="#999"
          />
          {destination.length > 0 && (
            <TouchableOpacity onPress={() => setDestination('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date Picker Section */}
      <View style={styles.datePickerSection}>
        <View style={styles.dateHeader}>
          <Text style={styles.datePickerLabel}>Date Picker</Text>
          <View style={styles.monthNavigator}>
            <TouchableOpacity onPress={() => changeMonth('prev')}>
              <Text style={styles.monthNavArrow}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.currentMonth}>{selectedMonth}</Text>
            <TouchableOpacity onPress={() => changeMonth('next')}>
              <Text style={styles.monthNavArrow}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.datePickerSubtext}>
          Pick your suitable date for booking Tour Guide
        </Text>

        {/* Calendar */}
        <View style={styles.calendar}>
          {/* Weekday headers - FIXED: Using unique IDs as keys */}
          <View style={styles.weekRow}>
            {weekdays.map((day) => (
              <Text key={day.id} style={styles.weekDayHeader}>{day.label}</Text>
            ))}
          </View>

          {/* Calendar rows */}
          {calendarDays.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.weekRow}>
              {row.map((day, colIndex) => (
                <TouchableOpacity
                  key={`day-${rowIndex}-${colIndex}-${day || 'empty'}`}
                  style={[
                    styles.calendarCell,
                    selectedDate === day && styles.selectedDateCell
                  ]}
                  onPress={() => handleDateClick(day)}
                  disabled={!day}
                >
                  <Text style={[
                    styles.calendarCellText,
                    selectedDate === day && styles.selectedDateText,
                    !day && styles.emptyCellText
                  ]}>
                    {day || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.monthHint}>{selectedMonth}</Text>
      </View>

      {/* Ready to book text */}
      <Text style={styles.readyText}>Ready to book your guide? Start your journey now.</Text>

      {/* Group Size and Ask Booking */}
      <View style={styles.groupSection}>
        <Text style={styles.sectionLabel}>Group Size</Text>
        <View style={styles.groupSizeContainer}>
          <TouchableOpacity 
            style={[styles.groupSizeBtn, groupSize <= 1 && styles.disabledBtn]}
            onPress={decrementGroupSize}
            disabled={groupSize <= 1}
          >
            <Text style={styles.groupSizeBtnText}>−</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.groupInput}
            value={String(groupSize)}
            onChangeText={handleGroupSizeChange}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          
          <TouchableOpacity 
            style={[styles.groupSizeBtn, groupSize >= 20 && styles.disabledBtn]}
            onPress={incrementGroupSize}
            disabled={groupSize >= 20}
          >
            <Text style={styles.groupSizeBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.groupHint}>Max 20 people per booking</Text>
      </View>

      {/* Ask Booking Button */}
      <TouchableOpacity style={styles.askBookingBtn} onPress={handleAskBooking}>
        <Text style={styles.askBookingBtnText}>Ask Booking</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigateToPage('Home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigateToPage('Map')}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={styles.navText}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigateToPage('Feed')}>
          <Text style={styles.navIcon}>📱</Text>
          <Text style={styles.navText}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigateToPage('Group')}>
          <Text style={styles.navIcon}>👥</Text>
          <Text style={styles.navText}>Group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigateToPage('Profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Guide Selection Modal */}
      {renderGuideModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
  },
  resetText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  guideSelector: {
    marginBottom: 16,
  },
  guideSelectorBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
    padding: 14,
    backgroundColor: '#fff',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  selectedGuideText: {
    color: '#000',
    fontSize: 16,
  },
  dropdownIcon: {
    color: '#666',
    fontSize: 12,
  },
  guideNote: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  findBookingBtn: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 14,
    borderRadius: 30,
    marginBottom: 24,
    alignItems: 'center',
  },
  findBookingBtnText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  destinationSection: {
    marginBottom: 24,
  },
  destinationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
    paddingHorizontal: 16,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  destinationInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#000',
  },
  clearIcon: {
    fontSize: 16,
    color: '#999',
    padding: 4,
  },
  datePickerSection: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthNavArrow: {
    fontSize: 14,
    color: '#007AFF',
    padding: 4,
  },
  currentMonth: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  datePickerSubtext: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  calendar: {
    marginBottom: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayHeader: {
    flex: 1,
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontWeight: '400',
  },
  calendarCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  selectedDateCell: {
    backgroundColor: '#007AFF',
  },
  calendarCellText: {
    fontSize: 14,
    color: '#000',
  },
  selectedDateText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyCellText: {
    color: 'transparent',
  },
  monthHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  readyText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  groupSection: {
    marginBottom: 24,
  },
  groupSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  groupSizeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  groupSizeBtnText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  groupInput: {
    width: 80,
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
  },
  groupHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  askBookingBtn: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 40,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  askBookingBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navText: {
    fontSize: 11,
    color: '#555',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  guideAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guideAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  guideInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  guideDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  guideLanguages: {
    fontSize: 12,
    color: '#999',
  },
  viewProfileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f7ff',
    borderRadius: 16,
    marginLeft: 8,
  },
  viewProfileText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
  },
  closeModalBtn: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TravelGuideBooking;