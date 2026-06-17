// app-pages/community.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
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
import { supabase } from '../../lib/supabase';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [userNamesMap, setUserNamesMap] = useState({});
  const [userAvatarsMap, setUserAvatarsMap] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // Group Profile Picture States (Local only)
  const [groupAvatar, setGroupAvatar] = useState('👥');
  const [groupAvatarUri, setGroupAvatarUri] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Load user data immediately on component mount
  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    await loadCurrentUser();
    setIsInitialized(true);
  };

  // Load all data when user is loaded and when page focuses
  useFocusEffect(
    useCallback(() => {
      if (isInitialized && currentUser?.id) {
        loadAllData();
      }
    }, [isInitialized, currentUser])
  );

  const loadAllData = async () => {
    if (!currentUser?.id) return;
    console.log('Loading all data for user:', currentUser.id);
    await Promise.all([
      loadChatsFromStorage(),
      loadGroupsFromStorage(),
      loadUsers()
    ]);
  };

  const loadCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && !error) {
        const userName = user.user_metadata?.display_name || 
                         user.user_metadata?.name || 
                         user.user_metadata?.full_name || 
                         user.email?.split('@')[0] || 
                         'User';
        setCurrentUser({ 
          id: user.id, 
          name: userName, 
          avatar: user.user_metadata?.avatar || '👤',
          email: user.email
        });
        console.log('✅ Current user loaded from Supabase:', userName);
      } else {
        const localUser = await AsyncStorage.getItem('currentUser');
        if (localUser) {
          const parsedUser = JSON.parse(localUser);
          setCurrentUser(parsedUser);
          console.log('✅ Current user loaded from storage:', parsedUser.name);
        } else {
          const demoUser = { id: 'demo_user_1', name: 'Demo User', avatar: '👤' };
          setCurrentUser(demoUser);
          await AsyncStorage.setItem('currentUser', JSON.stringify(demoUser));
          console.log('✅ Demo user created');
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      const demoUser = { id: 'demo_user_1', name: 'Demo User', avatar: '👤' };
      setCurrentUser(demoUser);
    }
  };

  const loadChatsFromStorage = async () => {
    try {
      if (!currentUser?.id) return;
      
      const conversationsKey = `conversations_${currentUser.id}`;
      const savedConversations = await AsyncStorage.getItem(conversationsKey);
      
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations);
        const cleanedConversations = parsedConversations.map(chat => ({
          ...chat,
          unread: 0
        }));
        setChats(cleanedConversations);
        console.log('✅ Loaded chats from storage:', cleanedConversations.length);
      } else {
        setChats([]);
        console.log('No chats found in storage');
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setChats([]);
    }
  };

  const loadGroupsFromStorage = async () => {
    try {
      if (!currentUser?.id) return;
      
      const groupsKey = `groups_${currentUser.id}`;
      const savedGroups = await AsyncStorage.getItem(groupsKey);
      
      if (savedGroups) {
        const parsedGroups = JSON.parse(savedGroups);
        setGroups(parsedGroups);
        console.log('✅ Loaded groups from storage:', parsedGroups.length);
      } else {
        setGroups([]);
        console.log('No groups found in storage');
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      setGroups([]);
    }
  };

  const saveConversationsToStorage = async (conversations) => {
    try {
      if (!currentUser?.id) return;
      const conversationsKey = `conversations_${currentUser.id}`;
      const cleanedConversations = conversations.map(chat => ({
        ...chat,
        unread: 0
      }));
      await AsyncStorage.setItem(conversationsKey, JSON.stringify(cleanedConversations));
      console.log('💾 Conversations saved to storage:', cleanedConversations.length);
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  };

  const saveGroupsToStorage = async (groupsToSave) => {
    try {
      if (!currentUser?.id) return;
      const groupsKey = `groups_${currentUser.id}`;
      await AsyncStorage.setItem(groupsKey, JSON.stringify(groupsToSave));
      console.log('💾 Groups saved to storage:', groupsToSave.length);
    } catch (error) {
      console.error('Error saving groups:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      
      let allUsers = [];
      
      const cachedUsers = await AsyncStorage.getItem('all_users');
      if (cachedUsers) {
        try {
          const parsedUsers = JSON.parse(cachedUsers);
          if (parsedUsers.length > 0) {
            console.log('✅ Loaded users from cache:', parsedUsers.length);
            allUsers = parsedUsers;
          }
        } catch (e) {
          console.log('Error parsing cached users:', e);
        }
      }
      
      if (allUsers.length === 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (!profilesError && profilesData && profilesData.length > 0) {
          console.log('✅ Loaded from profiles:', profilesData.length);
          allUsers = profilesData.map(p => ({
            id: p.id || p.user_id,
            name: p.display_name || p.name || p.full_name || p.username || 'Traveler',
            display_name: p.display_name || p.name || p.full_name || p.username || 'Traveler',
            full_name: p.full_name,
            email: p.email,
            avatar: p.avatar || '👤',
            location: p.location || 'Traveler'
          }));
        }
      }
      
      if (allUsers.length === 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');
        
        if (!usersError && usersData && usersData.length > 0) {
          console.log('✅ Loaded from users:', usersData.length);
          allUsers = usersData.map(u => ({
            ...u,
            display_name: u.display_name || u.name || u.full_name || u.email?.split('@')[0] || 'Traveler'
          }));
        }
      }
      
      if (currentUser?.id) {
        const userExists = allUsers.some(u => u.id === currentUser.id);
        if (!userExists) {
          allUsers.push({
            id: currentUser.id,
            name: currentUser.display_name || currentUser.name || 'Current User',
            display_name: currentUser.display_name || currentUser.name || 'Current User',
            email: currentUser.email || '',
            avatar: currentUser.avatar || '👤',
            location: 'Traveler'
          });
          console.log('✅ Added current user to list');
        }
      }
      
      if (allUsers.length === 0) {
        console.log('No users found, using demo users');
        const demoUsers = [
          { id: 'demo_1', name: 'Sarah Johnson', display_name: 'Sarah Johnson', email: 'sarah@example.com', avatar: '👩', location: 'Bali' },
          { id: 'demo_2', name: 'Mike Chen', display_name: 'Mike Chen', email: 'mike@example.com', avatar: '👨', location: 'Tokyo' },
          { id: 'demo_3', name: 'Emma Rodriguez', display_name: 'Emma Rodriguez', email: 'emma@example.com', avatar: '👩', location: 'Paris' },
          { id: 'demo_4', name: 'David Kim', display_name: 'David Kim', email: 'david@example.com', avatar: '👨', location: 'Seoul' },
          { id: 'demo_5', name: 'Lisa Thompson', display_name: 'Lisa Thompson', email: 'lisa@example.com', avatar: '👩', location: 'London' },
        ];
        
        if (currentUser?.id) {
          const currentExists = demoUsers.some(u => u.id === currentUser.id);
          if (!currentExists) {
            demoUsers.unshift({
              id: currentUser.id,
              name: currentUser.display_name || currentUser.name || 'Current User',
              display_name: currentUser.display_name || currentUser.name || 'Current User',
              email: currentUser.email || '',
              avatar: currentUser.avatar || '👤',
              location: 'Traveler'
            });
          }
        }
        
        allUsers = demoUsers;
        console.log('✅ Created demo users:', allUsers.length);
      }
      
      const seen = new Set();
      const uniqueUsers = allUsers.filter(user => {
        const key = user.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      const filteredUsers = uniqueUsers.filter(user => user.id !== currentUser?.id);
      
      const namesMap = {};
      const avatarsMap = {};
      uniqueUsers.forEach(user => {
        const userName = user.display_name || 
                         user.name || 
                         user.full_name || 
                         user.user_metadata?.display_name ||
                         user.user_metadata?.name ||
                         user.user_metadata?.full_name ||
                         user.email?.split('@')[0] ||
                         'Traveler';
        namesMap[user.id] = userName;
        avatarsMap[user.id] = user.avatar || user.user_metadata?.avatar || '👤';
      });
      
      setUserNamesMap(namesMap);
      setUserAvatarsMap(avatarsMap);
      setAllUsersList(uniqueUsers);
      setUsers(filteredUsers);
      
      console.log('📊 TOTAL UNIQUE USERS:', uniqueUsers.length);
      console.log('📊 FILTERED USERS (excluding current):', filteredUsers.length);
      
      await AsyncStorage.setItem('all_users', JSON.stringify(uniqueUsers));
      
    } catch (error) {
      console.error('Error loading users:', error);
      
      const cachedUsers = await AsyncStorage.getItem('all_users');
      if (cachedUsers) {
        try {
          const parsedUsers = JSON.parse(cachedUsers);
          setAllUsersList(parsedUsers);
          setUsers(parsedUsers.filter(u => u.id !== currentUser?.id));
          console.log('✅ Loaded users from cache (fallback):', parsedUsers.length);
        } catch (e) {
          console.error('Error parsing cached users:', e);
          const fallbackUsers = [
            { id: 'demo_1', name: 'Sarah Johnson', display_name: 'Sarah Johnson', avatar: '👩', location: 'Bali' },
            { id: 'demo_2', name: 'Mike Chen', display_name: 'Mike Chen', avatar: '👨', location: 'Tokyo' },
          ];
          if (currentUser?.id) {
            fallbackUsers.unshift({
              id: currentUser.id,
              name: currentUser.display_name || currentUser.name || 'Current User',
              display_name: currentUser.display_name || currentUser.name || 'Current User',
              avatar: currentUser.avatar || '👤',
              location: 'Traveler'
            });
          }
          setAllUsersList(fallbackUsers);
          setUsers(fallbackUsers.filter(u => u.id !== currentUser?.id));
        }
      } else {
        const fallbackUsers = [
          { id: 'demo_1', name: 'Sarah Johnson', display_name: 'Sarah Johnson', avatar: '👩', location: 'Bali' },
          { id: 'demo_2', name: 'Mike Chen', display_name: 'Mike Chen', avatar: '👨', location: 'Tokyo' },
          { id: 'demo_3', name: 'Emma Rodriguez', display_name: 'Emma Rodriguez', avatar: '👩', location: 'Paris' },
        ];
        if (currentUser?.id) {
          fallbackUsers.unshift({
            id: currentUser.id,
            name: currentUser.display_name || currentUser.name || 'Current User',
            display_name: currentUser.display_name || currentUser.name || 'Current User',
            avatar: currentUser.avatar || '👤',
            location: 'Traveler'
          });
        }
        setAllUsersList(fallbackUsers);
        setUsers(fallbackUsers.filter(u => u.id !== currentUser?.id));
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await AsyncStorage.removeItem('all_users');
    await loadAllData();
    setRefreshing(false);
  };

  const handleStartChat = async (user) => {
    try {
      if (!currentUser?.id) return;
      
      const chatId = `chat_${currentUser.id}_${user.id}`;
      const userName = user.display_name || user.name || user.full_name || user.user_metadata?.name || 'Traveler';
      const userAvatar = user.avatar || user.user_metadata?.avatar || '👤';
      
      router.push({
        pathname: '/app-pages/solo-chat',
        params: { 
          chatId: chatId,
          userName: userName, 
          userId: user.id, 
          avatar: userAvatar
        }
      });
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleOpenGroupChat = (group) => {
    try {
      const gid = encodeURIComponent(String(group.id));
      const gname = encodeURIComponent(String(group.name || ''));
      const gav = encodeURIComponent(String(group.avatar || ''));
      router.push(`/app-pages/group-chat?groupId=${gid}&groupName=${gname}&avatar=${gav}`);
    } catch (e) {
      console.error('Error navigating to group chat (encoding failed):', e);
      router.push({
        pathname: '/app-pages/group-chat',
        params: {
          groupId: String(group.id),
          groupName: String(group.name || ''),
          avatar: String(group.avatar || '')
        }
      });
    }
  };

  const handleOpenDirectChat = async (chat) => {
    try {
      const userName = userNamesMap[chat.userId] || chat.userName || 'Traveler';
      const userAvatar = userAvatarsMap[chat.userId] || chat.avatar || '👤';
      
      router.push({
        pathname: '/app-pages/solo-chat',
        params: { 
          chatId: chat.id, 
          userName: userName, 
          userId: chat.userId, 
          avatar: userAvatar
        }
      });
    } catch (error) {
      console.error('Error opening direct chat:', error);
    }
  };

  // ─── PICK GROUP AVATAR (Local Only) ─────────────
  const pickGroupAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload group image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Check file size (max 2MB)
        if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
          Alert.alert('Error', 'Image size should be less than 2MB');
          return;
        }

        // ✅ Save URI locally (not uploading to Supabase)
        setGroupAvatarUri(asset.uri);
        setGroupAvatar(asset.uri);
        console.log('✅ Group avatar selected (local only):', asset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // ─── REMOVE GROUP AVATAR ────────────────────────
  const removeGroupAvatar = () => {
    setGroupAvatar('👥');
    setGroupAvatarUri(null);
  };

  // ─── CREATE GROUP (Local Avatar Only) ────────────
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!currentUser?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    setIsCreatingGroup(true);
    console.log('Creating group:', newGroupName);
    
    try {
      // ✅ Use local avatar URI or emoji (no Supabase upload)
      const finalAvatar = groupAvatarUri || '👥';
      
      const groupId = `group_${Date.now()}`;
      const allMembers = [currentUser.id, ...selectedUsers];
      
      const newGroup = {
        id: groupId,
        name: newGroupName.trim(),
        avatar: finalAvatar, // Local URI or emoji
        lastMessage: 'Group created',
        timestamp: new Date().toLocaleTimeString(),
        unread: 0,
        memberCount: 1 + selectedUsers.length,
        members: allMembers,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
      };
      
      const updatedGroups = [newGroup, ...groups];
      setGroups(updatedGroups);
      await saveGroupsToStorage(updatedGroups);
      
      // Try to save to Supabase (without avatar)
      try {
        const { error } = await supabase
          .from('groups')
          .insert([{
            id: groupId,
            name: newGroup.name,
            avatar: '👥', // Default emoji for Supabase
            created_by: currentUser.id,
            created_at: new Date().toISOString()
          }]);
        
        if (error) {
          console.log('Supabase group save error:', error.message);
        } else {
          console.log('✅ Group saved to Supabase');
        }
        
        // Save members
        for (const memberId of allMembers) {
          await supabase
            .from('group_members')
            .insert([{
              group_id: groupId,
              user_id: memberId,
              joined_at: new Date().toISOString()
            }]);
        }
      } catch (supabaseError) {
        console.log('Supabase save skipped:', supabaseError);
      }
      
      setShowCreateGroup(false);
      setNewGroupName('');
      setSelectedUsers([]);
      setGroupAvatar('👥');
      setGroupAvatarUri(null);
      
      Alert.alert('Success', `Group "${newGroupName.trim()}" created successfully!`);
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // ─── RENDER CHAT ITEM ────────────────────────────
  const renderChatItem = ({ item }) => {
    const displayName = userNamesMap[item.userId] || item.userName || 'Traveler';
    const avatar = userAvatarsMap[item.userId] || item.avatar || '👤';
    
    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => handleOpenDirectChat(item)}>
        <View style={styles.avatarContainer}>
          {avatar && avatar.startsWith('file://') ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : avatar && avatar.startsWith('http') ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{avatar || '👤'}</Text>
          )}
          {item.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{displayName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage || 'No messages yet'}</Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.timestamp}>{item.timestamp || ''}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── RENDER GROUP ITEM ────────────────────────────
  const renderGroupItem = ({ item }) => {
    const isLocalImage = item.avatar && item.avatar.startsWith('file://');
    const isUrlImage = item.avatar && item.avatar.startsWith('http');
    
    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => handleOpenGroupChat(item)}>
        <View style={styles.avatarContainer}>
          {isLocalImage || isUrlImage ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{item.avatar || '👥'}</Text>
          )}
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage || 'No messages yet'}</Text>
          <Text style={styles.memberCount}>{item.memberCount || 0} members</Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.timestamp}>{item.timestamp || ''}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ─── RENDER USER ITEM ────────────────────────────
  const renderUserItem = ({ item }) => {
    const displayName = item.display_name || 
                        item.name || 
                        item.full_name || 
                        item.user_metadata?.display_name ||
                        item.user_metadata?.name ||
                        item.email?.split('@')[0] || 
                        'Traveler';
    const avatar = item.avatar || item.user_metadata?.avatar || '👤';
    
    return (
      <TouchableOpacity style={styles.userItem} onPress={() => handleStartChat(item)}>
        <View style={styles.userAvatarContainer}>
          {avatar && avatar.startsWith('file://') ? (
            <Image source={{ uri: avatar }} style={styles.userAvatarImage} />
          ) : avatar && avatar.startsWith('http') ? (
            <Image source={{ uri: avatar }} style={styles.userAvatarImage} />
          ) : (
            <Text style={styles.userAvatarText}>{avatar || '👤'}</Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userLocation}>{item.location || 'Traveler'}</Text>
        </View>
        <TouchableOpacity style={styles.messageButton} onPress={() => handleStartChat(item)}>
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const filteredUsers = users.filter(user => {
    const displayName = user.display_name || 
                        user.name || 
                        user.full_name || 
                        user.user_metadata?.display_name ||
                        user.user_metadata?.name ||
                        user.email?.split('@')[0] || 
                        'Traveler';
    return displayName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredChats = chats.filter(chat => {
    const displayName = userNamesMap[chat.userId] || chat.userName || 'Traveler';
    return displayName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredGroups = groups.filter(group => 
    group.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableUsersForGroup = allUsersList.filter(user => 
    user.id !== currentUser?.id && !selectedUsers.includes(user.id)
  );

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Travel Community</Text>
        <Text style={styles.headerSubtitle}>🔖 Where every journey begins with connection finding your tribe and sharing the adventure together. 🔖</Text>
      </View>

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

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]} 
          onPress={() => setActiveTab('chats')}
        >
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>
            Inbox ({chats.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]} 
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            Group Chat ({groups.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]} 
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Find Travelers ({users.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loadingUsers ? (
        <View style={styles.loadingUsersContainer}>
          <Text>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={
            activeTab === 'chats' ? filteredChats :
            activeTab === 'groups' ? filteredGroups : filteredUsers
          }
          keyExtractor={(item) => item.id || String(Math.random())}
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
              <Text style={styles.emptyText}>
                {activeTab === 'chats' ? 'No conversations yet. Start a chat from "Find Travelers" tab!' : 
                 activeTab === 'groups' ? 'No groups yet. Create one!' : 
                 'No users found. Pull down to refresh or sign up more users!'}
              </Text>
            </View>
          }
        />
      )}

      {activeTab === 'groups' && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowCreateGroup(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showCreateGroup}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCreateGroup(false);
          setSelectedUsers([]);
          setNewGroupName('');
          setGroupAvatar('👥');
          setGroupAvatarUri(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Group</Text>
              <TouchableOpacity onPress={() => {
                setShowCreateGroup(false);
                setSelectedUsers([]);
                setNewGroupName('');
                setGroupAvatar('👥');
                setGroupAvatarUri(null);
              }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* ─── GROUP AVATAR SELECTOR ────────── */}
            <Text style={styles.inputLabel}>Group Picture</Text>
            <TouchableOpacity style={styles.groupAvatarContainer} onPress={pickGroupAvatar}>
              {groupAvatarUri ? (
                <Image source={{ uri: groupAvatarUri }} style={styles.groupAvatarImage} />
              ) : (
                <View style={styles.groupAvatarPlaceholder}>
                  <Text style={styles.groupAvatarEmoji}>{groupAvatar || '👥'}</Text>
                  <Text style={styles.groupAvatarText}>Tap to add photo</Text>
                </View>
              )}
              {groupAvatarUri && (
                <TouchableOpacity style={styles.removeAvatarButton} onPress={removeGroupAvatar}>
                  <Text style={styles.removeAvatarText}>✕</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            
            <Text style={styles.inputLabel}>Group Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your group name"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            
            <Text style={styles.inputLabel}>Add Members ({availableUsersForGroup.length} available)</Text>
            <ScrollView style={styles.userSelectList} showsVerticalScrollIndicator={false}>
              {availableUsersForGroup.length > 0 ? (
                availableUsersForGroup.map(user => {
                  const displayName = user.display_name || 
                                      user.name || 
                                      user.full_name || 
                                      user.user_metadata?.display_name ||
                                      user.user_metadata?.name ||
                                      user.email?.split('@')[0] || 
                                      'Traveler';
                  const isSelected = selectedUsers.includes(user.id);
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[styles.userSelectItem, isSelected && styles.userSelectItemSelected]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        } else {
                          setSelectedUsers([...selectedUsers, user.id]);
                        }
                      }}
                    >
                      <Text style={styles.userSelectAvatar}>{user.avatar || '👤'}</Text>
                      <Text style={styles.userSelectName}>{displayName}</Text>
                      <Text style={[styles.userSelectAdd, isSelected && styles.userSelectAdded]}>
                        {isSelected ? '✓ Added' : '+ Add'}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.noUsersText}>No other users available. Pull down to refresh or sign up more users!</Text>
              )}
            </ScrollView>
            
            {selectedUsers.length > 0 && (
              <View style={styles.selectedUsersContainer}>
                <Text style={styles.selectedUsersTitle}>Selected ({selectedUsers.length}):</Text>
                <View style={styles.selectedUsersList}>
                  {selectedUsers.map(userId => {
                    const user = allUsersList.find(u => u.id === userId);
                    const displayName = user?.display_name || 
                                       user?.name || 
                                       user?.full_name || 
                                       user?.user_metadata?.display_name ||
                                       user?.user_metadata?.name ||
                                       user?.email?.split('@')[0] || 
                                       'Traveler';
                    return user ? (
                      <View key={userId} style={styles.selectedUserChip}>
                        <Text style={styles.selectedUserText}>{displayName}</Text>
                        <TouchableOpacity onPress={() => setSelectedUsers(selectedUsers.filter(id => id !== userId))}>
                          <Text style={styles.removeUserText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            )}
            
            <TouchableOpacity 
              style={[
                styles.createGroupButton, 
                (!newGroupName.trim() || selectedUsers.length === 0 || isCreatingGroup) && styles.createGroupButtonDisabled
              ]} 
              onPress={handleCreateGroup}
              disabled={!newGroupName.trim() || selectedUsers.length === 0 || isCreatingGroup}
            >
              <Text style={styles.createGroupButtonText}>
                {isCreatingGroup ? 'Creating...' : `Create Group (${selectedUsers.length + 1} members)`}
              </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingUsersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 70,
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
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
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
    paddingBottom: 100,
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
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  userAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 140,
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
    maxHeight: '85%',
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
    marginTop: 12,
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
  // ─── GROUP AVATAR STYLES ────────────────────────
  groupAvatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  groupAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  groupAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f2f5',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatarEmoji: {
    fontSize: 40,
  },
  groupAvatarText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  removeAvatarButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  removeAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userSelectList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  userSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderRadius: 8,
  },
  userSelectItemSelected: {
    backgroundColor: '#E8F1FF',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userSelectAdded: {
    color: '#34C759',
  },
  noUsersText: {
    padding: 16,
    textAlign: 'center',
    color: '#999',
  },
  selectedUsersContainer: {
    marginTop: 12,
  },
  selectedUsersTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
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
    marginBottom: 6,
  },
  selectedUserText: {
    fontSize: 13,
    color: '#007AFF',
    marginRight: 6,
  },
  removeUserText: {
    fontSize: 12,
    color: '#007AFF',
    paddingHorizontal: 2,
  },
  createGroupButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  createGroupButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createGroupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommunityPage;