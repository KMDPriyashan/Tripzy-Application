// app-pages/group-chat.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { getCurrentUser, getGroupMessages, sendGroupMessage, subscribeToGroupMessages, supabase } from '../../lib/supabase';

const GroupChatPage = () => {
  const router = useRouter();
  const { groupId, groupName, avatar, members } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [groupProfileImage, setGroupProfileImage] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const flatListRef = useRef(null);
  let messageSubscription = null;

  // ─── CHECK IF UUID ──────────────────────────────
  const isValidUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // ─── LOAD USER PROFILE IMAGE ────────────────────
  const loadUserProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('userProfileImage');
      if (savedImage) {
        setUserProfileImage(savedImage);
        console.log('✅ Loaded user profile image in group-chat');
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  useEffect(() => {
    initializeChat();
    loadGroupProfileImage();
    loadUserProfileImage();
    
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [groupId]);

  // ─── LOAD GROUP PROFILE IMAGE ──────────────────
  const loadGroupProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem(`group_profile_${groupId}`);
      if (savedImage) {
        setGroupProfileImage(savedImage);
        console.log('✅ Loaded group profile image from storage');
      }
    } catch (error) {
      console.error('Error loading group profile image:', error);
    }
  };

  const initializeChat = async () => {
    await loadCurrentUser();
    await loadGroupMembers();
    await loadMessages();
    setupRealtimeSubscription();
    setLoading(false);
  };

  const loadCurrentUser = async () => {
    try {
      const supabaseUser = await getCurrentUser();
      if (supabaseUser) {
        setCurrentUser({ 
          id: supabaseUser.id, 
          name: supabaseUser.user_metadata?.display_name || 
                 supabaseUser.user_metadata?.name || 
                 supabaseUser.email?.split('@')[0] || 
                 'User', 
          avatar: '👤' 
        });
      } else {
        const localUser = await AsyncStorage.getItem('currentUser');
        if (localUser) {
          setCurrentUser(JSON.parse(localUser));
        } else {
          setCurrentUser({ id: 'demo_user_1', name: 'Demo User', avatar: '👤' });
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setCurrentUser({ id: 'demo_user_1', name: 'Demo User', avatar: '👤' });
    }
  };

  const loadGroupMembers = async () => {
    try {
      if (members) {
        try {
          const parsedMembers = JSON.parse(members);
          if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
            const memberDetails = await Promise.all(parsedMembers.map(async (memberId) => {
              const { data, error } = await supabase
                .from('users')
                .select('id, display_name, name, avatar')
                .eq('id', memberId)
                .single();
              
              if (!error && data) {
                return {
                  id: data.id,
                  name: data.display_name || data.name || 'User',
                  avatar: data.avatar || '👤'
                };
              }
              
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('user_id, display_name, name, avatar')
                .eq('user_id', memberId)
                .single();
              
              if (!profileError && profileData) {
                return {
                  id: profileData.user_id,
                  name: profileData.display_name || profileData.name || 'User',
                  avatar: profileData.avatar || '👤'
                };
              }
              
              return { id: memberId, name: 'User', avatar: '👤' };
            }));
            
            setGroupMembers(memberDetails);
            return;
          }
        } catch (e) {
          console.log('Error parsing members:', e);
        }
      }

      if (isValidUUID(groupId)) {
        const { data, error } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', groupId);
        
        if (!error && data && data.length > 0) {
          const memberIds = data.map(m => m.user_id);
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, display_name, name, avatar')
            .in('id', memberIds);
          
          if (!usersError && users) {
            setGroupMembers(users.map(u => ({
              id: u.id,
              name: u.display_name || u.name || 'User',
              avatar: u.avatar || '👤'
            })));
            return;
          }
        }
      }

      const savedMembers = await AsyncStorage.getItem(`group_members_${groupId}`);
      if (savedMembers) {
        const parsedMembers = JSON.parse(savedMembers);
        if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
          const allUsers = await AsyncStorage.getItem('all_users');
          let usersList = [];
          if (allUsers) {
            usersList = JSON.parse(allUsers);
          }
          
          const memberDetails = parsedMembers.map(memberId => {
            const user = usersList.find(u => u.id === memberId);
            return user || { id: memberId, name: 'User', avatar: '👤' };
          });
          
          setGroupMembers(memberDetails);
          return;
        }
      }

      setGroupMembers([]);
      
    } catch (error) {
      console.error('Error loading group members:', error);
      setGroupMembers([]);
    }
  };

  const loadMessages = async () => {
    try {
      let groupMessages = [];

      if (isValidUUID(groupId)) {
        try {
          const supabaseMessages = await getGroupMessages(groupId);
          if (supabaseMessages && supabaseMessages.length > 0) {
            groupMessages = supabaseMessages;
          }
        } catch (supabaseError) {
          console.log('Supabase message fetch error:', supabaseError);
        }
      }

      if (groupMessages.length === 0) {
        const messagesKey = `group_messages_${groupId}`;
        const savedMessages = await AsyncStorage.getItem(messagesKey);
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            groupMessages = parsedMessages;
          }
        }
      }

      const formattedMessages = groupMessages.map(msg => ({
        id: msg.id,
        text: msg.content || msg.text || msg.message,
        senderId: msg.user_id || msg.senderId || msg.sender_id,
        senderName: msg.user_name || msg.senderName || 'User',
        senderAvatar: msg.user_avatar || msg.senderAvatar || '👤',
        timestamp: msg.created_at || msg.timestamp || new Date().toISOString(),
        media: msg.media || null,
        mediaType: msg.mediaType || msg.media_type || null
      }));

      setMessages(formattedMessages);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
      
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!isValidUUID(groupId)) {
      console.log('⚠️ Invalid UUID, skipping realtime subscription');
      return;
    }

    try {
      messageSubscription = subscribeToGroupMessages(groupId, (newMessage) => {
        const formattedMessage = {
          id: newMessage.id,
          text: newMessage.content || newMessage.text || newMessage.message,
          senderId: newMessage.user_id || newMessage.senderId,
          senderName: newMessage.user_name || newMessage.senderName || 'User',
          senderAvatar: newMessage.user_avatar || newMessage.senderAvatar || '👤',
          timestamp: newMessage.created_at || newMessage.timestamp || new Date().toISOString(),
          media: newMessage.media || null,
          mediaType: newMessage.mediaType || newMessage.media_type || null
        };
        
        setMessages(prev => {
          const updated = [...prev, formattedMessage];
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          return updated;
        });
      });
    } catch (error) {
      console.log('Realtime subscription error:', error);
    }
  };

  // ─── PICK GROUP PROFILE IMAGE ──────────────────
  const pickGroupProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions.');
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
        
        if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
          Alert.alert('Error', 'Image size should be less than 2MB');
          return;
        }

        await AsyncStorage.setItem(`group_profile_${groupId}`, asset.uri);
        setGroupProfileImage(asset.uri);
        
        const groupsKey = `groups_${currentUser?.id || 'default'}`;
        const savedGroups = await AsyncStorage.getItem(groupsKey);
        if (savedGroups) {
          const parsedGroups = JSON.parse(savedGroups);
          const updatedGroups = parsedGroups.map(group => 
            group.id === groupId 
              ? { ...group, avatar: asset.uri }
              : group
          );
          await AsyncStorage.setItem(groupsKey, JSON.stringify(updatedGroups));
        }
        
        setShowOptionsModal(false);
        Alert.alert('Success', 'Group profile picture updated!');
        console.log('✅ Group profile image saved:', asset.uri);
      }
    } catch (error) {
      console.error('Error picking profile image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  // ─── PICK MEDIA (Photo/Video) ──────────────────
  const pickMedia = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library permissions to share files.');
        return;
      }

      const options = {
        mediaTypes: type === 'photo' 
          ? ImagePicker.MediaTypeOptions.Images 
          : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: type === 'photo',
        quality: 0.7,
        videoMaxDuration: 60,
      };

      const result = await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
          Alert.alert('Error', 'File size should be less than 10MB');
          return;
        }

        setSelectedMedia(asset.uri);
        setMediaType(type);
        
        await sendMediaMessage(asset.uri, type);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };

  // ─── SEND MEDIA MESSAGE ─────────────────────────
  const sendMediaMessage = async (mediaUri, type) => {
    if (!currentUser?.id) return;

    setIsSending(true);
    
    const newMessage = {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: type === 'photo' ? '📷 Photo shared' : '🎥 Video shared',
      senderId: currentUser.id,
      senderName: currentUser.name || 'You',
      senderAvatar: currentUser.avatar || '👤',
      timestamp: new Date().toISOString(),
      media: mediaUri,
      mediaType: type
    };

    setMessages(prev => [...prev, newMessage]);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    await saveMessageToLocalStorage(newMessage);

    if (isValidUUID(groupId)) {
      try {
        const messageData = {
          content: newMessage.text,
          user_id: currentUser.id,
          group_id: groupId,
          media: mediaUri,
          media_type: type,
          created_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('group_messages')
          .insert([messageData]);
        
        if (error) {
          console.log('Supabase save error:', error);
        }
      } catch (error) {
        console.log('Supabase save error:', error);
      }
    }
    
    setSelectedMedia(null);
    setMediaType(null);
    setIsSending(false);
  };

  // ─── SEND TEXT MESSAGE ──────────────────────────
  const sendMessage = async () => {
    if (!inputText.trim() || !currentUser?.id || isSending) return;

    const messageText = inputText.trim();
    setIsSending(true);
    
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: messageText,
      senderId: currentUser.id,
      senderName: currentUser.name || 'You',
      senderAvatar: currentUser.avatar || '👤',
      timestamp: new Date().toISOString(),
      media: null,
      mediaType: null
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    await saveMessageToLocalStorage(newMessage);

    if (isValidUUID(groupId)) {
      const sentMessage = await sendGroupMessage(groupId, currentUser.id, messageText);
      if (!sentMessage) {
        console.log('Supabase send failed, saved locally');
      }
    }
    
    setIsSending(false);
  };

  // ─── SAVE MESSAGE TO LOCAL STORAGE ──────────────
  const saveMessageToLocalStorage = async (message) => {
    try {
      const messagesKey = `group_messages_${groupId}`;
      const savedMessages = await AsyncStorage.getItem(messagesKey);
      let allMessages = savedMessages ? JSON.parse(savedMessages) : [];
      
      allMessages.push({
        id: message.id,
        text: message.text,
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        timestamp: message.timestamp,
        media: message.media || null,
        mediaType: message.mediaType || null
      });
      
      await AsyncStorage.setItem(messagesKey, JSON.stringify(allMessages));
      console.log('💾 Message saved to local storage');
      
      const groupsKey = `groups_${currentUser?.id || 'default'}`;
      const savedGroups = await AsyncStorage.getItem(groupsKey);
      if (savedGroups) {
        const parsedGroups = JSON.parse(savedGroups);
        const updatedGroups = parsedGroups.map(group => 
          group.id === groupId 
            ? { ...group, lastMessage: message.text, timestamp: new Date().toLocaleTimeString() }
            : group
        );
        await AsyncStorage.setItem(groupsKey, JSON.stringify(updatedGroups));
      }
    } catch (error) {
      console.error('Error saving message to local storage:', error);
    }
  };

  // ─── SHARE GROUP ─────────────────────────────────
  const handleShareGroup = async () => {
    try {
      const message = `🌟 Join our group "${groupName || 'Group Chat'}" on Tripzy!\n\n👥 ${groupMembers.length} members\n💬 Active conversations\n\nCome join us! 🚀`;
      
      await Share.share({
        message: message,
        title: `Tripzy Group - ${groupName || 'Group Chat'}`
      });
      setShowOptionsModal(false);
    } catch (error) {
      console.error('Error sharing group:', error);
    }
  };

  // ─── LEAVE GROUP ─────────────────────────────────
  const handleLeaveGroup = async () => {
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${groupName || 'Group Chat'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (isValidUUID(groupId)) {
                await supabase
                  .from('group_members')
                  .delete()
                  .eq('group_id', groupId)
                  .eq('user_id', currentUser?.id);
              }
              
              const groupsKey = `groups_${currentUser?.id || 'default'}`;
              const savedGroups = await AsyncStorage.getItem(groupsKey);
              if (savedGroups) {
                const parsedGroups = JSON.parse(savedGroups);
                const updatedGroups = parsedGroups.filter(g => g.id !== groupId);
                await AsyncStorage.setItem(groupsKey, JSON.stringify(updatedGroups));
              }
              
              const messagesKey = `group_messages_${groupId}`;
              await AsyncStorage.removeItem(messagesKey);
              
              setShowOptionsModal(false);
              Alert.alert('Left Group', 'You have left the group.');
              router.back();
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert('Error', 'Failed to leave group.');
            }
          }
        }
      ]
    );
  };

  // ─── LOGOUT ──────────────────────────────────────
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              await AsyncStorage.clear();
              setShowOptionsModal(false);
              router.replace('/');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout.');
            }
          }
        }
      ]
    );
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // ─── CHECK IF AVATAR IS IMAGE URL ──────────────
  const isImageAvatar = (avatarStr) => {
    if (!avatarStr) return false;
    return avatarStr.startsWith('http') || avatarStr.startsWith('file://');
  };

  // ─── GET MEMBER AVATAR ──────────────────────────
  const getMemberAvatar = (member) => {
    // If this is the current user, use profile image if available
    if (member.id === currentUser?.id && userProfileImage) {
      return userProfileImage;
    }
    return member.avatar || '👤';
  };

  // ─── RENDER MESSAGE ─────────────────────────────
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === (currentUser?.id);
    const isMedia = item.media && item.mediaType;
    const senderAvatar = isCurrentUser && userProfileImage ? userProfileImage : (item.senderAvatar || '👤');
    
    return (
      <View style={[styles.messageRow, isCurrentUser ? styles.currentUserRow : styles.otherUserRow]}>
        {!isCurrentUser && (
          <View style={styles.messageAvatar}>
            {senderAvatar && senderAvatar.startsWith('file://') ? (
              <Image source={{ uri: senderAvatar }} style={styles.messageAvatarImage} />
            ) : senderAvatar && senderAvatar.startsWith('http') ? (
              <Image source={{ uri: senderAvatar }} style={styles.messageAvatarImage} />
            ) : (
              <Text style={styles.messageAvatarText}>{senderAvatar || '👤'}</Text>
            )}
          </View>
        )}
        <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer]}>
          {!isCurrentUser && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
            {isMedia ? (
              <View>
                {item.mediaType === 'photo' ? (
                  <Image 
                    source={{ uri: item.media }} 
                    style={styles.mediaImage} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Text style={styles.videoIcon}>🎥</Text>
                    <Text style={styles.videoText}>Video</Text>
                  </View>
                )}
                <Text style={[styles.messageText, isCurrentUser ? styles.currentUserText : styles.otherUserText]}>
                  {item.text}
                </Text>
              </View>
            ) : (
              <Text style={[styles.messageText, isCurrentUser ? styles.currentUserText : styles.otherUserText]}>
                {item.text}
              </Text>
            )}
            <Text style={[styles.messageTime, isCurrentUser ? styles.currentUserTime : styles.otherUserTime]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // ─── RENDER MEMBER ITEM (UPDATED) ──────────────
  const renderMemberItem = ({ item }) => {
    const avatar = getMemberAvatar(item);
    const isCurrentUserMember = item.id === currentUser?.id;
    
    return (
      <TouchableOpacity 
        style={styles.memberItem}
        onPress={() => {
          console.log('👤 Member clicked:', item.name);
          setShowMembersModal(false);
          router.push({
            pathname: '/app-pages/tour-guide-profile',
            params: { userId: item.id }
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.memberAvatarContainer}>
          {avatar && avatar.startsWith('file://') ? (
            <Image source={{ uri: avatar }} style={styles.memberAvatarImage} />
          ) : avatar && avatar.startsWith('http') ? (
            <Image source={{ uri: avatar }} style={styles.memberAvatarImage} />
          ) : (
            <Text style={styles.memberAvatar}>{avatar || '👤'}</Text>
          )}
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberStatus}>
            {isCurrentUserMember ? '👑 You' : 'Member'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.memberChatButton}
          onPress={() => {
            setShowMembersModal(false);
            router.push({
              pathname: '/app-pages/solo-chat',
              params: { 
                userId: item.id,
                userName: item.name,
                avatar: item.avatar || '👤'
              }
            });
          }}
        >
          <Text style={styles.memberChatButtonText}>💬</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── HEADER ─────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        {/* ─── GROUP NAME TAP → MEMBERS ────────── */}
        <TouchableOpacity 
          style={styles.headerInfo} 
          onPress={() => {
            console.log('👥 Group name tapped, opening members modal...');
            setShowMembersModal(true);
          }}
          activeOpacity={0.7}
        >
          {groupProfileImage ? (
            <Image source={{ uri: groupProfileImage }} style={styles.headerAvatarImage} />
          ) : isImageAvatar(avatar) ? (
            <Image source={{ uri: avatar }} style={styles.headerAvatarImage} />
          ) : (
            <Text style={styles.headerAvatar}>{avatar || '👥'}</Text>
          )}
          <View>
            <Text style={styles.headerName}>{groupName || 'Group Chat'}</Text>
            <Text style={styles.headerStatus}>{groupMembers.length} members</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowOptionsModal(true)}>
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* ─── MESSAGES ──────────────────────────────── */}
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubText}>Start the conversation! 💬</Text>
            </View>
          }
        />
      </TouchableWithoutFeedback>

      {/* ─── INPUT AREA ────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.keyboardAvoidingView}
      >
        <View style={[
          styles.inputContainer,
          Platform.OS === 'android' && styles.androidInputContainer
        ]}>
          <TouchableOpacity 
            style={styles.attachButton} 
            onPress={() => {
              Alert.alert(
                'Share Media',
                'Choose what to share',
                [
                  { text: '📷 Photo', onPress: () => pickMedia('photo') },
                  { text: '🎥 Video', onPress: () => pickMedia('video') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={styles.attachButtonText}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            editable={!isSending}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || isSending}
          >
            <Text style={styles.sendButtonText}>
              {isSending ? '⏳' : '➤'}
            </Text>
          </TouchableOpacity>
        </View>
        {Platform.OS === 'android' && !keyboardVisible && <View style={styles.bottomSpacer} />}
      </KeyboardAvoidingView>

      {/* ─── OPTIONS MODAL ─────────────────────────── */}
      <Modal
        visible={showOptionsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.optionsOverlay} 
          activeOpacity={1} 
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsContainer}>
            <View style={styles.optionsHeader}>
              <Text style={styles.optionsTitle}>Options</Text>
              <TouchableOpacity onPress={() => setShowOptionsModal(false)}>
                <Text style={styles.optionsClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.optionItem} onPress={pickGroupProfileImage}>
              <Text style={styles.optionIcon}>🖼️</Text>
              <View>
                <Text style={styles.optionTitle}>Change Group Photo</Text>
                <Text style={styles.optionDescription}>Update group profile picture</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={() => {
              setShowOptionsModal(false);
              setShowMembersModal(true);
            }}>
              <Text style={styles.optionIcon}>👥</Text>
              <View>
                <Text style={styles.optionTitle}>View Members</Text>
                <Text style={styles.optionDescription}>See all group members</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={handleShareGroup}>
              <Text style={styles.optionIcon}>📤</Text>
              <View>
                <Text style={styles.optionTitle}>Share Group</Text>
                <Text style={styles.optionDescription}>Invite others to join this group</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.optionItem, styles.optionItemDanger]} onPress={handleLeaveGroup}>
              <Text style={styles.optionIcon}>🚪</Text>
              <View>
                <Text style={[styles.optionTitle, styles.optionTitleDanger]}>Leave Group</Text>
                <Text style={styles.optionDescription}>Exit this group</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.optionItem, styles.optionItemDanger]} onPress={handleLogout}>
              <Text style={styles.optionIcon}>🔓</Text>
              <View>
                <Text style={[styles.optionTitle, styles.optionTitleDanger]}>Logout</Text>
                <Text style={styles.optionDescription}>Sign out from your account</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ─── MEMBERS MODAL ─────────────────────────── */}
      <Modal
        visible={showMembersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMembersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                👥 Group Members ({groupMembers.length})
              </Text>
              <TouchableOpacity onPress={() => setShowMembersModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {groupMembers.length > 0 ? (
              <FlatList
                data={groupMembers}
                keyExtractor={(item) => item.id}
                renderItem={renderMemberItem}
                contentContainerStyle={styles.membersList}
              />
            ) : (
              <View style={styles.emptyMembersContainer}>
                <Text style={styles.emptyMembersText}>No members found</Text>
              </View>
            )}
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: Platform.OS === 'android' ? 50 : 0,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  headerAvatar: {
    fontSize: 36,
    marginRight: 12,
  },
  headerAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerStatus: {
    fontSize: 12,
    color: '#666',
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    fontSize: 20,
    color: '#007AFF',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 16,
  },
  currentUserRow: {
    alignItems: 'flex-end',
  },
  otherUserRow: {
    alignItems: 'flex-start',
  },
  messageContainer: {
    maxWidth: '80%',
  },
  currentUserContainer: {
    alignItems: 'flex-end',
  },
  otherUserContainer: {
    alignItems: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
    marginBottom: 4,
  },
  messageAvatarText: {
    fontSize: 28,
  },
  messageAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#E8E9ED',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#ffffff',
  },
  otherUserText: {
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  currentUserTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherUserTime: {
    color: '#999',
  },
  // ─── MEDIA STYLES ───────────────────────────────
  mediaImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 6,
  },
  videoPlaceholder: {
    width: 200,
    height: 150,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  videoIcon: {
    fontSize: 48,
  },
  videoText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  keyboardAvoidingView: {
    backgroundColor: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  androidInputContainer: {
    paddingBottom: 62,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachButtonText: {
    fontSize: 20,
    color: '#007AFF',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#ffffff',
  },
  bottomSpacer: {
    height: 34,
    backgroundColor: '#ffffff',
  },
  // ─── OPTIONS MODAL ──────────────────────────────
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '85%',
    maxWidth: 350,
    overflow: 'hidden',
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  optionsClose: {
    fontSize: 20,
    color: '#999',
    padding: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  optionItemDanger: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  optionTitleDanger: {
    color: '#FF3B30',
  },
  optionDescription: {
    fontSize: 12,
    color: '#999',
  },
  // ─── MEMBERS MODAL ──────────────────────────────
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
  membersList: {
    paddingBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 4,
  },
  memberAvatarContainer: {
    marginRight: 12,
  },
  memberAvatar: {
    fontSize: 40,
  },
  memberAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  memberStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  memberChatButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  memberChatButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptySubText: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  emptyMembersContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyMembersText: {
    fontSize: 16,
    color: '#999',
  },
});

export default GroupChatPage;