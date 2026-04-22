// app-pages/solo-chat.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  const flatListRef = useRef(null);
  let messageSubscription = null;

  useEffect(() => {
    initializeChat();
    
    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
    };
  }, [chatId, userId]);

  const initializeChat = async () => {
    await loadCurrentUser();
    await loadOtherUser();
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
      if (!currentUser?.id || !userId) return;
      
      const directMessages = await getDirectMessages(currentUser.id, userId);
      
      if (directMessages && directMessages.length > 0) {
        const formattedMessages = directMessages.map(msg => ({
          id: msg.id,
          text: msg.message,
          senderId: msg.sender_id,
          timestamp: msg.created_at
        }));
        setMessages(formattedMessages);
      } else {
        // Load from local storage as fallback
        const allMessages = await AsyncStorage.getItem(`chat_${chatId}_messages`);
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
    if (!currentUser?.id) return;
    
    messageSubscription = subscribeToDirectMessages(currentUser.id, (newMessage) => {
      if (newMessage.senderId === userId) {
        setMessages(prev => {
          const updated = [...prev, newMessage];
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          return updated;
        });
      }
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentUser?.id || !userId) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add to UI
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Send to Supabase
    const sentMessage = await sendDirectMessage(currentUser.id, userId, inputText.trim());
    
    if (!sentMessage) {
      // Save to local storage as fallback
      const updatedMessages = [...messages, newMessage];
      await AsyncStorage.setItem(`chat_${chatId}_messages`, JSON.stringify(updatedMessages));
      
      // Update last message in chat list
      const chats = await AsyncStorage.getItem('directChats');
      if (chats) {
        const parsedChats = JSON.parse(chats);
        const updatedChats = parsedChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, lastMessage: inputText.trim(), timestamp: new Date().toLocaleTimeString() }
            : chat
        );
        await AsyncStorage.setItem('directChats', JSON.stringify(updatedChats));
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

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
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
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
});

export default SoloChatPage;