// tomorrow-weather.jsx - Tomorrow Weather Page
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TomorrowWeatherPage = () => {
    const router = useRouter();
    const [currentTemp, setCurrentTemp] = useState(22);
    const [feelsLike, setFeelsLike] = useState(21);
    const [weatherCondition, setWeatherCondition] = useState('Sunny');

    // Weekly forecast data
    const weeklyForecast = [
        { day: 'Monday', condition: 'Sunny Day', temp: 24, icon: 'sunny-outline' },
        { day: 'Tuesday', condition: 'Mostly Rain', temp: 19, icon: 'rainy-outline' },
        { day: 'Wednesday', condition: 'Cloudy day', temp: 23, icon: 'cloudy-outline' },
        { day: 'Thursday', condition: 'Sunny Day', temp: 25, icon: 'sunny-outline' },
        { day: 'Friday', condition: 'Cloudy day', temp: 22, icon: 'cloudy-outline' },
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
                </LinearGradient>

                {/* Weekly Forecast */}
                <View style={styles.forecastSection}>
                    <Text style={styles.sectionTitle}>Tomorrow</Text>
                    <View style={styles.weeklyList}>
                        {weeklyForecast.map((day, index) => (
                            <View key={index} style={styles.weeklyItem}>
                                <Text style={styles.dayName}>{day.day}</Text>
                                <View style={styles.conditionWrapper}>
                                    <Ionicons name={day.icon} size={24} color="#007AFF" />
                                    <Text style={styles.dayCondition}>{day.condition}</Text>
                                </View>
                                <Text style={styles.dayTemp}>{day.temp}°</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Info Note */}
                <View style={styles.infoNote}>
                    <Text style={styles.infoText}>
                        This is the weekly weather forecast. Study it and make your plans accordingly.
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
    forecastSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    weeklyList: {
        gap: 12,
    },
    weeklyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dayName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        width: 90,
    },
    conditionWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 10,
    },
    dayCondition: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    dayTemp: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        width: 50,
        textAlign: 'right',
    },
    infoNote: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 20,
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

export default TomorrowWeatherPage;