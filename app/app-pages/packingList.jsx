import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PackingList = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [tripType, setTripType] = useState('');
  const [duration, setDuration] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [packingItems, setPackingItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [newItem, setNewItem] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Bottom navigation items
  const navItems = [
    { name: 'Home', icon: '🏠', target: '/profile' },
    { name: 'Map', icon: '🗺️', target: '/app-pages/map' },
    { name: 'Feed', icon: '📰', target: '/app-pages/feed' },
    { name: 'Group', icon: '👥', target: '/app-pages/community' },
    { name: 'Profile', icon: '👤', target: '/app-pages/profile' },
  ];

  // Check if we're returning from main form with selected items
  useEffect(() => {
    if (params.selectedItems) {
      try {
        const returnedSelectedItems = JSON.parse(params.selectedItems);
        // Mark items as selected based on returned data
        const newSelectedState = {};
        returnedSelectedItems.forEach(item => {
          newSelectedState[item] = true;
        });
        setSelectedItems(newSelectedState);
      } catch (e) {
        console.error('Error parsing selected items', e);
      }
    }
  }, [params.selectedItems]);

  const generatePackingList = () => {
    if (!tripType || !duration || !groupSize) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Generate packing list based on trip type
    const baseItems = [
      'Passport/ID',
      'Travel documents',
      'Phone charger',
      'Power bank',
      'First aid kit',
    ];

    const clothingItems = [
      'T-shirts',
      'Pants/Jeans',
      'Underwear',
      'Socks',
      'Sleepwear',
    ];

    const toiletries = [
      'Toothbrush',
      'Toothpaste',
      'Shampoo',
      'Soap',
      'Deodorant',
    ];

    const typeSpecific = tripType.toLowerCase().includes('beach') 
      ? ['Swimsuit', 'Sunscreen', 'Beach towel', 'Flip flops', 'Sun hat', 'Sunglasses']
      : tripType.toLowerCase().includes('mountain') || tripType.toLowerCase().includes('hiking')
      ? ['Hiking boots', 'Jacket', 'Warm clothes', 'Raincoat', 'Backpack', 'Water bottle']
      : tripType.toLowerCase().includes('business')
      ? ['Business cards', 'Laptop', 'Formal wear', 'Notebook', 'Presentation materials']
      : tripType.toLowerCase().includes('family')
      ? ['Kids clothes', 'Baby wipes', 'Snacks', 'Entertainment items', 'First aid for kids']
      : ['Comfortable shoes', 'Weather appropriate clothing', 'Camera'];

    // Adjust quantities based on duration and group size
    const durationNum = parseInt(duration) || 1;
    const groupSizeNum = parseInt(groupSize) || 1;
    
    let adjustedItems = [...baseItems, ...clothingItems, ...toiletries, ...typeSpecific];
    
    // Add quantity indicators for multi-day trips
    if (durationNum > 3) {
      adjustedItems = adjustedItems.map(item => {
        if (clothingItems.includes(item) || item === 'Underwear' || item === 'Socks') {
          return `${item} (${Math.min(durationNum, 7)} sets)`;
        }
        return item;
      });
    }

    // Add group size indicators
    if (groupSizeNum > 1) {
      adjustedItems = adjustedItems.map(item => {
        if (item.includes('Passport') || item.includes('Travel documents')) {
          return `${item} (for ${groupSizeNum} people)`;
        }
        return item;
      });
    }

    setPackingItems(adjustedItems);
    
    // Reset selected items when generating new list
    const initialSelected = {};
    adjustedItems.forEach(item => {
      initialSelected[item] = false;
    });
    setSelectedItems(initialSelected);
  };

  const addItemToList = () => {
    if (newItem.trim()) {
      const newItemText = newItem.trim();
      setPackingItems([...packingItems, newItemText]);
      setSelectedItems({...selectedItems, [newItemText]: false});
      setNewItem('');
    }
  };

  const removeItem = (index) => {
    const itemToRemove = packingItems[index];
    const updatedList = [...packingItems];
    updatedList.splice(index, 1);
    setPackingItems(updatedList);
    
    // Remove from selected items
    const updatedSelected = {...selectedItems};
    delete updatedSelected[itemToRemove];
    setSelectedItems(updatedSelected);
  };

  const toggleSelectItem = (item) => {
    setSelectedItems({
      ...selectedItems,
      [item]: !selectedItems[item]
    });
  };

  const handleAddToForm = () => {
    // Get selected items
    const itemsToAdd = packingItems.filter(item => selectedItems[item]);
    
    if (itemsToAdd.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to add to your plan.');
      return;
    }

    // Navigate back to create plan with selected items
    router.push({
      pathname: '/app-pages/createPlan',
      params: { 
        selectedPackingItems: JSON.stringify(itemsToAdd),
        fromPackingList: 'true'
      }
    });
  };

  const handleUpdateList = () => {
    // This could be used to save changes to the current list
    Alert.alert('Success', 'Your packing list has been updated!');
    setIsEditing(false);
  };

  const handleNavPress = (targetPath) => {
    if (targetPath) {
      router.push(targetPath);
    }
  };

  const renderPackingItem = ({ item, index }) => (
    <View style={styles.packingItemContainer}>
      <TouchableOpacity 
        style={styles.packingItemContent} 
        onPress={() => toggleSelectItem(item)}
      >
        <Text style={[styles.checkbox, selectedItems[item] && styles.checkboxSelected]}>
          {selectedItems[item] ? '✓' : '□'}
        </Text>
        <Text style={[
          styles.packingItemText,
          selectedItems[item] && styles.selectedItemText
        ]}>
          {item}
        </Text>
      </TouchableOpacity>
      {isEditing && (
        <TouchableOpacity onPress={() => removeItem(index)} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Count selected items
  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Packing List</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        data={packingItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderPackingItem}
        ListHeaderComponent={
          <>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>Get Ready to Pack</Text>
              <Text style={styles.subtitle}>
                Tick off everything you need for your trip.
              </Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Trip Type</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Beach, Mountain, Business"
                  value={tripType}
                  onChangeText={setTripType}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Duration</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Days"
                    keyboardType="numeric"
                    value={duration}
                    onChangeText={setDuration}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Group Size</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="People"
                    keyboardType="numeric"
                    value={groupSize}
                    onChangeText={setGroupSize}
                  />
                </View>
              </View>

              {/* Generate Button */}
              <TouchableOpacity style={styles.generateButton} onPress={generatePackingList}>
                <Text style={styles.generateButtonText}>Generate</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            {packingItems.length > 0 && (
              <>
                <View style={styles.actionButtons}>
                  <View style={styles.addToContainer}>
                    <TextInput
                      style={styles.addInput}
                      placeholder="Add item..."
                      value={newItem}
                      onChangeText={setNewItem}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addItemToList}>
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]} 
                    onPress={() => setIsEditing(!isEditing)}
                  >
                    <Text style={styles.editButtonText}>
                      {isEditing ? 'Done' : 'Edit'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Add to Form and Update Buttons */}
                <View style={styles.formActionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.addToFormButton]} 
                    onPress={handleAddToForm}
                  >
                    <Text style={styles.addToFormButtonText}>
                      Add to this form {selectedCount > 0 ? `(${selectedCount})` : ''}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.updateButton]} 
                    onPress={handleUpdateList}
                  >
                    <Text style={styles.updateButtonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* List Header with Selection Info */}
            {packingItems.length > 0 && (
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderTitle}>
                  Your Packing List {selectedCount > 0 ? `- ${selectedCount} selected` : ''}
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Fill in the details and click Generate to create your packing list</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
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
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  formActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToContainer: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 10,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#FF6B6B',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addToFormButton: {
    backgroundColor: '#5856D6',
    flex: 1,
    marginRight: 8,
  },
  addToFormButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#FF9500',
    flex: 0.5,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listHeader: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    paddingBottom: 100,
  },
  packingItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  packingItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    fontSize: 20,
    color: '#007AFF',
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  checkboxSelected: {
    color: '#34C759',
  },
  packingItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedItemText: {
    color: '#34C759',
    fontWeight: '500',
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
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

export default PackingList;