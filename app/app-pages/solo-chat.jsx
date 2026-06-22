// app-pages/solo-chat.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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
  View,
} from "react-native";
import {
  getCurrentUser,
  getDirectMessages,
  getUserProfile,
  sendDirectMessage,
  subscribeToDirectMessages,
  supabase,
} from "../../lib/supabase";

const SoloChatPage = () => {
  const router = useRouter();
  const { chatId, userName, userId, avatar } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const flatListRef = useRef(null);
  const messageSubscriptionRef = useRef(null);

  // Load current user first
  useEffect(() => {
    loadCurrentUser();
    loadUserProfileImage();
  }, []);

  // ─── LOAD USER PROFILE IMAGE ──────────────────
  const loadUserProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem("userProfileImage");
      if (savedImage) {
        setUserProfileImage(savedImage);
        console.log("✅ Loaded user profile image in solo-chat");
      }
    } catch (error) {
      console.error("Error loading profile image:", error);
    }
  };

  // Once current user is loaded, load everything else
  useEffect(() => {
    if (currentUser?.id && userId && !isInitialized) {
      initializeChat();
    }

    return () => {
      if (messageSubscriptionRef.current) {
        console.log("Cleaning up subscription...");
        messageSubscriptionRef.current.unsubscribe();
        messageSubscriptionRef.current = null;
      }
    };
  }, [currentUser, userId]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const loadCurrentUser = async () => {
    try {
      const supabaseUser = await getCurrentUser();
      if (supabaseUser) {
        setCurrentUser({
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || "User",
          avatar: "👤",
        });
      } else {
        const localUser = await AsyncStorage.getItem("currentUser");
        if (localUser) {
          setCurrentUser(JSON.parse(localUser));
        } else {
          setCurrentUser({ id: "user1", name: "Pavan Perera", avatar: "👤" });
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setCurrentUser({ id: "user1", name: "Pavan Perera", avatar: "👤" });
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
        setOtherUser({
          id: userId,
          name: userName || "User",
          avatar: avatar || "👤",
        });
      }
    } catch (error) {
      console.error("Error loading other user:", error);
      setOtherUser({
        id: userId,
        name: userName || "User",
        avatar: avatar || "👤",
      });
    }
  };

  const loadMessages = async () => {
    try {
      if (!currentUser?.id || !userId) {
        console.log("Cannot load messages: missing user data");
        return;
      }

      const storageKey = `messages_${currentUser.id}_${userId}`;
      console.log("🔑 Loading from key:", storageKey);

      const savedMessages = await AsyncStorage.getItem(storageKey);

      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        console.log("✅ Found messages in storage:", parsedMessages.length);
        setMessages(parsedMessages);
      } else {
        console.log("No messages found in storage, checking Supabase...");

        const directMessages = await getDirectMessages(currentUser.id, userId);

        if (directMessages && directMessages.length > 0) {
          const formattedMessages = directMessages.map((msg) => ({
            id: msg.id,
            text: msg.message,
            senderId: msg.sender_id,
            timestamp: msg.created_at,
            media: msg.media || null,
            mediaType: msg.media_type || null,
          }));
          console.log(
            "✅ Found messages in Supabase:",
            formattedMessages.length,
          );
          setMessages(formattedMessages);
          await AsyncStorage.setItem(
            storageKey,
            JSON.stringify(formattedMessages),
          );
        } else {
          console.log("No messages found anywhere");
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
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
      console.log("💾 Saved:", newMessages.length, "messages");
      return true;
    } catch (error) {
      console.error("Error saving messages:", error);
      return false;
    }
  };

  const updateConversationLastMessage = async (lastMessage) => {
    try {
      if (!lastMessage || !currentUser?.id) return;

      const conversationsKey = `conversations_${currentUser.id}`;
      const existingConversations =
        await AsyncStorage.getItem(conversationsKey);
      let conversations = existingConversations
        ? JSON.parse(existingConversations)
        : [];

      const existingIndex = conversations.findIndex(
        (conv) => conv.userId === userId,
      );

      const conversationData = {
        id: chatId || `conv_${userId}`,
        userId: userId,
        userName: otherUser?.name || userName,
        avatar: otherUser?.avatar || avatar,
        lastMessage: lastMessage.text,
        timestamp: new Date().toLocaleTimeString(),
        unread:
          existingIndex >= 0
            ? (conversations[existingIndex].unread || 0) + 1
            : 1,
        isOnline: false,
      };

      if (existingIndex >= 0) {
        conversations[existingIndex] = conversationData;
      } else {
        conversations.unshift(conversationData);
      }

      await AsyncStorage.setItem(
        conversationsKey,
        JSON.stringify(conversations),
      );
      await AsyncStorage.setItem("directChats", JSON.stringify(conversations));
      console.log("📝 Updated conversation list");
    } catch (error) {
      console.error("Error updating conversation:", error);
    }
  };

  const updateGlobalConversations = async (messageText) => {
    try {
      if (!currentUser?.id || !userId) return;

      const conversationsKey = `conversations_${currentUser.id}`;
      const existingConversations =
        await AsyncStorage.getItem(conversationsKey);
      let conversations = existingConversations
        ? JSON.parse(existingConversations)
        : [];

      const existingIndex = conversations.findIndex(
        (conv) => conv.userId === userId,
      );

      if (existingIndex >= 0) {
        conversations[existingIndex].lastMessage = messageText;
        conversations[existingIndex].timestamp =
          new Date().toLocaleTimeString();
        conversations[existingIndex].unread =
          (conversations[existingIndex].unread || 0) + 1;
      } else {
        const newConversation = {
          id: chatId || `conv_${userId}`,
          userId: userId,
          userName: otherUser?.name || userName,
          avatar: otherUser?.avatar || avatar,
          lastMessage: messageText,
          timestamp: new Date().toLocaleTimeString(),
          unread: 1,
          isOnline: false,
        };
        conversations.unshift(newConversation);
      }

      await AsyncStorage.setItem(
        conversationsKey,
        JSON.stringify(conversations),
      );
      await AsyncStorage.setItem("directChats", JSON.stringify(conversations));
      console.log("🌐 Updated global conversations for community page");
    } catch (error) {
      console.error("Error updating global conversations:", error);
    }
  };

  const setupRealtimeSubscription = async () => {
    if (!currentUser?.id) {
      console.log("Cannot setup subscription: no current user");
      return;
    }

    if (messageSubscriptionRef.current) {
      console.log("Cleaning up existing subscription...");
      messageSubscriptionRef.current.unsubscribe();
      messageSubscriptionRef.current = null;
    }

    console.log("Setting up new subscription for user:", currentUser.id);

    const subscription = subscribeToDirectMessages(
      currentUser.id,
      async (newMessage) => {
        if (newMessage.senderId === userId) {
          console.log("📨 Received new message:", newMessage.text);
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, newMessage];
            saveMessages(updatedMessages);
            updateGlobalConversations(newMessage.text);
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
            return updatedMessages;
          });
        }
      },
    );

    messageSubscriptionRef.current = subscription;
  };

  // ─── PICK MEDIA (Photo/Video) ──────────────────
  const pickMedia = async (type) => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant media library permissions to share files.",
        );
        return;
      }

      const options = {
        mediaTypes:
          type === "photo"
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: type === "photo",
        quality: 0.7,
        videoMaxDuration: 60,
      };

      const result = await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
          Alert.alert("Error", "File size should be less than 10MB");
          return;
        }

        await sendMediaMessage(asset.uri, type);
      }
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert("Error", "Failed to pick media. Please try again.");
    }
  };

  // ─── SEND MEDIA MESSAGE ─────────────────────────
  const sendMediaMessage = async (mediaUri, type) => {
    if (!currentUser?.id || !userId) return;

    setIsSending(true);

    const messageText =
      type === "photo" ? "📷 Photo shared" : "🎥 Video shared";
    const newMessage = {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: messageText,
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
      media: mediaUri,
      mediaType: type,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    await saveMessages(updatedMessages);
    await updateConversationLastMessage(newMessage);
    await updateGlobalConversations(messageText);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Send to Supabase with media
    try {
      const messageData = {
        sender_id: currentUser.id,
        receiver_id: userId,
        message: messageText,
        media: mediaUri,
        media_type: type,
        created_at: new Date().toISOString(),
        is_read: false,
      };

      await supabase.from("direct_messages").insert([messageData]);
      console.log("✅ Media message sent to Supabase");
    } catch (error) {
      console.error("Supabase error:", error);
    }

    setIsSending(false);
  };

  // ─── SEND TEXT MESSAGE ──────────────────────────
  const sendMessage = async () => {
    if (!inputText.trim() || !currentUser?.id || !userId || isSending) return;

    const messageText = inputText.trim();
    const newMessage = {
      id: Date.now().toString(),
      text: messageText,
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
      media: null,
      mediaType: null,
    };

    console.log("📤 Sending message:", messageText);

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText("");

    await saveMessages(updatedMessages);
    await updateConversationLastMessage(newMessage);
    await updateGlobalConversations(messageText);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    sendDirectMessage(currentUser.id, userId, messageText).catch((error) => {
      console.error("Supabase error:", error);
    });
  };

  // ─── SHARE CHAT ──────────────────────────────────
  const handleShareChat = async () => {
    try {
      const message = `💬 Chat with ${otherUser?.name || userName || "User"} on Tripzy!\n\nStart chatting and share your travel experiences! ✈️🌍`;

      await Share.share({
        message: message,
        title: `Tripzy Chat - ${otherUser?.name || userName || "User"}`,
      });
      setShowOptionsModal(false);
    } catch (error) {
      console.error("Error sharing chat:", error);
    }
  };

  // ─── CLEAR CHAT ──────────────────────────────────
  const handleClearChat = async () => {
    Alert.alert("Clear Chat", "Are you sure you want to clear all messages?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            const storageKey = `messages_${currentUser.id}_${userId}`;
            await AsyncStorage.removeItem(storageKey);
            setMessages([]);
            setShowOptionsModal(false);
            Alert.alert("Success", "Chat cleared successfully!");
          } catch (error) {
            console.error("Error clearing chat:", error);
            Alert.alert("Error", "Failed to clear chat.");
          }
        },
      },
    ]);
  };

  // ─── VIEW PROFILE ────────────────────────────────
  const handleViewProfile = () => {
    setShowOptionsModal(false);
    router.push({
      pathname: "/app-pages/tour-guide-profile",
      params: { userId: userId },
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diff < 604800000) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // ─── GET MESSAGE AVATAR ──────────────────────────
  const getMessageAvatar = (item) => {
    // If this is current user's message, use profile image if available
    if (item.senderId === currentUser?.id) {
      return userProfileImage || "👤";
    }
    // If this is other user's message, use their avatar
    if (item.senderId === otherUser?.id) {
      const avatar = otherUser?.avatar || avatar || "👤";
      return avatar;
    }
    return "👤";
  };

  // ─── GET HEADER AVATAR ───────────────────────────
  const getHeaderAvatar = () => {
    // If chatting with yourself (rare case), use profile image
    if (otherUser?.id === currentUser?.id && userProfileImage) {
      return userProfileImage;
    }
    return otherUser?.avatar || avatar || "👤";
  };

  // ─── RENDER MESSAGE ─────────────────────────────
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === (currentUser?.id || "user1");
    const isMedia = item.media && item.mediaType;
    const avatar = getMessageAvatar(item);

    return (
      <View
        style={[
          styles.messageRow,
          isCurrentUser ? styles.currentUserRow : styles.otherUserRow,
        ]}
      >
        {!isCurrentUser && (
          <View style={styles.messageAvatar}>
            {avatar && avatar.startsWith("file://") ? (
              <Image
                source={{ uri: avatar }}
                style={styles.messageAvatarImage}
              />
            ) : avatar && avatar.startsWith("http") ? (
              <Image
                source={{ uri: avatar }}
                style={styles.messageAvatarImage}
              />
            ) : (
              <Text style={styles.messageAvatarText}>{avatar || "👤"}</Text>
            )}
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}
        >
          {isMedia ? (
            <View>
              {item.mediaType === "photo" ? (
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
              <Text
                style={[
                  styles.messageText,
                  isCurrentUser ? styles.currentUserText : styles.otherUserText,
                ]}
              >
                {item.text}
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.messageText,
                isCurrentUser ? styles.currentUserText : styles.otherUserText,
              ]}
            >
              {item.text}
            </Text>
          )}
          <Text
            style={[
              styles.messageTime,
              isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
            ]}
          >
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {getHeaderAvatar() && getHeaderAvatar().startsWith("file://") ? (
            <Image
              source={{ uri: getHeaderAvatar() }}
              style={styles.headerAvatarImage}
            />
          ) : getHeaderAvatar() && getHeaderAvatar().startsWith("http") ? (
            <Image
              source={{ uri: getHeaderAvatar() }}
              style={styles.headerAvatarImage}
            />
          ) : (
            <Text style={styles.headerAvatar}>{getHeaderAvatar() || "👤"}</Text>
          )}
          <View>
            <Text style={styles.headerName}>
              {otherUser?.name || userName || "User"}
            </Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowOptionsModal(true)}
        >
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
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
              <Text style={styles.emptySubText}>
                Start the conversation! 💬
              </Text>
            </View>
          }
        />
      </TouchableWithoutFeedback>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.keyboardAvoidingView}
      >
        <View
          style={[
            styles.inputContainer,
            Platform.OS === "android" && styles.androidInputContainer,
          ]}
        >
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => {
              Alert.alert("Share Media", "Choose what to share", [
                { text: "📷 Photo", onPress: () => pickMedia("photo") },
                { text: "🎥 Video", onPress: () => pickMedia("video") },
                { text: "Cancel", style: "cancel" },
              ]);
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
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isSending}
          >
            <Text style={styles.sendButtonText}>{isSending ? "⏳" : "➤"}</Text>
          </TouchableOpacity>
        </View>
        {Platform.OS === "android" && !keyboardVisible && (
          <View style={styles.bottomSpacer} />
        )}
      </KeyboardAvoidingView>

      {/* Options Modal (Three Dots Menu) */}
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

            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleViewProfile}
            >
              <Text style={styles.optionIcon}>👤</Text>
              <View>
                <Text style={styles.optionTitle}>View Profile</Text>
                <Text style={styles.optionDescription}>See user profile</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleShareChat}
            >
              <Text style={styles.optionIcon}>📤</Text>
              <View>
                <Text style={styles.optionTitle}>Share Chat</Text>
                <Text style={styles.optionDescription}>
                  Share this conversation
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, styles.optionItemDanger]}
              onPress={handleClearChat}
            >
              <Text style={styles.optionIcon}>🗑️</Text>
              <View>
                <Text style={[styles.optionTitle, styles.optionTitleDanger]}>
                  Clear Chat
                </Text>
                <Text style={styles.optionDescription}>
                  Delete all messages
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: Platform.OS === "android" ? 40 : 0,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#007AFF",
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  headerAvatar: {
    fontSize: 36,
    marginRight: 12,
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  headerStatus: {
    fontSize: 12,
    color: "#4CD964",
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    fontSize: 20,
    color: "#007AFF",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  currentUserRow: {
    justifyContent: "flex-end",
  },
  otherUserRow: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageAvatarText: {
    fontSize: 32,
  },
  messageAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  currentUserBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: "#E8E9ED",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  currentUserText: {
    color: "#ffffff",
  },
  otherUserText: {
    color: "#1a1a1a",
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  currentUserTime: {
    color: "rgba(255,255,255,0.7)",
  },
  otherUserTime: {
    color: "#999",
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
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  videoIcon: {
    fontSize: 48,
  },
  videoText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  keyboardAvoidingView: {
    backgroundColor: "#ffffff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  androidInputContainer: {
    paddingBottom: 62,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  attachButtonText: {
    fontSize: 20,
    color: "#007AFF",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    fontSize: 18,
    color: "#ffffff",
  },
  bottomSpacer: {
    height: 34,
    backgroundColor: "#ffffff",
  },
  // ─── OPTIONS MODAL ──────────────────────────────
  optionsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "85%",
    maxWidth: 350,
    overflow: "hidden",
  },
  optionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  optionsClose: {
    fontSize: 20,
    color: "#999",
    padding: 4,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
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
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  optionTitleDanger: {
    color: "#FF3B30",
  },
  optionDescription: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
  },
  emptySubText: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
  },
});

export default SoloChatPage;
