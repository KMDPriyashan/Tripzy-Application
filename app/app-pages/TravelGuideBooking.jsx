// TravelGuideBooking.jsx
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const TravelGuideBooking = () => {
  // State management
  const [tourGuide, setTourGuide] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [groupSize, setGroupSize] = useState(1);
  const [currentMonth, setCurrentMonth] = useState('March 2026');

  // Calendar data
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const calendarDays = [
    [1, '', '', '', '', '', 8],
    [2, 3, 4, 5, 6, 7, 9],
    [10, 11, 12, 13, 14, 15, 16],
    [17, 18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29, 30],
  ];

  // Function 1: Handle Find Booking
  const handleFindBooking = () => {
    if (!tourGuide.trim()) {
      Alert.alert('Error', 'Please enter a tour guide name');
      return;
    }
    
    console.log('Finding booking for guide:', tourGuide);
    Alert.alert(
      'Searching for Bookings',
      `🔍 Searching for bookings with ${tourGuide}...\n\nThis feature will show available slots and guide details.`
    );
  };

  // Function 2: Handle Date Selection
  const handleDateSelect = (day) => {
    if (day) {
      setSelectedDate(day);
      console.log('Date selected:', day);
      
      Alert.alert('Date Selected', `📅 Selected date: ${currentMonth} ${day}`);
    }
  };

  // Function 3: Handle Destination Change
  const handleDestinationChange = (text) => {
    setDestination(text);
    console.log('Destination updated:', text);
  };

  // Function 4: Handle Group Size Change
  const handleGroupSizeChange = (value) => {
    const size = parseInt(value) || 1;
    if (size >= 1 && size <= 20) {
      setGroupSize(size);
      console.log('Group size updated:', size);
    }
  };

  // Function 5: Handle Ask Booking
  const handleAskBooking = () => {
    // Validate all required fields
    const errors = [];
    if (!tourGuide.trim()) errors.push('• Tour guide name');
    if (!destination.trim()) errors.push('• Destination');
    if (!selectedDate) errors.push('• Date');
    
    if (errors.length > 0) {
      Alert.alert('Missing Information', `⚠️ Please fill in all required fields:\n${errors.join('\n')}`);
      return;
    }
    
    // Create booking summary
    const bookingDetails = {
      guide: tourGuide,
      destination: destination,
      date: `${currentMonth} ${selectedDate}`,
      groupSize: groupSize,
      bookingTime: new Date().toLocaleString(),
      bookingId: 'BK' + Math.floor(Math.random() * 10000)
    };
    
    console.log('Booking request:', bookingDetails);
    
    Alert.alert(
      '✅ Booking Request Sent!',
      `📋 Booking Summary:\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `👤 Guide: ${bookingDetails.guide}\n` +
      `📍 Destination: ${bookingDetails.destination}\n` +
      `📅 Date: ${bookingDetails.date}\n` +
      `👥 Group Size: ${bookingDetails.groupSize}\n` +
      `🆔 Booking ID: ${bookingDetails.bookingId}\n\n` +
      `You will receive a confirmation shortly.`
    );
  };

  // Function 6: Handle Navigation
  const handleNavigation = (page) => {
    console.log('Navigating to:', page);
    Alert.alert('Navigation', `🌐 Navigating to ${page} page...`);
  };

  // Function 7: Clear Form
  const handleClearForm = () => {
    Alert.alert(
      'Clear Form',
      'Are you sure you want to clear all fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            setTourGuide('');
            setDestination('');
            setSelectedDate(null);
            setGroupSize(1);
            console.log('Form cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Function 8: Check Availability
  const checkAvailability = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date first');
      return;
    }
    
    console.log('Checking availability for date:', selectedDate);
    Alert.alert(
      'Availability Check',
      `📊 Checking availability for ${currentMonth} ${selectedDate}...\n\n` +
      `Available time slots:\n` +
      `• 9:00 AM - Available\n` +
      `• 11:00 AM - Limited spots\n` +
      `• 2:00 PM - Available\n` +
      `• 4:00 PM - Fully booked`
    );
  };

  // Render calendar cell
  const renderCalendarCell = (day, weekIndex, dayIndex) => (
    <TouchableOpacity
      key={`${weekIndex}-${dayIndex}`}
      style={[
        styles.calendarCell,
        !day && styles.calendarCellEmpty,
        selectedDate === day && styles.calendarCellSelected,
      ]}
      onPress={() => handleDateSelect(day)}
      disabled={!day}
    >
      {day ? (
        <>
          <Text style={[
            styles.calendarCellText,
            selectedDate === day && styles.calendarCellTextSelected
          ]}>
            {day}
          </Text>
          {day === 15 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Popular</Text>
            </View>
          )}
        </>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.coverPhoto}>
            <Text style={styles.headerTitle}>Easy Guide Booking</Text>
          </View>
          <Text style={styles.subhead}>
            Pick your place, set your date, and book instantly
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.feedContainer}>
          {/* Who did you select? Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>👤</Text>
              <Text style={styles.cardTitle}>Who did you select?</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Enter Tour Guide Name"
                value={tourGuide}
                onChangeText={setTourGuide}
                placeholderTextColor="#999"
              />
            </View>
            
            <Text style={styles.hintText}>
              You should quickly find a tour guide and book after reviewing their profile.
            </Text>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleFindBooking}
            >
              <Text style={styles.secondaryButtonText}>🔍 Find Booking</Text>
            </TouchableOpacity>
          </View>

          {/* Where do you want to go? Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📍</Text>
              <Text style={styles.cardTitle}>Where do you want to go?</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Enter Destination"
                value={destination}
                onChangeText={handleDestinationChange}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Date Picker Card */}
          <View style={[styles.card, styles.calendarCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📅</Text>
              <Text style={styles.cardTitle}>Date Picker</Text>
            </View>
            
            <Text style={styles.calendarHint}>
              Pick your suitable date for booking Tour Guide
            </Text>

            {/* Month Display */}
            <View style={styles.monthDisplay}>
              <TouchableOpacity 
                style={styles.monthNav}
                onPress={() => Alert.alert('Previous month')}
              >
                <Text style={styles.monthNavText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.currentMonth}>{currentMonth}</Text>
              <TouchableOpacity 
                style={styles.monthNav}
                onPress={() => Alert.alert('Next month')}
              >
                <Text style={styles.monthNavText}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar Weekdays */}
            <View style={styles.calendarWeekdays}>
              {weekdays.map((day, idx) => (
                <View key={idx} style={styles.weekday}>
                  <Text style={styles.weekdayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.calendarRow}>
                  {week.map((day, dayIndex) => 
                    renderCalendarCell(day, weekIndex, dayIndex)
                  )}
                </View>
              ))}
            </View>

            {/* Availability Check */}
            <TouchableOpacity style={styles.linkButton} onPress={checkAvailability}>
              <Text style={styles.linkButtonText}>Check Availability</Text>
            </TouchableOpacity>

            {/* Ready to book message */}
            <View style={styles.readyBooking}>
              <Text style={styles.readyBookingText}>
                ✨ Ready to book your guide? Start your journey now.
              </Text>
            </View>

            {/* Group Size and Ask Booking */}
            <View style={styles.bookingActionRow}>
              <View style={styles.groupSizeContainer}>
                <Text style={styles.groupSizeLabel}>Group Size:</Text>
                <View style={styles.sizeControls}>
                  <TouchableOpacity 
                    style={styles.sizeButton}
                    onPress={() => groupSize > 1 && setGroupSize(groupSize - 1)}
                  >
                    <Text style={styles.sizeButtonText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.sizeInput}
                    value={String(groupSize)}
                    onChangeText={handleGroupSizeChange}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <TouchableOpacity 
                    style={styles.sizeButton}
                    onPress={() => groupSize < 20 && setGroupSize(groupSize + 1)}
                  >
                    <Text style={styles.sizeButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity style={styles.primaryButton} onPress={handleAskBooking}>
                <Text style={styles.primaryButtonText}>📤 Ask Booking</Text>
              </TouchableOpacity>
            </View>

            {/* Clear Form Button */}
            <TouchableOpacity style={styles.clearButton} onPress={handleClearForm}>
              <Text style={styles.clearButtonText}>Clear All Fields</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Map')}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={styles.navLabel}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Feed')}>
          <Text style={styles.navIcon}>📱</Text>
          <Text style={styles.navLabel}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Group')}>
          <Text style={styles.navIcon}>👥</Text>
          <Text style={styles.navLabel}>Group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => Alert.alert('Quick Booking Assistant')}
      >
        <Text style={styles.fabText}>💬</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#007AFF', // Changed to #007AFF
    paddingBottom: 15,
  },
  coverPhoto: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subhead: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  feedContainer: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  },
  inputGroup: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
  hintText: {
    fontSize: 13,
    color: '#65676b',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  secondaryButton: {
    backgroundColor: '#e4e6eb',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#050505',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarCard: {
    paddingBottom: 20,
  },
  calendarHint: {
    fontSize: 13,
    color: '#65676b',
    marginBottom: 15,
  },
  monthDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthNav: {
    padding: 8,
  },
  monthNavText: {
    fontSize: 18,
    color: '#007AFF', // Changed to #007AFF
  },
  currentMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  weekday: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    color: '#65676b',
    fontWeight: '500',
  },
  calendarGrid: {
    marginBottom: 10,
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  calendarCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    margin: 2,
  },
  calendarCellEmpty: {
    backgroundColor: 'transparent',
  },
  calendarCellSelected: {
    backgroundColor: '#007AFF', // Changed to #007AFF
  },
  calendarCellText: {
    fontSize: 14,
    color: '#050505',
  },
  calendarCellTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f02849',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  linkButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#007AFF', // Changed to #007AFF
    fontSize: 14,
    fontWeight: '500',
  },
  readyBooking: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 6,
    marginVertical: 15,
  },
  readyBookingText: {
    color: '#007AFF', // Changed to #007AFF
    fontSize: 14,
    textAlign: 'center',
  },
  bookingActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  groupSizeContainer: {
    flex: 1,
    marginRight: 10,
  },
  groupSizeLabel: {
    fontSize: 14,
    color: '#65676b',
    marginBottom: 5,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeButton: {
    backgroundColor: '#e4e6eb',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeButtonText: {
    fontSize: 20,
    color: '#050505',
  },
  sizeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    width: 50,
    height: 36,
    textAlign: 'center',
    marginHorizontal: 5,
    fontSize: 14,
    color: '#000',
  },
  primaryButton: {
    backgroundColor: '#007AFF', // Changed to #007AFF
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#f02849',
    fontSize: 13,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 11,
    color: '#65676b',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF', // Changed to #007AFF
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
  },
});

export default TravelGuideBooking;