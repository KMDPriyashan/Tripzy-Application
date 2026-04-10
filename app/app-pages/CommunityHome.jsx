// CommunityHome.jsx
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CommunityHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [activeNav, setActiveNav] = useState('feed');

  // Chat data based on the PNG design
  const chatList = [
    { id: 1, name: 'Pavan Perera', lastMessage: 'How are You! Doin Well >', time: '5.36 P.M', unread: 2, avatar: 'https://randomuser.me/api/portraits/men/1.jpg', online: true },
    { id: 2, name: 'Dasun Shanaka', lastMessage: 'How are You! Doin Well >', time: '1.36 P.M', unread: 2, avatar: 'https://randomuser.me/api/portraits/men/2.jpg', online: false },
    { id: 3, name: 'Jude Piramal', lastMessage: 'How are You! Doin Well >', time: '5.36 P.M', unread: 2, avatar: 'https://randomuser.me/api/portraits/men/3.jpg', online: true },
    { id: 4, name: 'Kusal Mendis', lastMessage: 'How are You! Doin Well >', time: '5.36 P.M', unread: 2, avatar: 'https://randomuser.me/api/portraits/men/4.jpg', online: false },
    { id: 5, name: 'Kamil Mishara', lastMessage: 'How are You! Doin Well >', time: '5.36 P.M', unread: 2, avatar: 'https://randomuser.me/api/portraits/men/5.jpg', online: true },
    { id: 6, name: 'Niroshan Dickwella', lastMessage: 'Planning a trip to Kandy! 🚗', time: '2.15 P.M', unread: 1, avatar: 'https://randomuser.me/api/portraits/men/6.jpg', online: true },
    { id: 7, name: 'Dimuth Karunaratne', lastMessage: 'Anyone for hiking tomorrow?', time: '11.20 AM', unread: 3, avatar: 'https://randomuser.me/api/portraits/men/7.jpg', online: false },
  ];

  // Community groups data
  const communityGroups = [
    { id: 1, name: 'Travel Buddies', members: 234, image: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { id: 2, name: 'Solo Travelers', members: 189, image: 'https://randomuser.me/api/portraits/men/8.jpg' },
    { id: 3, name: 'Adventure Seekers', members: 456, image: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: 4, name: 'Photo Lovers', members: 312, image: 'https://randomuser.me/api/portraits/men/9.jpg' },
    { id: 5, name: 'Local Guides', members: 178, image: 'https://randomuser.me/api/portraits/women/3.jpg' },
    { id: 6, name: 'Food Explorers', members: 267, image: 'https://randomuser.me/api/portraits/men/10.jpg' },
  ];

  const filteredChats = chatList.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatPress = (chatName) => {
    Alert.alert('Direct Message', `Opening chat with ${chatName}\n\nDirect messaging feature coming soon!`);
  };

  const handleGroupPress = (groupName) => {
    Alert.alert('Community Group', `Opening group: ${groupName}\n\nJoin the conversation with ${groupName} community!`);
  };

  const handleNavPress = (screen) => {
    setActiveNav(screen.toLowerCase());
    Alert.alert('Navigation', `Navigating to ${screen} page`);
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      Alert.alert('Message Sent', `"${messageInput}"`);
      setMessageInput('');
    }
  };

  const handleDirectMessage = () => {
    Alert.alert('Direct Messages', 'Connect privately with your travel buddies!');
  };

  const handleCommunityChat = () => {
    Alert.alert('Community Chat', 'Join group conversations and share travel experiences!');
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      onPress={() => handleChatPress(item.name)}
      activeOpacity={0.7}
    >
      <View style={styles.chatAvatar}>
        <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
        {item.online && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatNameRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.lastMessageRow}>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.groupCard} 
      onPress={() => handleGroupPress(item.name)}
      activeOpacity={0.7}
    >
      <View style={styles.groupAvatar}>
        <Image source={{ uri: item.image }} style={styles.groupImage} />
      </View>
      <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
      <View style={styles.groupMembersRow}>
        <Feather name="users" size={12} color="#999" />
        <Text style={styles.groupMembers}>{item.members} members</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Tripzy Community</Text>
          <Text style={styles.subtitle}>
            Where every journey begins with connection and grows into a shared adventure.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleDirectMessage}>
            <Text style={styles.primaryButtonText}>💬 Direct Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleCommunityChat}>
            <Text style={styles.secondaryButtonText}>🌍 Community Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Direct Messages Section */}
        <View style={styles.chatSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Direct Messages</Text>
            <TouchableOpacity onPress={() => Alert.alert('View All', 'All conversations')}>
              <View style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View All</Text>
                <Feather name="chevron-right" size={18} color="#007AFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search messages..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Chat List */}
          <FlatList
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Community Groups Section */}
        <View style={styles.groupsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community Groups</Text>
            <TouchableOpacity onPress={() => Alert.alert('View All', 'All community groups')}>
              <View style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View All</Text>
                <Feather name="chevron-right" size={18} color="#007AFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Groups Horizontal Scroll */}
          <FlatList
            data={communityGroups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.groupsList}
          />
        </View>

        {/* Quick Message Input */}
        <View style={styles.messageInputArea}>
          <TextInput
            style={styles.messageInput}
            placeholder="Write a message to the community..."
            placeholderTextColor="#999"
            value={messageInput}
            onChangeText={setMessageInput}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Feather name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Padding for Nav */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavPress('Home')}>
          <Feather name="home" size={22} color={activeNav === 'home' ? '#007AFF' : '#999'} />
          <Text style={[styles.navLabel, activeNav === 'home' && styles.activeNavLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => handleNavPress('Map')}>
          <Feather name="map-pin" size={22} color={activeNav === 'map' ? '#007AFF' : '#999'} />
          <Text style={[styles.navLabel, activeNav === 'map' && styles.activeNavLabel]}>Map</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => handleNavPress('Feed')}>
          <Feather name="message-circle" size={22} color={activeNav === 'feed' ? '#007AFF' : '#999'} />
          <Text style={[styles.navLabel, activeNav === 'feed' && styles.activeNavLabel]}>Feed</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => handleNavPress('Group')}>
          <Feather name="users" size={22} color={activeNav === 'group' ? '#007AFF' : '#999'} />
          <Text style={[styles.navLabel, activeNav === 'group' && styles.activeNavLabel]}>Group</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => handleNavPress('Profile')}>
          <Feather name="user" size={22} color={activeNav === 'profile' ? '#007AFF' : '#999'} />
          <Text style={[styles.navLabel, activeNav === 'profile' && styles.activeNavLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 40,
    backgroundColor: '#667eea',
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 7.5,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 15,
  },
  chatSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#007AFF',
    fontWeight: '500',
    fontSize: 14,
    marginRight: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
    padding: 0,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chatAvatar: {
    position: 'relative',
    width: 55,
    height: 55,
    marginRight: 15,
  },
  avatarImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4cd964',
    borderWidth: 2,
    borderColor: 'white',
  },
  chatInfo: {
    flex: 1,
  },
  chatNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  name: {
    fontWeight: '600',
    color: '#333',
    fontSize: 15,
  },
  time: {
    fontSize: 11,
    color: '#999',
  },
  lastMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  unreadText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  groupsSection: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  groupsList: {
    paddingVertical: 10,
  },
  groupCard: {
    width: 150,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  groupImage: {
    width: 70,
    height: 70,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  groupMembersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupMembers: {
    fontSize: 11,
    color: '#999',
    marginLeft: 5,
  },
  messageInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  messageInput: {
    flex: 1,
    fontSize: 14,
    padding: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  activeNavLabel: {
    color: '#007AFF',
  },
});

export default CommunityHome;