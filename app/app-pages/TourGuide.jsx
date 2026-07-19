import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Clipboard,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import BottomNav from '../../components/BottomNav';
import { getCurrentUser, supabase } from '../../lib/supabase';

const TourGuidePage = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [destination, setDestination] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [tourGuideName, setTourGuideName] = useState('');
  
  // States for enhanced functionality
  const [loading, setLoading] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const sendWhatsAppMessage = async () => {
    if (!whatsappNumber) {
      Alert.alert('Warning', 'Please enter tour guide WhatsApp number to send confirmation');
      return false;
    }

    let cleanNumber = whatsappNumber.replace(/\s/g, '');
    if (!cleanNumber.startsWith('+')) {
      cleanNumber = '+' + cleanNumber;
    }

    const message = `*🏖️ TOUR GUIDE BOOKING REQUEST* 🎉\n\n` +
      `*👤 FROM: ${currentUser?.user_metadata?.full_name || 'Guest User'}* \n` +
      `*📧 Email: ${currentUser?.email || 'N/A'}*\n\n` +
      `*📋 Booking Details:*\n` +
      `• *Tour Guide:* ${tourGuideName}\n` +
      `• *📍 Destination:* ${destination}\n` +
      `• *📅 Date:* ${selectedDate}/${currentMonth + 1}/${currentYear}\n` +
      `• *👥 Group Size:* ${groupSize} person(s)\n` +
      `• *📝 Special Requests:* ${specialRequests || 'None'}\n\n` +
      `*✨ Booking Status:* Pending Confirmation\n` +
      `*🕐 Request Time:* ${new Date().toLocaleString()}\n\n` +
      `Please confirm this booking request. Thank you! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      
      if (supported) {
        await Linking.openURL(whatsappUrl);
        return true;
      } else {
        Alert.alert(
          'WhatsApp Not Installed',
          'Please install WhatsApp to send the message, or copy the number manually.',
          [
            { text: 'Copy Number', onPress: () => copyToClipboard(cleanNumber) },
            { text: 'OK', style: 'cancel' }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert('Error', 'Could not open WhatsApp. Please check if WhatsApp is installed.');
      return false;
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'WhatsApp number copied to clipboard');
  };

  const handleBooking = async () => {
    if (!tourGuideName) {
      Alert.alert('Error', 'Please enter tour guide name');
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

    if (!whatsappNumber) {
      Alert.alert('Error', 'Please enter tour guide WhatsApp number');
      return;
    }
    
    setLoading(true);
    const whatsappSent = await sendWhatsAppMessage();
    
    if (whatsappSent) {
      await saveBookingToDatabase();
    } else {
      Alert.alert(
        'WhatsApp Message Failed',
        'Failed to send WhatsApp message. Do you want to continue with the booking?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
          { text: 'Continue', onPress: saveBookingToDatabase }
        ]
      );
    }
  };

  const saveBookingToDatabase = async () => {
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    const bookingData = {
      id: generateUUID(),
      tour_guide_name: tourGuideName,
      user_id: currentUser?.id,
      user_name: currentUser?.user_metadata?.full_name || 'Guest',
      user_email: currentUser?.email,
      destination: destination,
      booking_date: `${selectedDate}/${currentMonth + 1}/${currentYear}`,
      group_size: parseInt(groupSize),
      total_price: 0,
      special_requests: specialRequests,
      whatsapp_number: whatsappNumber,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('tour_guide_bookings')
        .insert([bookingData]);

      if (error) throw error;

      Alert.alert(
        'Booking Request Sent! 🎉',
        `Your booking request has been sent to ${tourGuideName} via WhatsApp.\n\nThey will contact you shortly on WhatsApp to confirm the booking.`,
        [{ text: 'OK', onPress: resetForm }]
      );
    } catch (error) {
      console.error('Error booking:', error);
      Alert.alert('Error', 'Failed to save booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTourGuideName('');
    setDestination('');
    setGroupSize('');
    setSpecialRequests('');
    setWhatsappNumber('');
    setSelectedDate(new Date().getDate());
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

  const isFormValid = () => {
    return tourGuideName && 
           destination && 
           selectedDate && 
           groupSize && 
           parseInt(groupSize) > 0 && 
           whatsappNumber;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Your Guide, Your Journey</Text>
            <Text style={styles.heroSubtitle}>
              Select your destination, choose your date, and connect with a trusted local guide instantly
            </Text>
          </View>

          {/* Your Guide Name Input */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your Guide Name</Text>
            <View style={styles.tourGuideInputContainer}>
              <Ionicons name="person-outline" size={20} color="#007AFF" />
              <TextInput
                style={styles.tourGuideInput}
                placeholder="Enter guide name (e.g., John Doe)"
                value={tourGuideName}
                onChangeText={setTourGuideName}
              />
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

          {/* Destination Input */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Where do you want to go?</Text>
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
            <Text style={styles.sectionTitle}>Date Picker</Text>
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
            <Text style={styles.sectionTitle}>Group Size</Text>
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

          {/* WhatsApp Number Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tour Guide WhatsApp Number</Text>
            <View style={styles.whatsappInputContainer}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <TextInput
                style={styles.whatsappInput}
                placeholder="e.g., +94771234567"
                value={whatsappNumber}
                onChangeText={setWhatsappNumber}
                keyboardType="phone-pad"
              />
            </View>
            <Text style={styles.helperText}>
              This number will receive the booking confirmation message
            </Text>
          </View>

          {/* Special Requests */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Special Requests</Text>
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
            style={[styles.askBookingButton, (!isFormValid() || loading) && styles.disabledButton]}
            onPress={handleBooking}
            disabled={!isFormValid() || loading}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.askBookingButtonText}>
              {loading ? 'Sending...' : 'Ask Booking via WhatsApp'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
      
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  bottomPadding: {
    height: 80,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
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
  tourGuideInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  tourGuideInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    paddingVertical: 0,
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
    fontSize: 13,
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
    fontSize: 13,
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
    backgroundColor: '#25D366',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  buttonIcon: {
    marginRight: 10,
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
  whatsappInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  whatsappInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    paddingVertical: 0,
  },
});

export default TourGuidePage;