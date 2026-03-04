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
import { SafeAreaView } from 'react-native-safe-area-context';

const CreatePlan = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [destination, setDestination] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [planningLocation, setPlanningLocation] = useState('');
  const [startedTime, setStartedTime] = useState('');
  const [province, setProvince] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripNotes, setTripNotes] = useState('');
  const [currentStatus, setCurrentStatus] = useState('Planned');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showPackingModal, setShowPackingModal] = useState(false);
  const [selectedPackingItems, setSelectedPackingItems] = useState([]);
  const [budgetEstimate, setBudgetEstimate] = useState({
    accommodation: '',
    transportation: '',
    food: '',
    activities: '',
    miscellaneous: '',
    total: 0
  });
  const [packingList, setPackingList] = useState([]);

  // Check for selected items from packing list page
  useEffect(() => {
    if (params.selectedPackingItems) {
      try {
        const items = JSON.parse(params.selectedPackingItems);
        setSelectedPackingItems(items);
        
        // Show success message with count
        Alert.alert(
          'Items Added', 
          `${items.length} item${items.length > 1 ? 's' : ''} added to your packing list!`,
          [{ text: 'OK' }]
        );
      } catch (e) {
        console.error('Error parsing packing items', e);
      }
    }
  }, [params.selectedPackingItems]);

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
    setBudgetEstimate({...budgetEstimate, total});
    setShowBudgetModal(false);
    Alert.alert('Budget Calculated', `Total Estimated Budget: $${total.toFixed(2)}`);
  };

  const generatePackingChecklist = () => {
    router.push('/app-pages/packingList');
  };

  const savePlan = () => {
    // Here you would typically save the plan to your backend
    const planData = {
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
      packingList,
      selectedPackingItems,
      image: selectedImage
    };
    
    console.log('Saving plan:', planData);
    Alert.alert('Success', 'Your travel plan has been saved!');
    router.back();
  };

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
            onChangeText={(text) => setBudgetEstimate({...budgetEstimate, accommodation: text})}
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="Transportation ($)"
            keyboardType="numeric"
            value={budgetEstimate.transportation}
            onChangeText={(text) => setBudgetEstimate({...budgetEstimate, transportation: text})}
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="Food ($)"
            keyboardType="numeric"
            value={budgetEstimate.food}
            onChangeText={(text) => setBudgetEstimate({...budgetEstimate, food: text})}
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="Activities ($)"
            keyboardType="numeric"
            value={budgetEstimate.activities}
            onChangeText={(text) => setBudgetEstimate({...budgetEstimate, activities: text})}
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="Miscellaneous ($)"
            keyboardType="numeric"
            value={budgetEstimate.miscellaneous}
            onChangeText={(text) => setBudgetEstimate({...budgetEstimate, miscellaneous: text})}
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
            renderItem={({item}) => (
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

          {/* Generate Packing Checklist Button */}
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={generatePackingChecklist}
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

          {/* Budget Estimate */}
          <View style={styles.budgetContainer}>
            <Text style={styles.label}>Estimate your Budget Plan</Text>
            <TouchableOpacity 
              style={styles.estimateButton}
              onPress={() => setShowBudgetModal(true)}
            >
              <Text style={styles.estimateButtonText}>Estimate</Text>
            </TouchableOpacity>
          </View>

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
          <TouchableOpacity style={styles.completeButton} onPress={savePlan}>
            <Text style={styles.completeButtonText}>Complete your Plan</Text>
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
  // New styles for selected packing items
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
});

export default CreatePlan;