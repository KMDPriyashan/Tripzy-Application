// app-pages/group-chat.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import {
  getCurrentUser,
  getGroupMembers,
  getGroupMessages,
  sendGroupMessage,
  subscribeToGroupMessages
} from '../../lib/supabase';

const GroupChatPage = () => {
  const router = useRouter();
  const { groupId, groupName, avatar } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef(null);
  let messageSubscription = null;

  useEffect(() => {
    initializeChat();
    
    // Keyboard listeners
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
        setCurrentUser({ id: supabaseUser.id, name: supabaseUser.user_metadata?.name || 'User', avatar: '👤' });
      } else {
        const localUser = await AsyncStorage.getItem('currentUser');
        if (localUser) {
          setCurrentUser(JSON.parse(localUser));
        } else {
          setCurrentUser({ id: 'user1', name: 'Pavan Perera', avatar: '👤' });
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setCurrentUser({ id: 'user1', name: 'Pavan Perera', avatar: '👤' });
    }
  };

  const loadGroupMembers = async () => {
    try {
      const members = await getGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group members:', error);
      // Fallback to local storage
      const groups = await AsyncStorage.getItem('communityGroups');
      if (groups) {
        const parsedGroups = JSON.parse(groups);
        const group = parsedGroups.find(g => g.id === groupId);
        if (group && group.members) {
          const users = await AsyncStorage.getItem('registeredUsers');
          let allUsers = [];
          if (users) {
            allUsers = JSON.parse(users);
          } else {
            allUsers = [
              { id: 'user1', name: 'Pavan Perera', avatar: '👤' },
              { id: 'user2', name: 'Sarah Johnson', avatar: '👩' },
              { id: 'user3', name: 'Mike Chen', avatar: '👨' },
              { id: 'user4', name: 'Emma Wilson', avatar: '👩‍🦰' },
            ];
          }
          
          const members = group.members.map(memberId => {
            const user = allUsers.find(u => u.id === memberId);
            return user || { id: memberId, name: memberId, avatar: '👤' };
          });
          setGroupMembers(members);
        }
      }
    }
  };

  const loadMessages = async () => {
    try {
      const groupMessages = await getGroupMessages(groupId);
      
      if (groupMessages && groupMessages.length > 0) {
        setMessages(groupMessages);
      } else {
        // Load from local storage as fallback
        const allMessages = await AsyncStorage.getItem(`group_${groupId}_messages`);
        if (allMessages) {
          setMessages(JSON.parse(allMessages));
        }
      }
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    messageSubscription = subscribeToGroupMessages(groupId, (newMessage) => {
      setMessages(prev => {
        const updated = [...prev, newMessage];
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        return updated;
      });
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentUser?.id) return;

    const messageText = inputText.trim();
    const newMessage = {
      id: Date.now().toString(),
      text: messageText,
      senderId: currentUser.id,
      senderName: currentUser.name || 'You',
      senderAvatar: currentUser.avatar || '👤',
      timestamp: new Date().toISOString(),
    };

    // Optimistically add to UI
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Send to Supabase
    const sentMessage = await sendGroupMessage(groupId, currentUser.id, messageText);
    
    if (!sentMessage) {
      // Save to local storage as fallback
      const updatedMessages = [...messages, newMessage];
      await AsyncStorage.setItem(`group_${groupId}_messages`, JSON.stringify(updatedMessages));
      
      // Update last message in group list
      const groups = await AsyncStorage.getItem('communityGroups');
      if (groups) {
        const parsedGroups = JSON.parse(groups);
        const updatedGroups = parsedGroups.map(group => 
          group.id === groupId 
            ? { ...group, lastMessage: messageText, timestamp: new Date().toLocaleTimeString() }
            : group
        );
        await AsyncStorage.setItem('communityGroups', JSON.stringify(updatedGroups));
      }
    }
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

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === (currentUser?.id || 'user1');
    
    return (
      <View style={[styles.messageRow, isCurrentUser ? styles.currentUserRow : styles.otherUserRow]}>
        {!isCurrentUser && (
          <View style={styles.messageAvatar}>
            <Text style={styles.messageAvatarText}>{item.senderAvatar || '👤'}</Text>
          </View>
        )}
        <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer]}>
          {!isCurrentUser && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
            <Text style={[styles.messageText, isCurrentUser ? styles.currentUserText : styles.otherUserText]}>
              {item.text}
            </Text>
            <Text style={[styles.messageTime, isCurrentUser ? styles.currentUserTime : styles.otherUserTime]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <Text style={styles.memberAvatar}>{item.avatar || '👤'}</Text>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberStatus}>{item.id === currentUser?.id ? 'You' : 'Member'}</Text>
      </View>
    </View>
  );

  if (loading) {
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerInfo} onPress={() => setShowMembersModal(true)}>
          <Text style={styles.headerAvatar}>{avatar || '👥'}</Text>
          <View>
            <Text style={styles.headerName}>{groupName || 'Group Chat'}</Text>
            <Text style={styles.headerStatus}>{groupMembers.length} members</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Messages - Dismiss keyboard on tap */}
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
        />
      </TouchableWithoutFeedback>

      {/* Input Area - Fixed with proper bottom padding */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.keyboardAvoidingView}
      >
        <View style={[
          styles.inputContainer,
          Platform.OS === 'android' && styles.androidInputContainer
        ]}>
          <TouchableOpacity style={styles.attachButton}>
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
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
        {/* Extra bottom padding for Android gesture navigation */}
        {Platform.OS === 'android' && !keyboardVisible && <View style={styles.bottomSpacer} />}
      </KeyboardAvoidingView>

      {/* Members Modal */}
      <Modal
        visible={showMembersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMembersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Group Members</Text>
              <TouchableOpacity onPress={() => setShowMembersModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={groupMembers}
              keyExtractor={(item) => item.id}
              renderItem={renderMemberItem}
              contentContainerStyle={styles.membersList}
            />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: Platform.OS === 'android' ? 50 : 0, // Extra top margin for Android status bar
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
    height: 34, // Extra space for gesture navigation bar on Android
    backgroundColor: '#ffffff',
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
  membersList: {
    paddingBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    fontSize: 40,
    marginRight: 12,
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
  },
});

export default GroupChatPage;