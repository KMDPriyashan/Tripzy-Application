import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BudgetEstimate = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); // Move this to the top level
  
  // Basic trip information
  const [destination, setDestination] = useState(params.savedDestination || ''); // Initialize with saved data
  const [duration, setDuration] = useState(params.savedDuration || '');
  const [groupSize, setGroupSize] = useState(params.savedGroupSize || '1');
  const [budgetStyle, setBudgetStyle] = useState(params.savedBudgetStyle || 'mid-range');
  
  // Transport costs
  const [transportOption, setTransportOption] = useState('');
  const [transportCost, setTransportCost] = useState('');
  
  // Accommodation costs
  const [accommodationOption, setAccommodationOption] = useState('');
  const [accommodationCost, setAccommodationCost] = useState('');
  
  // Food costs
  const [foodOption, setFoodOption] = useState('');
  const [foodCost, setFoodCost] = useState('');
  
  // Activities costs
  const [activityOption, setActivityOption] = useState('');
  const [activityCost, setActivityCost] = useState('');

  // Budget style options
  const budgetStyles = ['Budget', 'Mid-range', 'Luxury'];
  
  // Transport options
  const transportOptions = ['Economy', 'Standard', 'Premium', 'Luxury'];
  
  // Accommodation options
  const accommodationOptions = ['Hostel', 'Budget Hotel', '3-Star Hotel', '5-Star Hotel', 'Resort'];
  
  // Food options
  const foodOptions = ['Street Food', 'Local Restaurants', 'Mid-range Restaurants', 'Fine Dining'];
  
  // Activity options
  const activityOptions = ['Free Activities', 'Budget Tours', 'Premium Experiences', 'Luxury Excursions'];

  const calculateTotalBudget = () => {
    // Parse costs to numbers
    const transport = parseFloat(transportCost) || 0;
    const accommodation = parseFloat(accommodationCost) || 0;
    const food = parseFloat(foodCost) || 0;
    const activities = parseFloat(activityCost) || 0;
    
    // Calculate total
    const total = transport + accommodation + food + activities;
    
    // Create budget breakdown object
    const budgetBreakdown = {
      destination,
      duration,
      groupSize,
      budgetStyle,
      transport: {
        option: transportOption || 'Not specified',
        cost: transport
      },
      accommodation: {
        option: accommodationOption || 'Not specified',
        cost: accommodation
      },
      food: {
        option: foodOption || 'Not specified',
        cost: food
      },
      activities: {
        option: activityOption || 'Not specified',
        cost: activities
      },
      total: total
    };
    
    // Return to createPlan with both budget data AND saved form state
    router.push({
      pathname: '/app-pages/createPlan',
      params: {
        budgetData: JSON.stringify(budgetBreakdown),
        // Pass back all the saved form data from createPlan
        savedDestination: params.savedDestination,
        savedPostCaption: params.savedPostCaption,
        savedSelectedImage: params.savedSelectedImage,
        savedPlanningLocation: params.savedPlanningLocation,
        savedStartedTime: params.savedStartedTime,
        savedProvince: params.savedProvince,
        savedStartDate: params.savedStartDate,
        savedEndDate: params.savedEndDate,
        savedTripNotes: params.savedTripNotes,
        savedCurrentStatus: params.savedCurrentStatus,
        savedSelectedPackingItems: params.savedSelectedPackingItems,
        savedBudgetEstimate: params.savedBudgetEstimate,
        savedShowBudgetSummary: params.savedShowBudgetSummary,
        savedBudgetBreakdown: params.savedBudgetBreakdown
      }
    });
  };

  const getBudgetStyleColor = (style) => {
    switch(style.toLowerCase()) {
      case 'budget': return '#34C759';
      case 'mid-range': return '#007AFF';
      case 'luxury': return '#FF6B6B';
      default: return '#007AFF';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget Estimate</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.mainTitle}>Estimate Your Travel Budget</Text>
            <Text style={styles.subtitle}>
              Get a quick cost overview before you start your journey.
            </Text>
          </View>

          {/* Basic Trip Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Destination</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Paris, Bali, Tokyo"
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Duration (days)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="7"
                  keyboardType="numeric"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Group Size</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  keyboardType="numeric"
                  value={groupSize}
                  onChangeText={setGroupSize}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Budget Style</Text>
              <View style={styles.optionsContainer}>
                {budgetStyles.map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.optionButton,
                      budgetStyle === style.toLowerCase() && {
                        backgroundColor: getBudgetStyleColor(style),
                        borderColor: getBudgetStyleColor(style)
                      }
                    ]}
                    onPress={() => setBudgetStyle(style.toLowerCase())}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      budgetStyle === style.toLowerCase() && styles.optionButtonTextSelected
                    ]}>
                      {style}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Transport Cost Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transport Cost</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Transport Option</Text>
              <View style={styles.optionsRow}>
                {transportOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.smallOptionButton,
                      transportOption === option && styles.smallOptionButtonSelected
                    ]}
                    onPress={() => setTransportOption(option)}
                  >
                    <Text style={[
                      styles.smallOptionButtonText,
                      transportOption === option && styles.smallOptionButtonTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Budget Cost ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={transportCost}
                onChangeText={setTransportCost}
              />
            </View>
          </View>

          {/* Accommodation Cost Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accommodation Cost</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Accommodation Option</Text>
              <View style={styles.optionsRow}>
                {accommodationOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.smallOptionButton,
                      accommodationOption === option && styles.smallOptionButtonSelected
                    ]}
                    onPress={() => setAccommodationOption(option)}
                  >
                    <Text style={[
                      styles.smallOptionButtonText,
                      accommodationOption === option && styles.smallOptionButtonTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Budget Cost ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={accommodationCost}
                onChangeText={setAccommodationCost}
              />
            </View>
          </View>

          {/* Food Cost Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food Cost</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Food Option</Text>
              <View style={styles.optionsRow}>
                {foodOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.smallOptionButton,
                      foodOption === option && styles.smallOptionButtonSelected
                    ]}
                    onPress={() => setFoodOption(option)}
                  >
                    <Text style={[
                      styles.smallOptionButtonText,
                      foodOption === option && styles.smallOptionButtonTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Budget Cost ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={foodCost}
                onChangeText={setFoodCost}
              />
            </View>
          </View>

          {/* Activities Cost Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activities Cost</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Activity Option</Text>
              <View style={styles.optionsRow}>
                {activityOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.smallOptionButton,
                      activityOption === option && styles.smallOptionButtonSelected
                    ]}
                    onPress={() => setActivityOption(option)}
                  >
                    <Text style={[
                      styles.smallOptionButtonText,
                      activityOption === option && styles.smallOptionButtonTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Budget Cost ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={activityCost}
                onChangeText={setActivityCost}
              />
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity 
            style={styles.calculateButton}
            onPress={calculateTotalBudget}
          >
            <Text style={styles.calculateButtonText}>Calculate Total Budget</Text>
          </TouchableOpacity>

          {/* Note */}
          <Text style={styles.noteText}>
            * All costs should be entered in USD ($)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginHorizontal: 3,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  optionButtonTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  smallOptionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  smallOptionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  smallOptionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  smallOptionButtonTextSelected: {
    color: '#fff',
  },
  calculateButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
});

export default BudgetEstimate;