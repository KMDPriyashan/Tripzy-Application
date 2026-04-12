// selected-location.jsx - Selected Location Weather Page
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SelectedLocationPage = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const location = params.location || 'Kandy';
    const initialTemp = params.temp ? parseInt(params.temp) : 22;

    const [currentTemp, setCurrentTemp] = useState(initialTemp);
    const [feelsLike, setFeelsLike] = useState(initialTemp - 1);

    // 4-hour interval forecast data
    const timeSlots = ['8:00 AM', '12:00 AM', '1:00 PM', '4:00 PM'];
    const forecastTemps = [22, 22, 23, 24];

    // Repeat for multiple days
    const forecastDays = [
        { day: 'Day 1', temps: [22, 22, 23, 24] },
        { day: 'Day 2', temps: [23, 23, 24, 25] },
        { day: 'Day 3', temps: [21, 21, 22, 23] },
    ];

    const bottomNavItems = [
        { name: 'Home', icon: 'home-outline', route: '/app-pages/home' },
        { name: 'Map', icon: 'map-outline', route: '/app-pages/map' },
        { name: 'Feed', icon: 'newspaper-outline', route: '/app-pages/feed' },
        { name: 'Group', icon: 'people-outline', route: '/app-pages/community' },
        { name: 'Profile', icon: 'person-outline', route: '/app-pages/profile' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hutch Dialog</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Weather Card */}
                <LinearGradient
                    colors={['#4A90E2', '#357ABD']}
                    style={styles.weatherCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.tempContainer}>
                        <Text style={styles.temperature}>{currentTemp}°</Text>
                        <Text style={styles.feelsLike}>{feelsLike}°</Text>
                    </View>
                    <View style={styles.conditionContainer}>
                        <Ionicons name="sunny-outline" size={40} color="#fff" />
                        <Text style={styles.conditionText}>SunnyShow Climate</Text>
                    </View>
                    <Text style={styles.locationName}>{location}</Text>
                </LinearGradient>

                {/* Info Note */}
                <View style={styles.infoNote}>
                    <Text style={styles.infoText}>
                        This location's weather is shown below, with changes every 4 hours clearly displayed.
                    </Text>
                </View>

                {/* Forecast Sections */}
                {forecastDays.map((day, dayIndex) => (
                    <View key={dayIndex} style={styles.forecastSection}>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.forecastScroll}
                        >
                            {timeSlots.map((time, index) => (
                                <View key={index} style={styles.forecastItem}>
                                    <Text style={styles.timeText}>{time}</Text>
                                    <Text style={styles.tempText}>{day.temps[index]}°</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                ))}

                {/* Additional Weather Info */}
                <View style={styles.additionalInfo}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="water-outline" size={24} color="#007AFF" />
                            <Text style={styles.infoLabel}>Humidity</Text>
                            <Text style={styles.infoValue}>65%</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="wind-outline" size={24} color="#007AFF" />
                            <Text style={styles.infoLabel}>Wind Speed</Text>
                            <Text style={styles.infoValue}>12 km/h</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="umbrella-outline" size={24} color="#007AFF" />
                            <Text style={styles.infoLabel}>Precipitation</Text>
                            <Text style={styles.infoValue}>20%</Text>
                        </View>
                    </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    weatherCard: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    tempContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    temperature: {
        fontSize: 72,
        fontWeight: '700',
        color: '#fff',
    },
    feelsLike: {
        fontSize: 28,
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 8,
    },
    conditionContainer: {
        alignItems: 'center',
    },
    conditionText: {
        fontSize: 18,
        color: '#fff',
        marginTop: 8,
    },
    locationName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginTop: 16,
    },
    infoNote: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    forecastSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    forecastScroll: {
        paddingRight: 16,
    },
    forecastItem: {
        alignItems: 'center',
        marginRight: 32,
        minWidth: 80,
    },
    timeText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    tempText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#333',
    },
    additionalInfo: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    infoItem: {
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 4,
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

export default SelectedLocationPage;