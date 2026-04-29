// app-pages/solo-chat.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
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
  getDirectMessages,
  getUserProfile,
  sendDirectMessage,
  subscribeToDirectMessages
} from '../../lib/supabase';

const SoloChatPage = () => {
  const router = useRouter();
  const { chatId, userName, userId, avatar } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const flatListRef = useRef(null);
  const messageSubscriptionRef = useRef(null);

  // Load current user first
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Once current user is loaded, load everything else
  useEffect(() => {
    if (currentUser?.id && userId && !isInitialized) {
      initializeChat();
    }
    
    // Cleanup subscription on unmount
    return () => {
      if (messageSubscriptionRef.current) {
        console.log('Cleaning up subscription...');
        messageSubscriptionRef.current.unsubscribe();
        messageSubscriptionRef.current = null;
      }
    };
  }, [currentUser, userId]);

  useEffect(() => {
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
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

  const initializeChat = async () => {
    await loadOtherUser();
    await loadMessages();
    await setupRealtimeSubscription();
    setIsInitialized(true);
    setLoading(false);
  };

  const loadOtherUser = async () => {
    try {
      const profile = await getUserProfile(userId);
      if (profile) {
        setOtherUser(profile);
      } else {
        setOtherUser({ id: userId, name: userName || 'User', avatar: avatar || '👤' });
      }
    } catch (error) {
      console.error('Error loading other user:', error);
      setOtherUser({ id: userId, name: userName || 'User', avatar: avatar || '👤' });
    }
  };

  const loadMessages = async () => {
    try {
      if (!currentUser?.id || !userId) {
        console.log('Cannot load messages: missing user data');
        return;
      }
      
      const storageKey = `messages_${currentUser.id}_${userId}`;
      console.log('🔑 Loading from key:', storageKey);
      
      const savedMessages = await AsyncStorage.getItem(storageKey);
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        console.log('✅ Found messages in storage:', parsedMessages.length);
        setMessages(parsedMessages);
      } else {
        console.log('No messages found in storage, checking Supabase...');
        
        const directMessages = await getDirectMessages(currentUser.id, userId);
        
        if (directMessages && directMessages.length > 0) {
          const formattedMessages = directMessages.map(msg => ({
            id: msg.id,
            text: msg.message,
            senderId: msg.sender_id,
            timestamp: msg.created_at
          }));
          console.log('✅ Found messages in Supabase:', formattedMessages.length);
          setMessages(formattedMessages);
          await AsyncStorage.setItem(storageKey, JSON.stringify(formattedMessages));
        } else {
          console.log('No messages found anywhere');
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const saveMessages = async (newMessages) => {
    try {
      if (!currentUser?.id || !userId) {
        return false;
      }
      
      const storageKey = `messages_${currentUser.id}_${userId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
      console.log('💾 Saved:', newMessages.length, 'messages');
      return true;
    } catch (error) {
      console.error('Error saving messages:', error);
      return false;
    }
  };

  const updateConversationLastMessage = async (lastMessage) => {
    try {
      if (!lastMessage || !currentUser?.id) return;
      
      const conversationsKey = `conversations_${currentUser.id}`;
      const existingConversations = await AsyncStorage.getItem(conversationsKey);
      let conversations = existingConversations ? JSON.parse(existingConversations) : [];
      
      const existingIndex = conversations.findIndex(conv => conv.userId === userId);
      
      const conversationData = {
        id: chatId || `conv_${userId}`,
        userId: userId,
        userName: otherUser?.name || userName,
        avatar: otherUser?.avatar || avatar,
        lastMessage: lastMessage.text,
        timestamp: new Date().toLocaleTimeString(),
        unread: existingIndex >= 0 ? (conversations[existingIndex].unread || 0) + 1 : 1,
        isOnline: false
      };
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversationData;
      } else {
        conversations.unshift(conversationData);
      }
      
      await AsyncStorage.setItem(conversationsKey, JSON.stringify(conversations));
      await AsyncStorage.setItem('directChats', JSON.stringify(conversations));
      console.log('📝 Updated conversation list');
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  // New function to update global conversations for community page
  const updateGlobalConversations = async (messageText) => {
    try {
      if (!currentUser?.id || !userId) return;
      
      const conversationsKey = `conversations_${currentUser.id}`;
      const existingConversations = await AsyncStorage.getItem(conversationsKey);
      let conversations = existingConversations ? JSON.parse(existingConversations) : [];
      
      const existingIndex = conversations.findIndex(conv => conv.userId === userId);
      
      if (existingIndex >= 0) {
        conversations[existingIndex].lastMessage = messageText;
        conversations[existingIndex].timestamp = new Date().toLocaleTimeString();
        conversations[existingIndex].unread = (conversations[existingIndex].unread || 0) + 1;
      } else {
        // Create new conversation if it doesn't exist
        const newConversation = {
          id: chatId || `conv_${userId}`,
          userId: userId,
          userName: otherUser?.name || userName,
          avatar: otherUser?.avatar || avatar,
          lastMessage: messageText,
          timestamp: new Date().toLocaleTimeString(),
          unread: 1,
          isOnline: false
        };
        conversations.unshift(newConversation);
      }
      
      await AsyncStorage.setItem(conversationsKey, JSON.stringify(conversations));
      await AsyncStorage.setItem('directChats', JSON.stringify(conversations));
      console.log('🌐 Updated global conversations for community page');
    } catch (error) {
      console.error('Error updating global conversations:', error);
    }
  };

  const setupRealtimeSubscription = async () => {
    if (!currentUser?.id) {
      console.log('Cannot setup subscription: no current user');
      return;
    }
    
    // Clean up existing subscription if any
    if (messageSubscriptionRef.current) {
      console.log('Cleaning up existing subscription...');
      messageSubscriptionRef.current.unsubscribe();
      messageSubscriptionRef.current = null;
    }
    
    console.log('Setting up new subscription for user:', currentUser.id);
    
    // Create new subscription
    const subscription = subscribeToDirectMessages(currentUser.id, async (newMessage) => {
      if (newMessage.senderId === userId) {
        console.log('📨 Received new message:', newMessage.text);
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages, newMessage];
          saveMessages(updatedMessages);
          // Update global conversations for received message
          updateGlobalConversations(newMessage.text);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          return updatedMessages;
        });
      }
    });
    
    messageSubscriptionRef.current = subscription;
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentUser?.id || !userId) return;

    const messageText = inputText.trim();
    const newMessage = {
      id: Date.now().toString(),
      text: messageText,
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
    };

    console.log('📤 Sending message:', messageText);
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText('');
    
    await saveMessages(updatedMessages);
    await updateConversationLastMessage(newMessage);
    // Update global conversations for sent message
    await updateGlobalConversations(messageText);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Send to Supabase (don't await)
    sendDirectMessage(currentUser.id, userId, messageText).catch(error => {
      console.error('Supabase error:', error);
    });
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
            <Text style={styles.messageAvatarText}>{otherUser?.avatar || avatar || '👤'}</Text>
          </View>
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
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerAvatar}>{otherUser?.avatar || avatar || '👤'}</Text>
          <View>
            <Text style={styles.headerName}>{otherUser?.name || userName || 'User'}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

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
        {Platform.OS === 'android' && !keyboardVisible && <View style={styles.bottomSpacer} />}
      </KeyboardAvoidingView>
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
    marginTop: Platform.OS === 'android' ? 40 : 0,
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
    color: '#4CD964',
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
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  currentUserRow: {
    justifyContent: 'flex-end',
  },
  otherUserRow: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageAvatarText: {
    fontSize: 32,
  },
  messageBubble: {
    maxWidth: '75%',
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
    height: 34,
    backgroundColor: '#ffffff',
  },
});

export default SoloChatPage;