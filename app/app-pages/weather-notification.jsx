// weather-notification.jsx - Weather Notification Page
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const WeatherNotificationPage = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [weatherAlert, setWeatherAlert] = useState(null);

    // Load saved notifications and check for weather alerts
    useEffect(() => {
        loadNotifications();
        checkWeatherAlerts();
        // Set up interval to check weather alerts every hour
        const interval = setInterval(checkWeatherAlerts, 3600000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const saved = await AsyncStorage.getItem('weather_notifications');
            if (saved) {
                setNotifications(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const saveNotification = async (notification) => {
        try {
            const updated = [notification, ...notifications].slice(0, 20);
            setNotifications(updated);
            await AsyncStorage.setItem('weather_notifications', JSON.stringify(updated));
        } catch (error) {
            console.error('Error saving notification:', error);
        }
    };

    const checkWeatherAlerts = async () => {
        // Simulate weather alert check for Sri Lanka cities
        const sriLankanCities = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Nuwara Eliya', 'Trincomalee', 'Negombo', 'Batticaloa'];
        const randomCity = sriLankanCities[Math.floor(Math.random() * sriLankanCities.length)];
        
        // Random weather alerts for demonstration
        const alerts = [
            { type: 'rain', message: `Heavy rainfall expected in ${randomCity} today. Carry an umbrella!`, severity: 'warning' },
            { type: 'thunder', message: `Thunderstorms predicted in ${randomCity}. Avoid outdoor activities.`, severity: 'danger' },
            { type: 'heat', message: `Heat wave warning in ${randomCity}. Stay hydrated!`, severity: 'warning' },
            { type: 'wind', message: `Strong winds in ${randomCity}. Be careful when traveling.`, severity: 'info' },
        ];
        
        // 30% chance of showing an alert
        if (Math.random() < 0.3) {
            const alert = alerts[Math.floor(Math.random() * alerts.length)];
            setWeatherAlert(alert);
            const newNotification = {
                id: Date.now(),
                title: `Weather Alert: ${alert.type.toUpperCase()}`,
                message: alert.message,
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                severity: alert.severity,
                city: randomCity
            };
            await saveNotification(newNotification);
            // Show alert popup
            Alert.alert('Weather Alert', alert.message);
        } else {
            setWeatherAlert(null);
        }
    };

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
            // Only allow Sri Lankan city search
            const sriLankanCities = ['colombo', 'kandy', 'galle', 'jaffna', 'nuwara eliya', 'trincomalee', 'negombo', 'batticaloa', 'anuradhapura', 'polonnaruwa', 'ratnapura', 'badulla', 'kurunegala', 'matara', 'kalutara'];
            const cityLower = searchQuery.toLowerCase().trim();
            const isValid = sriLankanCities.some(city => cityLower.includes(city) || city.includes(cityLower));
            
            if (isValid) {
                console.log('Searching for Sri Lankan city:', searchQuery);
                Alert.alert('Search', `Searching for weather in ${searchQuery}...`);
            } else {
                Alert.alert('Search Restricted', 'Weather searches are currently limited to Sri Lankan cities only. Please enter a city in Sri Lanka (e.g., Colombo, Kandy, Galle).');
            }
        }
    };

    const getSeverityColor = (severity) => {
        switch(severity) {
            case 'danger': return '#FF0000';
            case 'warning': return '#FF6B6B';
            case 'info': return '#FF8E53';
            default: return '#FF6B6B';
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
                    <Text style={styles.appSubtitle}>Weather Notifications</Text>
                </View>

                {/* Weather Alert Card - Dynamic based on current alerts */}
                <LinearGradient
                    colors={weatherAlert ? [getSeverityColor(weatherAlert.severity), '#FF8E53'] : ['#FF6B6B', '#FF8E53']}
                    style={styles.alertCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.alertHeader}>
                        <Ionicons name={weatherAlert ? "alert-circle" : "warning"} size={24} color="#fff" />
                        <Text style={styles.alertTitle}>
                            {weatherAlert ? weatherAlert.type.toUpperCase() : 'Weather Monitoring Active'}
                        </Text>
                    </View>
                    <Text style={styles.alertMessage}>
                        {weatherAlert ? weatherAlert.message : 'Weather alerts will appear here when severe conditions are detected in Sri Lanka.'}
                    </Text>
                </LinearGradient>

                {/* Notifications Section */}
                <View style={styles.notificationsSection}>
                    <Text style={styles.sectionTitle}>Recent Notifications</Text>
                    {notifications.length === 0 ? (
                        <View style={styles.emptyNotifications}>
                            <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No notifications yet</Text>
                            <Text style={styles.emptySubtext}>Weather alerts will appear here</Text>
                        </View>
                    ) : (
                        notifications.map((notif) => (
                            <View key={notif.id} style={[styles.notificationCard, { borderLeftColor: getSeverityColor(notif.severity) }]}>
                                <View style={styles.notificationHeader}>
                                    <Ionicons name="cloud-outline" size={20} color="#007AFF" />
                                    <Text style={styles.notificationTitle}>{notif.title}</Text>
                                    <Text style={styles.notificationTime}>{notif.time}</Text>
                                </View>
                                <Text style={styles.notificationMessage}>{notif.message}</Text>
                                <Text style={styles.notificationDate}>{notif.date} • {notif.city}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Search Section - Sri Lanka only */}
                <View style={styles.searchSection}>
                    <Text style={styles.searchLabel}>Search Your Trip (Sri Lanka)</Text>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color="#8E8E93" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search Sri Lankan cities..."
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
                    <Text style={styles.searchHint}>Supported cities: Colombo, Kandy, Galle, Jaffna, Nuwara Eliya, and more</Text>
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
                    <Text style={styles.weatherLinkSubtext}>Check detailed forecast for Sri Lankan cities</Text>
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
    notificationsSection: {
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
    emptyNotifications: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
    },
    emptySubtext: {
        fontSize: 12,
        color: '#ccc',
        marginTop: 5,
    },
    notificationCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginLeft: 8,
    },
    notificationTime: {
        fontSize: 11,
        color: '#999',
    },
    notificationMessage: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 8,
    },
    notificationDate: {
        fontSize: 10,
        color: '#bbb',
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
    searchHint: {
        fontSize: 11,
        color: '#999',
        marginTop: 8,
        fontStyle: 'italic',
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