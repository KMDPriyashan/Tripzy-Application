// weather-notification.jsx - Weather Notification Page
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const WeatherNotificationPage = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const bottomNavItems = [
        { name: 'Home', icon: 'home-outline', route: '/app-pages/home' },
        { name: 'Weather', icon: 'cloud-outline', route: '/app-pages/weather' },
        { name: 'Message', icon: 'chatbubble-outline', route: '/app-pages/messages' },
        { name: 'Group', icon: 'people-outline', route: '/app-pages/community' },
        { name: 'Setting', icon: 'settings-outline', route: '/app-pages/settings' },
    ];

    const tools = [
        { 
            title: 'Trip Planning', 
            description: 'Plan your journey with ease, try our Trip Planner!',
            icon: 'map-outline',
            color: '#FF6B6B'
        },
        { 
            title: 'Travel Feed', 
            description: 'Your path begins with presence.',
            icon: 'newspaper-outline',
            color: '#4ECDC4'
        },
        { 
            title: 'Map Enhance', 
            description: 'Map your travels. Nourish your soul.',
            icon: 'map-outline',
            color: '#45B7D1'
        },
        { 
            title: 'Travel Guide', 
            description: 'Let your itinerary breathe with intention.',
            icon: 'compass-outline',
            color: '#96CEB4'
        },
    ];

    const handleSearch = () => {
        if (searchQuery.trim()) {
            // Handle search
            console.log('Searching for:', searchQuery);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {/* App Header */}
                <View style={styles.header}>
                    <Text style={styles.appTitle}>Tripzy</Text>
                    <Text style={styles.appSubtitle}>Application</Text>
                </View>

                {/* Weather Alert Card */}
                <LinearGradient
                    colors={['#FF6B6B', '#FF8E53']}
                    style={styles.alertCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.alertHeader}>
                        <Ionicons name="warning" size={24} color="#fff" />
                        <Text style={styles.alertTitle}>Mostly Rainy</Text>
                    </View>
                    <Text style={styles.alertMessage}>
                        Mostly Rainy with thunders. so please careful and avoid using electrical devices
                    </Text>
                </LinearGradient>

                {/* Search Section */}
                <View style={styles.searchSection}>
                    <Text style={styles.searchLabel}>Search Your Trip</Text>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color="#8E8E93" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search destinations, hotels..."
                            placeholderTextColor="#8E8E93"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color="#8E8E93" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Anchor Tools Section */}
                <View style={styles.toolsSection}>
                    <Text style={styles.sectionTitle}>Anchor Tools</Text>
                    <View style={styles.toolsGrid}>
                        {tools.map((tool, index) => (
                            <TouchableOpacity key={index} style={styles.toolCard}>
                                <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
                                    <Ionicons name={tool.icon} size={32} color={tool.color} />
                                </View>
                                <Text style={styles.toolTitle}>{tool.title}</Text>
                                <Text style={styles.toolDescription}>{tool.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Weather Link */}
                <TouchableOpacity style={styles.weatherLink} onPress={() => router.push('/app-pages/weather')}>
                    <View style={styles.weatherLinkContent}>
                        <Ionicons name="cloud-outline" size={24} color="#007AFF" />
                        <Text style={styles.weatherLinkText}>Weather</Text>
                    </View>
                    <Text style={styles.weatherLinkSubtext}>Check You Journey as Previous</Text>
                    <Ionicons name="chevron-forward" size={20} color="#007AFF" />
                </TouchableOpacity>

                {/* Travel Community */}
                <View style={styles.communitySection}>
                    <Text style={styles.communityTitle}>Travel Community</Text>
                    <Text style={styles.communitySubtext}>Chat with your travel partner one</Text>
                    <TouchableOpacity style={styles.communityButton}>
                        <Text style={styles.communityButtonText}>Join Now</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Inspirational Message */}
                <View style={styles.inspirationCard}>
                    <Text style={styles.inspirationTitle}>Enjoy your Journey</Text>
                    <Text style={styles.inspirationText}>
                        May your journey be filled with peace, wonder, and beautiful moments that stay with you.
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                {bottomNavItems.map((item) => (
                    <TouchableOpacity
                        key={item.name}
                        style={styles.navItem}
                        onPress={() => router.push(item.route)}
                    >
                        <Ionicons name={item.icon} size={24} color="#666" />
                        <Text style={styles.navText}>{item.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 80,
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    appTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
    },
    appSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    alertCard: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
    alertMessage: {
        fontSize: 14,
        color: '#fff',
        lineHeight: 20,
    },
    searchSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    searchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
        paddingVertical: 0,
    },
    toolsSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    toolsGrid: {
        gap: 16,
    },
    toolCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
    },
    toolIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    toolTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    toolDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    weatherLink: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    weatherLinkContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weatherLinkText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    weatherLinkSubtext: {
        fontSize: 14,
        color: '#666',
        marginLeft: 36,
        flex: 1,
    },
    communitySection: {
        backgroundColor: '#4A90E2',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    communityTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    communitySubtext: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
    },
    communityButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 8,
    },
    communityButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A90E2',
    },
    inspirationCard: {
        backgroundColor: '#2C3E50',
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    inspirationTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    inspirationText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 22,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
        marginTop: 4,
    },
});

export default WeatherNotificationPage;