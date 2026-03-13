import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PlanPage = () => { 
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  // Bottom navigation items
  const navItems = [
    { name: 'Home', icon: '🏠', target: '/profile' },
    { name: 'Map', icon: '🗺️', target: '/app-pages/map' },
    { name: 'Feed', icon: '📰', target: '/app-pages/feed' },
    { name: 'Group', icon: '👥', target: '/app-pages/community' },
    { name: 'Profile', icon: '👤', target: '/app-pages/profile' },
  ];

  // Sample previous itineraries
  const previousItineraries = [
    { id: 1, title: 'Winter Wonderland Tour', date: 'Dec 20-25, 2024', days: 6 },
    { id: 2, title: 'Autumn Europe Trip', date: 'Oct 10-20, 2024', days: 11 },
    { id: 3, title: 'Summer Beach Vacation', date: 'Aug 5-12, 2024', days: 8 },
  ];

  // Generate calendar days when currentDate changes
  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    const daysArray = [];
    const today = new Date();

    // Calculate start date of the calendar grid
    const startDate = new Date(year, month, 1 - firstDayOfWeek);
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const isCurrentMonth = date.getMonth() === month;
        const isToday = date.getDate() === today.getDate() && 
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear();
        
        daysArray.push({
            day: date.getDate(),
            isCurrentMonth,
            isToday,
            date: date
        });
    }
    
    setCalendarDays(daysArray);
  };

  const handleNavPress = (targetPath) => {
    if (targetPath) {
      router.push(targetPath);
    }
  };

  const handleDatePress = (dateInfo) => {
    setSelectedDate(dateInfo.date);
    // You can add additional logic here for date selection
    console.log('Selected date:', dateInfo.date);
  };

  const navigateToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const navigateToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth() &&
           date.getFullYear() === currentDate.getFullYear();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        
        
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Plan Your Perfect Getaway !</Text>
          <Text style={styles.subtitle}>
            Start organizing your dream trip with ease—choose destinations, set dates, and customize every detail
          </Text>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={navigateToPreviousMonth} style={styles.monthNavButton}>
              <Text style={styles.monthNavButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{formatMonthYear(currentDate)}</Text>
            <TouchableOpacity onPress={navigateToNextMonth} style={styles.monthNavButton}>
              <Text style={styles.monthNavButtonText}>›</Text>
            </TouchableOpacity>
          </View>



          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((dateInfo, index) => {
              const isSelected = isSameDay(dateInfo.date, selectedDate);
              const isCurrentMonthDay = isCurrentMonth(dateInfo.date);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    isSelected && styles.selectedDay,
                    dateInfo.isToday && styles.todayDay,
                    !isCurrentMonthDay && styles.otherMonthDay
                  ]}
                  onPress={() => handleDatePress(dateInfo)}
                >
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    dateInfo.isToday && !isSelected && styles.todayText,
                    !isCurrentMonthDay && styles.otherMonthText
                  ]}>
                    {dateInfo.day}
                  </Text>

                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Calendar Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.todayLegend]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.selectedLegend]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
          </View>
        </View>

        {/* Selected Date Info */}
        <View style={styles.selectedDateSection}>
          <Text style={styles.selectedDateTitle}>Selected Date:</Text>
          <Text style={styles.selectedDateText}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })}
          </Text>
        </View>

        {/* Previous Itineraries Section */}
        <View style={styles.itinerariesSection}>
          <Text style={styles.sectionTitle}>Previous Itineraries</Text>
          
          {previousItineraries.map((itinerary) => (
            <View key={itinerary.id} style={styles.itineraryCard}>
              <View style={styles.itineraryContent}>
                <Text style={styles.itineraryTitle}>{itinerary.title}</Text>
                <View style={styles.itineraryDetails}>
                  <Text style={styles.itineraryDate}>{itinerary.date}</Text>
                  <Text style={styles.itineraryDays}>{itinerary.days} days</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Create Itinerary Button */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.replace('/Tabs')}
        >
          <Text style={styles.createButtonText}>+ Create Itinerary</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => handleNavPress(item.target)}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={styles.navText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  todayButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  titleSection: {
    paddingHorizontal: 32,
    paddingVertical: 30,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 38,
    textAlign: 'center',
  
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
  },
  calendarSection: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthNavButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  monthNavButtonText: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '300',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  calendarDay: {
    width: (SCREEN_WIDTH - 80) / 7,
    height: (SCREEN_WIDTH - 80) / 7.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 5,
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#007AFF',
  },
  todayDay: {
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  otherMonthDay: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  todayText: {
    color: '#007AFF',
    fontWeight: '700',
  },
  otherMonthText: {
    color: '#999',
  },

  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  todayLegend: {
    backgroundColor: '#007AFF',
  },
  selectedLegend: {
    backgroundColor: '#007AFF',
    opacity: 1,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  selectedDateSection: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  itinerariesSection: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  itineraryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itineraryContent: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  itineraryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itineraryDate: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  itineraryDays: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  viewButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default PlanPage;