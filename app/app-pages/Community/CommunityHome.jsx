// app-pages/community/CommunityHome.jsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase.js';

const CommunityHome = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'users', 'groups'

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        loadData();
        setupRealtimeSubscriptions();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadGroups(),
        loadRecentChats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser?.id)
        .limit(50);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadGroups = async () => {
    try {
      // Get groups where user is a member
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups:group_id (*)
        `)
        .eq('user_id', currentUser?.id);
      
      if (error) throw error;
      
      const userGroups = data?.map(item => item.groups).filter(Boolean) || [];
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadRecentChats = async () => {
    try {
      // Get recent direct messages
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:sender_id(*),
          receiver:receiver_id(*)
        `)
        .or(`sender_id.eq.${currentUser?.id},receiver_id.eq.${currentUser?.id}`)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Group by conversation
      const conversations = new Map();
      data?.forEach(msg => {
        const otherUserId = msg.sender_id === currentUser?.id ? msg.receiver_id : msg.sender_id;
        const otherUser = msg.sender_id === currentUser?.id ? msg.receiver : msg.sender;
        
        if (!conversations.has(otherUserId)) {
          conversations.set(otherUserId, {
            user: otherUser,
            lastMessage: msg.message,
            lastMessageTime: msg.created_at,
            unread: !msg.is_read && msg.receiver_id === currentUser?.id
          });
        }
      });
      
      setRecentChats(Array.from(conversations.values()));
    } catch (error) {
      console.error('Error loading recent chats:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to new messages
    const subscription = supabase
      .channel('community-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          if (payload.new.receiver_id === currentUser?.id) {
            loadRecentChats();
          }
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUserPress = (user) => {
    router.push({
      pathname: '/app-pages/community/UserProfile',
      params: { userId: user.id, userName: user.full_name }
    });
  };

  const handleGroupPress = (group) => {
    router.push({
      pathname: '/app-pages/community/GroupChat',
      params: { groupId: group.id, groupName: group.name }
    });
  };

  const handleChatPress = (chat) => {
    router.push({
      pathname: '/app-pages/community/DirectChat',
      params: { userId: chat.user.id, userName: chat.user.full_name }
    });
  };

  const handleCreateGroup = () => {
    router.push('/app-pages/community/CreateGroup');
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserCard = ({ item }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => handleUserPress(item)}>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>{item.full_name?.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.full_name}</Text>
        <Text style={styles.userUsername}>@{item.username || 'traveler'}</Text>
        {item.bio && <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>}
      </View>
      <TouchableOpacity style={styles.messageButton} onPress={() => {
        router.push({
          pathname: '/app-pages/community/DirectChat',
          params: { userId: item.id, userName: item.full_name }
        });
      }}>
        <Ionicons name="chatbubble-outline" size={20} color="#2e7d32" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGroupCard = ({ item }) => (
    <TouchableOpacity style={styles.groupCard} onPress={() => handleGroupPress(item)}>
      <View style={[styles.groupAvatar, styles.groupAvatarPlaceholder]}>
        <Ionicons name="people" size={24} color="#fff" />
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupMemberCount}>{item.member_count || 0} members</Text>
        {item.description && <Text style={styles.groupDesc} numberOfLines={1}>{item.description}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderChatCard = ({ item }) => (
    <TouchableOpacity style={styles.chatCard} onPress={() => handleChatPress(item)}>
      {item.user.avatar_url ? (
        <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>{item.user.full_name?.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.user.full_name}</Text>
          <Text style={styles.chatTime}>
            {item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
        <Text style={styles.chatMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      {item.unread && <View style={styles.unreadBadge} />}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>No {activeTab === 'users' ? 'users' : activeTab === 'groups' ? 'groups' : 'chats'} found</Text>
      <Text style={styles.emptyText}>
        {activeTab === 'users' ? 'Search for other travelers to connect with!' : 
         activeTab === 'groups' ? 'Create a group to start planning trips together!' : 
         'Start a conversation with other travelers!'}
      </Text>
      {activeTab === 'groups' && (
        <TouchableOpacity style={styles.createGroupBtn} onPress={handleCreateGroup}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.createGroupBtnText}>Create Group</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading community...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users or groups..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
          onPress={() => setActiveTab('chats')}
        >
          <Ionicons name="chatbubbles-outline" size={20} color={activeTab === 'chats' ? '#2e7d32' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons name="people-outline" size={20} color={activeTab === 'users' ? '#2e7d32' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Ionicons name="people-circle-outline" size={20} color={activeTab === 'groups' ? '#2e7d32' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Groups</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={
          activeTab === 'users' ? filteredUsers :
          activeTab === 'groups' ? filteredGroups :
          recentChats
        }
        renderItem={
          activeTab === 'users' ? renderUserCard :
          activeTab === 'groups' ? renderGroupCard :
          renderChatCard
        }
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2e7d32']} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userUsername: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  userBio: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupAvatarPlaceholder: {
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  groupMemberCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  groupDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatTime: {
    fontSize: 11,
    color: '#999',
  },
  chatMessage: {
    fontSize: 13,
    color: '#666',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2e7d32',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  createGroupBtn: {
    flexDirection: 'row',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  createGroupBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2e7d32',
  },
});

export default CommunityHome;