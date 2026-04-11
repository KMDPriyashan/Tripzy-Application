import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Simple UUID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const MyItineraries = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    activities: [],
  });
  const [newActivity, setNewActivity] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  // Load plans from storage
  const loadPlans = async () => {
    try {
      const savedPlans = await AsyncStorage.getItem('travelPlans');
      if (savedPlans) {
        const parsedPlans = JSON.parse(savedPlans);
        // Sort by created date (newest first)
        parsedPlans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPlans(parsedPlans);
      } else {
        // Sample data for testing
        const samplePlans = [
          {
            id: generateUUID(),
            destination: 'Bali, Indonesia',
            startDate: '2025-05-15',
            endDate: '2025-05-22',
            activities: ['Visit Ubud', 'Beach day at Kuta', 'Sunset at Tanah Lot'],
            notes: 'Remember to bring sunscreen!',
            createdAt: new Date().toISOString(),
          },
          {
            id: generateUUID(),
            destination: 'Tokyo, Japan',
            startDate: '2025-06-10',
            endDate: '2025-06-20',
            activities: ['Shibuya Crossing', 'Mount Fuji tour', 'Akihabara shopping'],
            notes: 'Get JR Pass',
            createdAt: new Date().toISOString(),
          },
        ];
        setPlans(samplePlans);
        await AsyncStorage.setItem('travelPlans', JSON.stringify(samplePlans));
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [])
  );

  // Handle share functionality using React Native's built-in Share
  const handleShare = async (plan) => {
    try {
      const shareMessage = `
🗺️ Travel Itinerary: ${plan.destination}
📅 Date: ${formatDateRange(plan.startDate, plan.endDate)}
✈️ Duration: ${calculateDays(plan.startDate, plan.endDate)} days

Activities:
${plan.activities.map((activity, i) => `${i + 1}. ${activity}`).join('\n')}

${plan.notes ? `📝 Notes: ${plan.notes}` : ''}

Created with Tripzy App
      `;
      
      await Share.share({
        message: shareMessage,
        title: `My ${plan.destination} Itinerary`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share itinerary');
    }
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return 'Date not set';
    
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };
    
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return start;
    } else if (end) {
      return end;
    }
    return 'Date not set';
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch {
      return 0;
    }
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedPlan(null);
    });
  };

  const handleDeletePlan = async (planId) => {
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
              const updatedPlans = plans.filter(plan => plan.id !== planId);
              await AsyncStorage.setItem('travelPlans', JSON.stringify(updatedPlans));
              setPlans(updatedPlans);
              if (modalVisible) closeModal();
              Alert.alert('Success', 'Itinerary deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete itinerary');
            }
          },
        },
      ]
    );
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setEditForm({
      destination: plan.destination,
      startDate: plan.startDate || '',
      endDate: plan.endDate || '',
      activities: [...(plan.activities || [])],
      notes: plan.notes || '',
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    try {
      const updatedPlans = plans.map(plan =>
        plan.id === editingPlan.id
          ? {
              ...plan,
              destination: editForm.destination,
              startDate: editForm.startDate,
              endDate: editForm.endDate,
              activities: editForm.activities,
              notes: editForm.notes,
              updatedAt: new Date().toISOString(),
            }
          : plan
      );
      
      await AsyncStorage.setItem('travelPlans', JSON.stringify(updatedPlans));
      setPlans(updatedPlans);
      setEditModalVisible(false);
      setEditingPlan(null);
      Alert.alert('Success', 'Itinerary updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update itinerary');
    }
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      setEditForm({
        ...editForm,
        activities: [...editForm.activities, newActivity.trim()],
      });
      setNewActivity('');
    }
  };

  const removeActivity = (index) => {
    const updatedActivities = editForm.activities.filter((_, i) => i !== index);
    setEditForm({ ...editForm, activities: updatedActivities });
  };

  const bottomNavItems = [
    { name: 'Home', icon: 'home-outline', route: '/app-pages/home' },
    { name: 'Map', icon: 'map-outline', route: '/app-pages/map' },
    { name: 'Feed', icon: 'newspaper-outline', route: '/app-pages/feed' },
    { name: 'Group', icon: 'people-outline', route: '/app-pages/community' },
    { name: 'Profile', icon: 'person-outline', route: '/app-pages/profile' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Itineraries</Text>
        <TouchableOpacity onPress={loadPlans} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {plans.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Itineraries Yet</Text>
            <Text style={styles.emptyText}>
              Create your first travel plan to see it here!
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/app-pages/createPlan')}
            >
              <Text style={styles.createButtonText}>Create Itinerary</Text>
            </TouchableOpacity>
          </View>
        ) : (
          plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={styles.planCard}
              onPress={() => handleViewPlan(plan)}
            >
              <View style={styles.planHeader}>
                <View style={styles.planIcon}>
                  <Ionicons name="airplane-outline" size={24} color="#007AFF" />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planDestination}>{plan.destination}</Text>
                  <Text style={styles.planDate}>
                    {formatDateRange(plan.startDate, plan.endDate)}
                  </Text>
                  <View style={styles.planStats}>
                    <Text style={styles.planDays}>
                      {calculateDays(plan.startDate, plan.endDate)} days
                    </Text>
                    <Text style={styles.planActivities}>
                      {plan.activities?.length || 0} activities
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
            <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.modalContent,
                  {
                    transform: [{ translateX: slideAnim }]
                  }
                ]}
              >
                {selectedPlan && (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{selectedPlan.destination}</Text>
                      <TouchableOpacity onPress={closeModal} style={styles.modalClose}>
                        <Ionicons name="close" size={24} color="#333" />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Travel Dates</Text>
                        <Text style={styles.detailValue}>
                          {formatDateRange(selectedPlan.startDate, selectedPlan.endDate)}
                        </Text>
                        <Text style={styles.detailSubtext}>
                          {calculateDays(selectedPlan.startDate, selectedPlan.endDate)} days trip
                        </Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Activities</Text>
                        {selectedPlan.activities && selectedPlan.activities.length > 0 ? (
                          selectedPlan.activities.map((activity, index) => (
                            <View key={index} style={styles.activityItem}>
                              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                              <Text style={styles.activityText}>{activity}</Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.noDataText}>No activities added</Text>
                        )}
                      </View>

                      {selectedPlan.notes && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Notes</Text>
                          <Text style={styles.notesText}>{selectedPlan.notes}</Text>
                        </View>
                      )}

                      <View style={styles.modalActions}>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.editButton]}
                          onPress={() => {
                            closeModal();
                            setTimeout(() => handleEditPlan(selectedPlan), 300);
                          }}
                        >
                          <Ionicons name="create-outline" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.actionButton, styles.shareButton]}
                          onPress={() => handleShare(selectedPlan)}
                        >
                          <Ionicons name="share-outline" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDeletePlan(selectedPlan.id)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Itinerary</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editModalBody}>
              <Text style={styles.inputLabel}>Destination</Text>
              <TextInput
                style={styles.input}
                value={editForm.destination}
                onChangeText={(text) => setEditForm({ ...editForm, destination: text })}
                placeholder="Enter destination"
              />

              <Text style={styles.inputLabel}>Start Date</Text>
              <TextInput
                style={styles.input}
                value={editForm.startDate}
                onChangeText={(text) => setEditForm({ ...editForm, startDate: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.inputLabel}>End Date</Text>
              <TextInput
                style={styles.input}
                value={editForm.endDate}
                onChangeText={(text) => setEditForm({ ...editForm, endDate: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.inputLabel}>Activities</Text>
              <View style={styles.addActivityContainer}>
                <TextInput
                  style={styles.activityInput}
                  value={newActivity}
                  onChangeText={setNewActivity}
                  placeholder="Add an activity"
                />
                <TouchableOpacity style={styles.addButton} onPress={addActivity}>
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {editForm.activities.map((activity, index) => (
                <View key={index} style={styles.activityListItem}>
                  <Text style={styles.activityListText}>{activity}</Text>
                  <TouchableOpacity onPress={() => removeActivity(index)}>
                    <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={editForm.notes}
                onChangeText={(text) => setEditForm({ ...editForm, notes: text })}
                placeholder="Add any notes..."
                multiline
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomNavItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
          >
            <Ionicons name={item.icon} size={24} color="#666" />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planDestination: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  planDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  planStats: {
    flexDirection: 'row',
    gap: 12,
  },
  planDays: {
    fontSize: 12,
    color: '#007AFF',
  },
  planActivities: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  modalClose: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  detailSubtext: {
    fontSize: 14,
    color: '#999',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  editModalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addActivityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  activityInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityListText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
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
  navText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginTop: 4,
  },
});

export default MyItineraries;