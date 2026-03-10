import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import 'react-native-get-random-values';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';

const CreatePlan = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Initialize state with saved data from params if available
  const [destination, setDestination] = useState(params.savedDestination || '');
  const [postCaption, setPostCaption] = useState(params.savedPostCaption || '');
  const [selectedImage, setSelectedImage] = useState(params.savedSelectedImage || null);
  const [planningLocation, setPlanningLocation] = useState(params.savedPlanningLocation || '');
  const [startedTime, setStartedTime] = useState(params.savedStartedTime || '');
  const [province, setProvince] = useState(params.savedProvince || '');
  const [startDate, setStartDate] = useState(params.savedStartDate || '');
  const [endDate, setEndDate] = useState(params.savedEndDate || '');
  const [tripNotes, setTripNotes] = useState(params.savedTripNotes || '');
  const [currentStatus, setCurrentStatus] = useState(params.savedCurrentStatus || 'Planned');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showPackingModal, setShowPackingModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPackingItems, setSelectedPackingItems] = useState(() => {
    if (params.savedSelectedPackingItems) {
      try {
        return JSON.parse(params.savedSelectedPackingItems);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [budgetEstimate, setBudgetEstimate] = useState(() => {
    if (params.savedBudgetEstimate) {
      try {
        return JSON.parse(params.savedBudgetEstimate);
      } catch (e) {
        return {
          accommodation: '',
          transportation: '',
          food: '',
          activities: '',
          miscellaneous: '',
          total: 0
        };
      }
    }
    return {
      accommodation: '',
      transportation: '',
      food: '',
      activities: '',
      miscellaneous: '',
      total: 0
    };
  });
  const [packingList, setPackingList] = useState([]);

  // New state for budget summary
  const [showBudgetSummary, setShowBudgetSummary] = useState(() => {
    if (params.savedShowBudgetSummary) {
      return params.savedShowBudgetSummary === 'true';
    }
    return false;
  });
  const [budgetBreakdown, setBudgetBreakdown] = useState(() => {
    if (params.savedBudgetBreakdown) {
      try {
        return JSON.parse(params.savedBudgetBreakdown);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Save current form state to params before navigating
  const saveFormState = () => {
    return {
      savedDestination: destination,
      savedPostCaption: postCaption,
      savedSelectedImage: selectedImage,
      savedPlanningLocation: planningLocation,
      savedStartedTime: startedTime,
      savedProvince: province,
      savedStartDate: startDate,
      savedEndDate: endDate,
      savedTripNotes: tripNotes,
      savedCurrentStatus: currentStatus,
      savedSelectedPackingItems: JSON.stringify(selectedPackingItems),
      savedBudgetEstimate: JSON.stringify(budgetEstimate),
      savedShowBudgetSummary: showBudgetSummary ? 'true' : 'false',
      savedBudgetBreakdown: JSON.stringify(budgetBreakdown)
    };
  };

  // Handle navigation to budget estimate with saved state
  const navigateToBudgetEstimate = () => {
    const savedState = saveFormState();
    router.push({
      pathname: '/app-pages/budgetEstimate',
      params: savedState
    });
  };

  // Handle navigation to packing list with saved state
  const navigateToPackingList = () => {
    const savedState = saveFormState();
    router.push({
      pathname: '/app-pages/packingList',
      params: savedState
    });
  };

  // Check for returning data from budget estimate or packing list
  useEffect(() => {
    // Handle budget data return
    if (params.budgetData) {
      try {
        const budgetData = JSON.parse(params.budgetData);
        setBudgetBreakdown(budgetData);
        setShowBudgetSummary(true);

        setBudgetEstimate({
          accommodation: budgetData.accommodation.cost.toString(),
          transportation: budgetData.transport.cost.toString(),
          food: budgetData.food.cost.toString(),
          activities: budgetData.activities.cost.toString(),
          miscellaneous: '0',
          total: budgetData.total
        });

        Alert.alert(
          'Budget Calculated',
          `Total Estimated Budget: $${budgetData.total.toFixed(2)}`,
          [{ text: 'OK' }]
        );
      } catch (e) {
        console.error('Error parsing budget data', e);
      }
    }

    // Handle packing items return
    if (params.selectedPackingItems) {
      try {
        const items = JSON.parse(params.selectedPackingItems);
        setSelectedPackingItems(items);

        Alert.alert(
          'Items Added',
          `${items.length} item${items.length > 1 ? 's' : ''} added to your packing list!`,
          [{ text: 'OK' }]
        );
      } catch (e) {
        console.error('Error parsing packing items', e);
      }
    }
  }, [params.budgetData, params.selectedPackingItems]);

  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photos to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const calculateBudgetEstimate = () => {
    const accommodation = parseFloat(budgetEstimate.accommodation) || 0;
    const transportation = parseFloat(budgetEstimate.transportation) || 0;
    const food = parseFloat(budgetEstimate.food) || 0;
    const activities = parseFloat(budgetEstimate.activities) || 0;
    const miscellaneous = parseFloat(budgetEstimate.miscellaneous) || 0;

    const total = accommodation + transportation + food + activities + miscellaneous;
    setBudgetEstimate({ ...budgetEstimate, total });
    setShowBudgetModal(false);
    Alert.alert('Budget Calculated', `Total Estimated Budget: $${total.toFixed(2)}`);
  };

  const savePlan = async () => {
    // Validate required fields
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    setLoading(true);

    try {
      // Create a unique ID for the plan
      const planId = uuidv4();

      // Create plan data object with all information
      const planData = {
        id: planId,
        destination,
        postCaption,
        planningLocation,
        startedTime,
        province,
        startDate,
        endDate,
        tripNotes,
        currentStatus,
        budgetEstimate,
        budgetBreakdown,
        selectedPackingItems,
        image: selectedImage,
        createdAt: new Date().toISOString(),
      };

      // Get existing plans from storage
      const existingPlans = await AsyncStorage.getItem('travelPlans');
      const plans = existingPlans ? JSON.parse(existingPlans) : [];

      // Add new plan
      plans.push(planData);

      // Save back to storage
      await AsyncStorage.setItem('travelPlans', JSON.stringify(plans));

      console.log('Saving plan:', planData);

      Alert.alert(
        'Success',
        'Your travel plan has been saved!',
        [
          {
            text: 'View My Itineraries',
            onPress: () => {
              // Save current form state before navigating
              const savedState = saveFormState();
              // Navigate to My Itineraries page
              router.push({
                pathname: '/app-pages/myItineraries',
                params: savedState
              });
            }
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Reset form
              setDestination('');
              setPostCaption('');
              setSelectedImage(null);
              setPlanningLocation('');
              setStartedTime('');
              setProvince('');
              setStartDate('');
              setEndDate('');
              setTripNotes('');
              setCurrentStatus('Planned');
              setBudgetEstimate({
                accommodation: '',
                transportation: '',
                food: '',
                activities: '',
                miscellaneous: '',
                total: 0
              });
              setBudgetBreakdown(null);
              setShowBudgetSummary(false);
              setSelectedPackingItems([]);
            }
          },
          {
            text: 'Stay Here',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error saving plan:', error);
      Alert.alert('Error', 'Failed to save your plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Define BudgetModal component BEFORE it's used in the return
  const BudgetModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showBudgetModal}
      onRequestClose={() => setShowBudgetModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Estimate Your Budget</Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Accommodation ($)"
            keyboardType="numeric"
            value={budgetEstimate.accommodation}
            onChangeText={(text) => setBudgetEstimate({ ...budgetEstimate, accommodation: text })}
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Transportation ($)"
            keyboardType="numeric"
            value={budgetEstimate.transportation}
            onChangeText={(text) => setBudgetEstimate({ ...budgetEstimate, transportation: text })}
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Food ($)"
            keyboardType="numeric"
            value={budgetEstimate.food}
            onChangeText={(text) => setBudgetEstimate({ ...budgetEstimate, food: text })}
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Activities ($)"
            keyboardType="numeric"
            value={budgetEstimate.activities}
            onChangeText={(text) => setBudgetEstimate({ ...budgetEstimate, activities: text })}
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Miscellaneous ($)"
            keyboardType="numeric"
            value={budgetEstimate.miscellaneous}
            onChangeText={(text) => setBudgetEstimate({ ...budgetEstimate, miscellaneous: text })}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowBudgetModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.calculateButton]}
              onPress={calculateBudgetEstimate}
            >
              <Text style={styles.calculateButtonText}>Calculate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Define PackingModal component BEFORE it's used in the return
  const PackingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPackingModal}
      onRequestClose={() => setShowPackingModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Packing Checklist</Text>

          <FlatList
            data={packingList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.checklistItem}>
                <Text style={styles.checklistText}>• {item}</Text>
              </View>
            )}
            style={styles.checklist}
          />

          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={() => setShowPackingModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Render the modal components */}
      <BudgetModal />
      <PackingModal />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Plan Your Perfect Getaway</Text>
          <Text style={styles.pageSubtitle}>
            Start organizing your dream trip with ease—choose destinations, set dates, and customize every detail
          </Text>

          {/* Destination Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter destination"
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          {/* Post Caption Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Post Caption</Text>
            <TextInput
              style={styles.input}
              placeholder="Write a caption for your post"
              value={postCaption}
              onChangeText={setPostCaption}
            />
          </View>

          {/* Image Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Upload Your Image</Text>
            <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              ) : (
                <>
                  <Text style={styles.uploadText}>Drag and drop Here</Text>
                  <Text style={styles.uploadOr}>or</Text>
                  <Text style={styles.uploadButton}>Browse</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Location Details */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Planning Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={planningLocation}
                onChangeText={setPlanningLocation}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Started Time</Text>
              <TextInput
                style={styles.input}
                placeholder="Time"
                value={startedTime}
                onChangeText={setStartedTime}
              />
            </View>
          </View>

          {/* Province */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Province</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter province"
              value={province}
              onChangeText={setProvince}
            />
          </View>

          {/* Selected Packing Items Indicator */}
          {selectedPackingItems.length > 0 && (
            <View style={styles.selectedItemsContainer}>
              <View style={styles.selectedItemsHeader}>
                <Text style={styles.selectedItemsTitle}>Packing Items Selected</Text>
                <TouchableOpacity
                  onPress={() => setSelectedPackingItems([])}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.selectedItemsBadges}>
                {selectedPackingItems.map((item, index) => (
                  <View key={index} style={styles.selectedItemBadge}>
                    <Text style={styles.selectedItemBadgeText}>✓</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.selectedItemsCount}>
                {selectedPackingItems.length} item{selectedPackingItems.length > 1 ? 's' : ''} ready for your trip
              </Text>
              <TouchableOpacity
                style={styles.viewSelectedButton}
                onPress={() => {
                  Alert.alert(
                    'Selected Packing Items',
                    selectedPackingItems.join('\n• '),
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.viewSelectedButtonText}>View Selected Items</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Generate Packing Checklist Button - UPDATED */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={navigateToPackingList}
          >
            <Text style={styles.generateButtonText}>
              {selectedPackingItems.length > 0
                ? 'Update Packing Checklist'
                : 'Generate Packing Checklist'}
            </Text>
          </TouchableOpacity>

          {/* Planning */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Planning</Text>
            <View style={styles.planningContainer}>
              {/* Start Date */}
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="DD/MM/YYYY"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>

              {/* End Date */}
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="DD/MM/YYYY"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>
          </View>

          {/* Budget Estimate - UPDATED */}
          <View style={styles.budgetContainer}>
            <Text style={styles.label}>Estimate your Budget Plan</Text>
            <TouchableOpacity
              style={styles.estimateButton}
              onPress={navigateToBudgetEstimate}
            >
              <Text style={styles.estimateButtonText}>Estimate</Text>
            </TouchableOpacity>
          </View>

          {/* Budget Summary - Shows when budget is calculated */}
          {showBudgetSummary && budgetBreakdown && (
            <View style={styles.budgetSummaryContainer}>
              <View style={styles.budgetSummaryHeader}>
                <Text style={styles.budgetSummaryTitle}>Your Budget Summary</Text>
                <TouchableOpacity
                  onPress={navigateToBudgetEstimate}
                  style={styles.editBudgetButton}
                >
                  <Text style={styles.editBudgetButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* Budget Style Badge */}
              <View style={styles.budgetStyleBadge}>
                <Text style={styles.budgetStyleBadgeText}>
                  {budgetBreakdown.budgetStyle.charAt(0).toUpperCase() + budgetBreakdown.budgetStyle.slice(1)} Style
                </Text>
              </View>

              {/* Trip Details Summary */}
              <View style={styles.budgetDetailsGrid}>
                <View style={styles.budgetDetailItem}>
                  <Text style={styles.budgetDetailLabel}>Destination</Text>
                  <Text style={styles.budgetDetailValue}>{budgetBreakdown.destination || 'Not set'}</Text>
                </View>
                <View style={styles.budgetDetailItem}>
                  <Text style={styles.budgetDetailLabel}>Duration</Text>
                  <Text style={styles.budgetDetailValue}>{budgetBreakdown.duration || '0'} days</Text>
                </View>
                <View style={styles.budgetDetailItem}>
                  <Text style={styles.budgetDetailLabel}>Group Size</Text>
                  <Text style={styles.budgetDetailValue}>{budgetBreakdown.groupSize}</Text>
                </View>
              </View>

              {/* Cost Breakdown */}
              <View style={styles.costBreakdown}>
                <View style={styles.costItem}>
                  <View style={styles.costItemLeft}>
                    <View style={[styles.costDot, { backgroundColor: '#FF6B6B' }]} />
                    <Text style={styles.costItemLabel}>Transport</Text>
                  </View>
                  <View style={styles.costItemRight}>
                    <Text style={styles.costItemOption}>{budgetBreakdown.transport.option}</Text>
                    <Text style={styles.costItemValue}>${budgetBreakdown.transport.cost}</Text>
                  </View>
                </View>

                <View style={styles.costItem}>
                  <View style={styles.costItemLeft}>
                    <View style={[styles.costDot, { backgroundColor: '#34C759' }]} />
                    <Text style={styles.costItemLabel}>Accommodation</Text>
                  </View>
                  <View style={styles.costItemRight}>
                    <Text style={styles.costItemOption}>{budgetBreakdown.accommodation.option}</Text>
                    <Text style={styles.costItemValue}>${budgetBreakdown.accommodation.cost}</Text>
                  </View>
                </View>

                <View style={styles.costItem}>
                  <View style={styles.costItemLeft}>
                    <View style={[styles.costDot, { backgroundColor: '#007AFF' }]} />
                    <Text style={styles.costItemLabel}>Food</Text>
                  </View>
                  <View style={styles.costItemRight}>
                    <Text style={styles.costItemOption}>{budgetBreakdown.food.option}</Text>
                    <Text style={styles.costItemValue}>${budgetBreakdown.food.cost}</Text>
                  </View>
                </View>

                <View style={styles.costItem}>
                  <View style={styles.costItemLeft}>
                    <View style={[styles.costDot, { backgroundColor: '#FF9500' }]} />
                    <Text style={styles.costItemLabel}>Activities</Text>
                  </View>
                  <View style={styles.costItemRight}>
                    <Text style={styles.costItemOption}>{budgetBreakdown.activities.option}</Text>
                    <Text style={styles.costItemValue}>${budgetBreakdown.activities.cost}</Text>
                  </View>
                </View>

                {/* Total */}
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total Estimated Budget</Text>
                  <Text style={styles.totalValue}>${budgetBreakdown.total.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Current Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Status</Text>
            <View style={styles.statusContainer}>
              <TouchableOpacity
                style={[styles.statusButton, currentStatus === 'Planned' && styles.activeStatus]}
                onPress={() => setCurrentStatus('Planned')}
              >
                <Text style={[styles.statusText, currentStatus === 'Planned' && styles.activeStatusText]}>Planned</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusButton, currentStatus === 'In Progress' && styles.activeStatus]}
                onPress={() => setCurrentStatus('In Progress')}
              >
                <Text style={[styles.statusText, currentStatus === 'In Progress' && styles.activeStatusText]}>In Progress</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusButton, currentStatus === 'completed' && styles.activeStatus]}
                onPress={() => setCurrentStatus('completed')}
              >
                <Text style={[styles.statusText, currentStatus === 'completed' && styles.activeStatusText]}>completed</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Collaborates */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>collaborates</Text>
            <TextInput
              style={styles.input}
              placeholder="Add collaborators"
            />
          </View>

          {/* Trip Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Trip Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Write your trip notes here..."
              multiline
              numberOfLines={4}
              value={tripNotes}
              onChangeText={setTripNotes}
            />
          </View>

          
          {/* Complete Plan Button */}
          <TouchableOpacity
            style={[styles.completeButton, loading && styles.completeButtonDisabled]}
            onPress={savePlan}
            disabled={loading}
          >
            <Text style={styles.completeButtonText}>
              {loading ? 'Saving...' : 'Complete your Plan'}
            </Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  uploadArea: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  uploadText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  uploadOr: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 5,
  },
  uploadButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  generateButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  planningContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  estimateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  estimateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 2,
    borderRadius: 8,
  },
  activeStatus: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  activeStatusText: {
    color: '#fff',
    fontWeight: '500',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  completeButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  calculateButton: {
    backgroundColor: '#007AFF',
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#34C759',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  checklist: {
    maxHeight: 300,
  },
  checklistItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checklistText: {
    fontSize: 16,
    color: '#333',
  },
  // Styles for selected packing items
  selectedItemsContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectedItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedItemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  selectedItemsBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  selectedItemBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedItemBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedItemsCount: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  viewSelectedButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewSelectedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  // New styles for budget summary
  budgetSummaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  budgetSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editBudgetButton: {
    padding: 5,
  },
  editBudgetButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  budgetStyleBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  budgetStyleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  budgetDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  budgetDetailItem: {
    alignItems: 'center',
  },
  budgetDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  budgetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  costBreakdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  costItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  costDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  costItemLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  costItemRight: {
    alignItems: 'flex-end',
  },
  costItemOption: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  costItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
});

export default CreatePlan;