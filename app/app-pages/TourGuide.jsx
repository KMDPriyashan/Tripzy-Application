import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const TourGuidePage = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [destination, setDestination] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get month name
  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  };

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', isCurrentMonth: false, key: `empty-${i}` });
    }

    // Add days of the month
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

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null); // Reset selected date when changing month
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null); // Reset selected date when changing month
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleBooking = () => {
    // Handle booking logic here
    console.log('Booking:', {
      searchQuery,
      destination,
      date: selectedDate ? `${selectedDate}/${currentMonth + 1}/${currentYear}` : 'No date selected',
      groupSize: groupSize || 'Not specified'
    });
    // Show success message or navigate
  };

  const handleFindBooking = () => {
    // Navigate to Tour Guide Profile page
    router.push('/app-pages/TGprofile');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header without back button */}
      <View style={styles.header}>
        
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Easy Guide Booking</Text>
          <Text style={styles.heroSubtitle}>
            Pick your place, set your date, and book instantly
          </Text>
        </View>

        {/* Search Bar Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Who did you select?</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tour guide name..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        </View>

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

        {/* Find Booking Section */}
        <View style={styles.findBookingSection}>
          <Text style={styles.findBookingTitle}>Find Booking</Text>
        </View>

        {/* Destination Input */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Where do you want to go?</Text>
          <View style={styles.destinationInputContainer}>
            <Ionicons name="location-outline" size={20} color="#007AFF" />
            <TextInput
              style={styles.destinationInput}
              placeholder="Enter destination"
              placeholderTextColor="#999"
              value={destination}
              onChangeText={setDestination}
            />
          </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarCard}>
          <Text style={styles.sectionTitle}>Date Picker</Text>
          <Text style={styles.calendarSubtitle}>
            Pick your suitable date for booking Tour Guide
          </Text>

          {/* Month Navigation */}
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

          {/* Week Days */}
          <View style={styles.weekDaysRow}>
            {weekDays.map((day, index) => (
              <Text key={index} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
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
          <Text style={styles.sectionTitle}>Group Size</Text>
          <TextInput
            style={styles.groupSizeInput}
            placeholder="Enter group size"
            placeholderTextColor="#999"
            value={groupSize}
            onChangeText={setGroupSize}
            keyboardType="numeric"
          />
        </View>

        {/* Ready to Book Text */}
        <Text style={styles.readyToBookText}>
          Ready to book your guide? Start your journey now.
        </Text>

        {/* Ask Booking Button */}
        <TouchableOpacity 
          style={styles.askBookingButton}
          onPress={handleBooking}
        >
          <Text style={styles.askBookingButtonText}>Ask Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
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
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findBookingButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
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
  findBookingSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  findBookingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
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
    marginBottom: 20,
  },
  askBookingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TourGuidePage;