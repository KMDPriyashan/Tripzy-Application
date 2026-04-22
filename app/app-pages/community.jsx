// app-pages/community.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  createGroup,
  getAllUsers,
  getCurrentUser,
  getUserConversations,
  getUserGroups,
  joinGroup
} from '../../lib/supabase';

const CommunityPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [allUsersList, setAllUsersList] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  const loadAllData = async () => {
    await loadCurrentUser();
    await loadChats();
    await loadGroups();
    await loadUsers();
  };

  const loadCurrentUser = async () => {
    try {
      const supabaseUser = await getCurrentUser();
      if (supabaseUser) {
        setCurrentUser({ id: supabaseUser.id, name: supabaseUser.user_metadata?.name || 'User', avatar: '👤' });
      } else {
        const localUser = await AsyncStorage.getItem('currentUser');
        if (localUser) {
          setCurrentUser(JSON.parse(localUser));
        } else {
          const demoUser = { id: 'user1', name: 'Pavan Perera', avatar: '👤', isProfessional: true };
          setCurrentUser(demoUser);
          await AsyncStorage.setItem('currentUser', JSON.stringify(demoUser));
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadChats = async () => {
    try {
      if (!currentUser?.id) return;
      const conversations = await getUserConversations(currentUser.id);
      setChats(conversations);
    } catch (error) {
      console.error('Error loading chats:', error);
      // Fallback to local storage
      const savedChats = await AsyncStorage.getItem('directChats');
      if (savedChats) {
        setChats(JSON.parse(savedChats));
      }
    }
  };

  const loadGroups = async () => {
    try {
      if (!currentUser?.id) return;
      const userGroups = await getUserGroups(currentUser.id);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      // Fallback to local storage
      const savedGroups = await AsyncStorage.getItem('communityGroups');
      if (savedGroups) {
        setGroups(JSON.parse(savedGroups));
      }
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      const filteredUsers = allUsers.filter(user => user.id !== currentUser?.id);
      setAllUsersList(allUsers);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to local storage
      const savedUsers = await AsyncStorage.getItem('registeredUsers');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        setAllUsersList(parsedUsers);
        setUsers(parsedUsers.filter(u => u.id !== currentUser?.id));
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleStartChat = (user) => {
    router.push({
      pathname: '/app-pages/solo-chat',
      params: { 
        chatId: `chat_${user.id}_${currentUser?.id}`,
        userName: user.name, 
        userId: user.id, 
        avatar: user.avatar 
      }
    });
  };

  const handleOpenGroupChat = (group) => {
    router.push({
      pathname: '/app-pages/group-chat',
      params: { 
        groupId: group.id, 
        groupName: group.name, 
        avatar: group.avatar 
      }
    });
  };

  const handleOpenDirectChat = (chat) => {
    router.push({
      pathname: '/app-pages/solo-chat',
      params: { 
        chatId: chat.id, 
        userName: chat.userName, 
        userId: chat.userId, 
        avatar: chat.avatar 
      }
    });
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!currentUser?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const newGroup = await createGroup(newGroupName, currentUser.id, selectedUsers);
    
    if (newGroup) {
      await loadGroups();
      setShowCreateGroup(false);
      setNewGroupName('');
      setSelectedUsers([]);
      Alert.alert('Success', 'Group created successfully!');
    } else {
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!currentUser?.id) return;
    
    const success = await joinGroup(groupId, currentUser.id);
    if (success) {
      await loadGroups();
      Alert.alert('Success', 'Joined group successfully!');
    } else {
      Alert.alert('Error', 'Failed to join group');
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleOpenDirectChat(item)}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.userName}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage || 'Start a conversation'}</Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleOpenGroupChat(item)}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
        <Text style={styles.memberCount}>{item.memberCount} members</Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleStartChat(item)}>
      <View style={styles.userAvatarContainer}>
        <Text style={styles.userAvatarText}>{item.avatar || '👤'}</Text>
        {item.isProfessional && <View style={styles.proBadge}><Text style={styles.proBadgeText}>Pro</Text></View>}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userLocation}>{item.location || 'Traveler'}</Text>
      </View>
      <TouchableOpacity style={styles.messageButton} onPress={() => handleStartChat(item)}>
        <Text style={styles.messageButtonText}>Message</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChats = chats.filter(chat => 
    chat.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableUsersForGroup = allUsersList.filter(user => 
    user.id !== currentUser?.id && !selectedUsers.includes(user.id)
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>Where every journey begins with connection</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search any things..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]} 
          onPress={() => setActiveTab('chats')}
        >
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>Direct Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]} 
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Community Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]} 
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Find Travelers</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={
          activeTab === 'chats' ? filteredChats :
          activeTab === 'groups' ? filteredGroups : filteredUsers
        }
        keyExtractor={(item) => item.id}
        renderItem={
          activeTab === 'chats' ? renderChatItem :
          activeTab === 'groups' ? renderGroupItem : renderUserItem
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab === 'chats' ? 'messages' : activeTab === 'groups' ? 'groups' : 'users'} found</Text>
          </View>
        }
      />

      {/* Create Group Button */}
      {activeTab === 'groups' && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowCreateGroup(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Create Group Modal */}
      <Modal
        visible={showCreateGroup}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateGroup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Group</Text>
              <TouchableOpacity onPress={() => setShowCreateGroup(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Group Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your group name"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            
            <Text style={styles.inputLabel}>Add Members</Text>
            <ScrollView style={styles.userSelectList} showsVerticalScrollIndicator={false}>
              {availableUsersForGroup.map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userSelectItem}
                  onPress={() => setSelectedUsers([...selectedUsers, user.id])}
                >
                  <Text style={styles.userSelectAvatar}>{user.avatar || '👤'}</Text>
                  <Text style={styles.userSelectName}>{user.name}</Text>
                  <Text style={styles.userSelectAdd}>+ Add</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {selectedUsers.length > 0 && (
              <View style={styles.selectedUsersContainer}>
                <Text style={styles.selectedUsersTitle}>Selected ({selectedUsers.length}):</Text>
                <View style={styles.selectedUsersList}>
                  {selectedUsers.map(userId => {
                    const user = allUsersList.find(u => u.id === userId);
                    return user ? (
                      <View key={userId} style={styles.selectedUserChip}>
                        <Text style={styles.selectedUserText}>{user.name}</Text>
                        <TouchableOpacity onPress={() => setSelectedUsers(selectedUsers.filter(id => id !== userId))}>
                          <Text style={styles.removeUserText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            )}
            
            <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
              <Text style={styles.createGroupButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 44,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: '#666',
  },
  memberCount: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginBottom: 6,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 44,
  },
  proBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  proBadgeText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 12,
    color: '#666',
  },
  messageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  messageButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalClose: {
    fontSize: 20,
    color: '#999',
    padding: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  userSelectList: {
    maxHeight: 200,
  },
  userSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userSelectAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  userSelectName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  userSelectAdd: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedUsersContainer: {
    marginTop: 16,
  },
  selectedUsersTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  selectedUsersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F1FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedUserText: {
    fontSize: 13,
    color: '#007AFF',
    marginRight: 6,
  },
  removeUserText: {
    fontSize: 12,
    color: '#007AFF',
  },
  createGroupButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  createGroupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommunityPage;