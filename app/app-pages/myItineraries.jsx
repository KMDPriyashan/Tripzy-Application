import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MyItineraries = () => {
  const router = useRouter();
  const [itineraries, setItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load itineraries when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadItineraries();
    }, [])
  );

  const loadItineraries = async () => {
    try {
      const savedPlans = await AsyncStorage.getItem('travelPlans');
      if (savedPlans) {
        const plans = JSON.parse(savedPlans);
        setItineraries(plans);
      }
    } catch (error) {
      console.error('Error loading itineraries:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadItineraries();
    setRefreshing(false);
  };

  const handleDeleteItinerary = (id) => {
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
              const updatedItineraries = itineraries.filter(item => item.id !== id);
              await AsyncStorage.setItem('travelPlans', JSON.stringify(updatedItineraries));
              setItineraries(updatedItineraries);
              Alert.alert('Success', 'Itinerary deleted successfully');
            } catch (error) {
              console.error('Error deleting itinerary:', error);
            }
          }
        }
      ]
    );
  };

  const handleShare = async (itinerary) => {
    try {
      const message = `Check out my trip to ${itinerary.destination}!\n\n` +
        `📍 From: ${itinerary.startDate} to ${itinerary.endDate}\n` +
        `💰 Budget: $${itinerary.budgetEstimate?.total || 0}\n` +
        `📍 Location: ${itinerary.planningLocation}, ${itinerary.province}`;

      await Share.share({
        message,
        title: `My Trip to ${itinerary.destination}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'planned': return '#007AFF';
      case 'in progress': return '#FF9500';
      case 'completed': return '#34C759';
      default: return '#666';
    }
  };

  const ItineraryCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedItinerary(item);
        setModalVisible(true);
      }}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name="location-outline" size={20} color="#007AFF" />
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.destination || 'Untitled Trip'}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleDeleteItinerary(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Card Image */}
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.placeholderImage]}>
          <Ionicons name="image-outline" size={40} color="#ccc" />
        </View>
      )}

      {/* Card Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardDateRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.cardDate}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.currentStatus) }]}>
            <Text style={styles.statusText}>{item.currentStatus || 'Planned'}</Text>
          </View>
        </View>

        <Text style={styles.cardLocation} numberOfLines={1}>
          {item.planningLocation || 'Location not set'}
          {item.province ? `, ${item.province}` : ''}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            <View style={styles.cardStats}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.cardStatsText}>
                {item.startedTime || 'Time not set'}
              </Text>
            </View>
            <View style={styles.cardStats}>
              <Ionicons name="wallet-outline" size={14} color="#666" />
              <Text style={styles.cardStatsText}>
                ${item.budgetEstimate?.total || 0}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-outline" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Travel Guide</Text>
          </View>
          {item.selectedPackingItems?.length > 0 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Packing Ready</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={16} color="#666" />
            <Text style={styles.statText}>1.2k</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text style={styles.statText}>1.75k</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ItineraryDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedItinerary && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Trip Details</Text>
                  <TouchableOpacity onPress={() => handleShare(selectedItinerary)}>
                    <Ionicons name="share-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>
                </View>

                {/* Hero Image */}
                {selectedItinerary.image ? (
                  <Image source={{ uri: selectedItinerary.image }} style={styles.modalImage} />
                ) : (
                  <View style={[styles.modalImage, styles.modalPlaceholderImage]}>
                    <Ionicons name="image-outline" size={50} color="#ccc" />
                  </View>
                )}

                {/* Title Section */}
                <View style={styles.modalBody}>
                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalDestination}>
                      {selectedItinerary.destination || 'Untitled Destination'}
                    </Text>
                    <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedItinerary.currentStatus) }]}>
                      <Text style={styles.modalStatusText}>{selectedItinerary.currentStatus || 'Planned'}</Text>
                    </View>
                  </View>

                  {selectedItinerary.postCaption && (
                    <Text style={styles.modalCaption}>"{selectedItinerary.postCaption}"</Text>
                  )}

                  {/* Trip Details Grid */}
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailCard}>
                      <Ionicons name="calendar" size={20} color="#007AFF" />
                      <Text style={styles.detailLabel}>Start Date</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedItinerary.startDate)}</Text>
                    </View>
                    <View style={styles.detailCard}>
                      <Ionicons name="calendar" size={20} color="#FF6B6B" />
                      <Text style={styles.detailLabel}>End Date</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedItinerary.endDate)}</Text>
                    </View>
                    <View style={styles.detailCard}>
                      <Ionicons name="time" size={20} color="#34C759" />
                      <Text style={styles.detailLabel}>Start Time</Text>
                      <Text style={styles.detailValue}>{selectedItinerary.startedTime || 'Not set'}</Text>
                    </View>
                    <View style={styles.detailCard}>
                      <Ionicons name="people" size={20} color="#FF9500" />
                      <Text style={styles.detailLabel}>Collaborators</Text>
                      <Text style={styles.detailValue}>0</Text>
                    </View>
                  </View>

                  {/* Location Info */}
                  <View style={styles.infoSection}>
                    <Text style={styles.infoSectionTitle}>📍 Location Details</Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="location" size={16} color="#666" />
                      <Text style={styles.infoText}>
                        {selectedItinerary.planningLocation || 'Location not specified'}
                        {selectedItinerary.province ? `, ${selectedItinerary.province}` : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Budget Breakdown */}
                  {selectedItinerary.budgetBreakdown && (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>💰 Budget Breakdown</Text>
                      <View style={styles.budgetItems}>
                        <View style={styles.budgetItem}>
                          <Text style={styles.budgetItemLabel}>Transport</Text>
                          <Text style={styles.budgetItemValue}>
                            ${selectedItinerary.budgetBreakdown.transport?.cost || 0}
                          </Text>
                        </View>
                        <View style={styles.budgetItem}>
                          <Text style={styles.budgetItemLabel}>Accommodation</Text>
                          <Text style={styles.budgetItemValue}>
                            ${selectedItinerary.budgetBreakdown.accommodation?.cost || 0}
                          </Text>
                        </View>
                        <View style={styles.budgetItem}>
                          <Text style={styles.budgetItemLabel}>Food</Text>
                          <Text style={styles.budgetItemValue}>
                            ${selectedItinerary.budgetBreakdown.food?.cost || 0}
                          </Text>
                        </View>
                        <View style={styles.budgetItem}>
                          <Text style={styles.budgetItemLabel}>Activities</Text>
                          <Text style={styles.budgetItemValue}>
                            ${selectedItinerary.budgetBreakdown.activities?.cost || 0}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.totalBudget}>
                        <Text style={styles.totalBudgetLabel}>Total</Text>
                        <Text style={styles.totalBudgetValue}>
                          ${selectedItinerary.budgetBreakdown.total?.toFixed(2) || 0}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Packing List */}
                  {selectedItinerary.selectedPackingItems?.length > 0 && (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>🎒 Packing List</Text>
                      <View style={styles.packingItems}>
                        {selectedItinerary.selectedPackingItems.map((item, index) => (
                          <View key={index} style={styles.packingItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                            <Text style={styles.packingItemText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Trip Notes */}
                  {selectedItinerary.tripNotes && (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>📝 Trip Notes</Text>
                      <Text style={styles.notesText}>{selectedItinerary.tripNotes}</Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.whatsappButton}>
                      <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                      <Text style={styles.whatsappButtonText}>Connect to WhatsApp</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.reserveButton}
                      onPress={() => {
                        setModalVisible(false);
                        Alert.alert('Reserve', 'Reservation feature coming soon!');
                      }}
                    >
                      <Text style={styles.reserveButtonText}>Reserve for 'Travel Guide'</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="map-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Itineraries Yet</Text>
      <Text style={styles.emptyText}>
        Start planning your first adventure! Create a travel plan to see it here.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => router.push('/Trip plan pages/createPlan')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Create Your First Plan</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ItineraryDetailModal />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome to Your</Text>
          <Text style={styles.headerTitle}>Travel Planner</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/app-pages/createPlan')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Start your journey by creating, organizing, and exploring your perfect trip.
      </Text>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Itineraries</Text>
        <Text style={styles.sectionSubtitle}>
          Time to map out the voyage — one bold step at a time 🚶‍♀️
        </Text>
      </View>

      {/* Category Tags */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
        <View style={styles.tagsWrapper}>
          <TouchableOpacity style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.categoryTag, styles.categoryTagActive]}>
            <Text style={[styles.categoryTagText, styles.categoryTagTextActive]}>Beach</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>Adventure</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>Mountain</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>City</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Itineraries List */}
      <FlatList
        data={itineraries}
        renderItem={({ item }) => <ItineraryCard item={item} />}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={EmptyState}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 30,
    lineHeight: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  tagsScroll: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tagsWrapper: {
    flexDirection: 'row',
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryTagActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryTagText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTagTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 15,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  cardLocation: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardFooterLeft: {
    flexDirection: 'row',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  cardStatsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  shareButton: {
    padding: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  tagText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalPlaceholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalDestination: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  modalStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalCaption: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  budgetItems: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  budgetItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  budgetItemValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalBudget: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  totalBudgetLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalBudgetValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  packingItems: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  packingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  packingItemText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
  },
  actionButtons: {
    marginTop: 20,
  },
  whatsappButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reserveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyItineraries;