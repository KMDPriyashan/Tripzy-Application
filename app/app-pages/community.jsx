// app-pages/community.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const CommunityPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('chats'); // chats, groups, users
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteGroupId, setInviteGroupId] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadCurrentUser();
    loadChats();
    loadGroups();
    loadUsers();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await AsyncStorage.getItem('currentUser');
      if (user) {
        setCurrentUser(JSON.parse(user));
      } else {
        // Demo user
        const demoUser = { id: 'user1', name: 'Pavan Perera', avatar: '👤', isProfessional: true };
        setCurrentUser(demoUser);
        await AsyncStorage.setItem('currentUser', JSON.stringify(demoUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadChats = async () => {
    try {
      const savedChats = await AsyncStorage.getItem('directChats');
      if (savedChats) {
        setChats(JSON.parse(savedChats));
      } else {
        // Demo chats
        const demoChats = [
          { id: 'chat1', userId: 'user2', userName: 'Sarah Johnson', avatar: '👩', lastMessage: 'How are you! Doing well?', timestamp: '5:36 PM', unread: 2, isOnline: true },
          { id: 'chat2', userId: 'user3', userName: 'Mike Chen', avatar: '👨', lastMessage: 'Ready for the trip?', timestamp: '2:30 PM', unread: 0, isOnline: false },
          { id: 'chat3', userId: 'user4', userName: 'Emma Wilson', avatar: '👩‍🦰', lastMessage: 'Thanks for the info!', timestamp: 'Yesterday', unread: 1, isOnline: true },
        ];
        setChats(demoChats);
        await AsyncStorage.setItem('directChats', JSON.stringify(demoChats));
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const savedGroups = await AsyncStorage.getItem('communityGroups');
      if (savedGroups) {
        setGroups(JSON.parse(savedGroups));
      } else {
        // Demo groups
        const demoGroups = [
          { id: 'group1', name: 'Adventure Zone', members: ['user1', 'user2', 'user3'], lastMessage: 'How are You! Doin Well >', timestamp: '5:36 PM', unread: 2, memberCount: 8, avatar: '🏔️' },
          { id: 'group2', name: 'Family Trip', members: ['user1', 'user4', 'user5'], lastMessage: 'How are You! Doin Well >', timestamp: '1:36 PM', unread: 24, memberCount: 12, avatar: '👨‍👩‍👧' },
          { id: 'group3', name: 'Backpackers United', members: ['user2', 'user3', 'user6'], lastMessage: 'Anyone in Bali?', timestamp: '10:15 AM', unread: 5, memberCount: 45, avatar: '🎒' },
        ];
        setGroups(demoGroups);
        await AsyncStorage.setItem('communityGroups', JSON.stringify(demoGroups));
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const savedUsers = await AsyncStorage.getItem('registeredUsers');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        // Demo registered users
        const demoUsers = [
          { id: 'user1', name: 'Pavan Perera', avatar: '👤', isProfessional: true, location: 'Colombo, Sri Lanka' },
          { id: 'user2', name: 'Sarah Johnson', avatar: '👩', isProfessional: false, location: 'New York, USA' },
          { id: 'user3', name: 'Mike Chen', avatar: '👨', isProfessional: false, location: 'Singapore' },
          { id: 'user4', name: 'Emma Wilson', avatar: '👩‍🦰', isProfessional: true, location: 'London, UK' },
          { id: 'user5', name: 'Dasun Shanaka', avatar: '🏏', isProfessional: true, location: 'Colombo, Sri Lanka' },
          { id: 'user6', name: 'Jude Piramal', avatar: '🎨', isProfessional: false, location: 'Kandy, Sri Lanka' },
        ];
        setUsers(demoUsers);
        await AsyncStorage.setItem('registeredUsers', JSON.stringify(demoUsers));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleStartChat = (user) => {
    // Check if chat already exists
    const existingChat = chats.find(chat => chat.userId === user.id);
    if (existingChat) {
      router.push({
        pathname: '/app-pages/solo-chat',
        params: { chatId: existingChat.id, userName: user.name, userId: user.id, avatar: user.avatar }
      });
    } else {
      // Create new chat
      const newChat = {
        id: `chat_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        avatar: user.avatar,
        lastMessage: '',
        timestamp: new Date().toLocaleTimeString(),
        unread: 0,
        isOnline: false
      };
      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      AsyncStorage.setItem('directChats', JSON.stringify(updatedChats));
      
      router.push({
        pathname: '/app-pages/solo-chat',
        params: { chatId: newChat.id, userName: user.name, userId: user.id, avatar: user.avatar }
      });
    }
  };

  const handleOpenGroupChat = (group) => {
    router.push({
      pathname: '/app-pages/group-chat',
      params: { groupId: group.id, groupName: group.name, avatar: group.avatar }
    });
  };

  const handleOpenDirectChat = (chat) => {
    router.push({
      pathname: '/app-pages/solo-chat',
      params: { chatId: chat.id, userName: chat.userName, userId: chat.userId, avatar: chat.avatar }
    });
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    const newGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName,
      members: [currentUser?.id, ...selectedUsers],
      lastMessage: 'Group created',
      timestamp: 'Just now',
      unread: 0,
      memberCount: 1 + selectedUsers.length,
      avatar: '👥',
      createdBy: currentUser?.id,
      createdAt: new Date().toISOString()
    };

    const updatedGroups = [newGroup, ...groups];
    setGroups(updatedGroups);
    await AsyncStorage.setItem('communityGroups', JSON.stringify(updatedGroups));
    
    setShowCreateGroup(false);
    setNewGroupName('');
    setSelectedUsers([]);
    
    Alert.alert('Success', 'Group created successfully!');
  };

  const generateInviteLink = (groupId, groupName) => {
    const link = `tripzy://invite/${groupId}`;
    setInviteLink(link);
    setInviteGroupId(groupId);
    setInviteModalVisible(true);
  };

  const copyInviteLink = () => {
    // In real app, use Clipboard API
    Alert.alert('Link Copied', inviteLink);
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
        <TouchableOpacity 
          style={styles.inviteButton} 
          onPress={() => generateInviteLink(item.id, item.name)}
        >
          <Text style={styles.inviteButtonText}>➕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleStartChat(item)}>
      <View style={styles.userAvatarContainer}>
        <Text style={styles.userAvatarText}>{item.avatar}</Text>
        {item.isProfessional && <View style={styles.proBadge}><Text style={styles.proBadgeText}>Pro</Text></View>}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userLocation}>{item.location}</Text>
      </View>
      <TouchableOpacity style={styles.messageButton} onPress={() => handleStartChat(item)}>
        <Text style={styles.messageButtonText}>Message</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const filteredUsers = users.filter(user => 
    user.id !== currentUser?.id && 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChats = chats.filter(chat => 
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableUsersForGroup = users.filter(user => 
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
                  <Text style={styles.userSelectAvatar}>{user.avatar}</Text>
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
                    const user = users.find(u => u.id === userId);
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

      {/* Invite Modal */}
      <Modal
        visible={inviteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inviteModalContent}>
            <Text style={styles.inviteModalTitle}>Invite to Group</Text>
            <Text style={styles.inviteModalSubtitle}>Share this link with friends to join</Text>
            <View style={styles.inviteLinkContainer}>
              <Text style={styles.inviteLinkText}>{inviteLink}</Text>
            </View>
            <TouchableOpacity style={styles.copyLinkButton} onPress={copyInviteLink}>
              <Text style={styles.copyLinkButtonText}>Copy Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeInviteButton} onPress={() => setInviteModalVisible(false)}>
              <Text style={styles.closeInviteButtonText}>Close</Text>
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
  inviteButton: {
    marginTop: 6,
    padding: 4,
  },
  inviteButtonText: {
    fontSize: 14,
    color: '#007AFF',
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
  inviteModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  inviteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  inviteModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inviteLinkContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  inviteLinkText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
  copyLinkButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  copyLinkButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeInviteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeInviteButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

export default CommunityPage;