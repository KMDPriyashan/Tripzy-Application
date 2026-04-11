// weather.jsx - Main Weather Page
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WeatherPage = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('Colombo');
    const [currentTemp, setCurrentTemp] = useState(22);
    const [feelsLike, setFeelsLike] = useState(21);
    const [weatherCondition, setWeatherCondition] = useState('Sunny');
    const [precipitation, setPrecipitation] = useState(20);
    const [humidity, setHumidity] = useState(30);
    const [windSpeed, setWindSpeed] = useState(12);

    // Hourly forecast data
    const hourlyForecast = [
        { time: '8:00 AM', temp: 22, icon: 'sunny-outline' },
        { time: '10:00 AM', temp: 23, icon: 'partly-sunny-outline' },
        { time: '12:00 PM', temp: 24, icon: 'sunny-outline' },
        { time: '2:00 PM', temp: 24, icon: 'sunny-outline' },
        { time: '4:00 PM', temp: 23, icon: 'partly-sunny-outline' },
        { time: '6:00 PM', temp: 22, icon: 'cloudy-outline' },
    ];

    // Weekly forecast data
    const weeklyForecast = [
        { day: 'Monday', condition: 'Sunny Day', temp: 24, icon: 'sunny-outline' },
        { day: 'Tuesday', condition: 'Mostly Rain', temp: 19, icon: 'rainy-outline' },
        { day: 'Wednesday', condition: 'Cloudy day', temp: 23, icon: 'cloudy-outline' },
        { day: 'Thursday', condition: 'Sunny Day', temp: 25, icon: 'sunny-outline' },
        { day: 'Friday', condition: 'Cloudy day', temp: 22, icon: 'cloudy-outline' },
        { day: 'Saturday', condition: 'Partly Sunny', temp: 24, icon: 'partly-sunny-outline' },
        { day: 'Sunday', condition: 'Sunny Day', temp: 26, icon: 'sunny-outline' },
    ];

    // Other cities data
    const otherCities = [
        { name: 'Kandy', condition: 'Mostly Cloudy with Thunders', temp: 20, icon: 'thunderstorm-outline' },
        { name: 'Galle', condition: 'Partly Sunny', temp: 25, icon: 'partly-sunny-outline' },
        { name: 'Negombo', condition: 'Sunny', temp: 23, icon: 'sunny-outline' },
        { name: 'Nuwara Eliya', condition: 'Cloudy', temp: 16, icon: 'cloudy-outline' },
    ];

    const bottomNavItems = [
        { name: 'Home', icon: 'home-outline', route: '/app-pages/home' },
        { name: 'Map', icon: 'map-outline', route: '/app-pages/map' },
        { name: 'Feed', icon: 'newspaper-outline', route: '/app-pages/feed' },
        { name: 'Group', icon: 'people-outline', route: '/app-pages/community' },
        { name: 'Profile', icon: 'person-outline', route: '/app-pages/profile' },
    ];

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push({
                pathname: '/app-pages/selected-location',
                params: { location: searchQuery }
            });
        }
    };

    const handleLocationPress = (location) => {
        router.push({
            pathname: '/app-pages/selected-location',
            params: { location: location.name, temp: location.temp }
        });
    };

    const navigateToTomorrow = () => {
        router.push('/app-pages/tomorrow-weather');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Hutch Dialog</Text>
                </View>

                {/* Main Weather Card */}
                <LinearGradient
                    colors={['#4A90E2', '#357ABD']}
                    style={styles.weatherCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.checkWeatherTitle}>Check Your Weather Updates</Text>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color="#8E8E93" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
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

                    {/* Location and Tomorrow Button */}
                    <View style={styles.locationRow}>
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={20} color="#fff" />
                            <Text style={styles.locationText}>Living Location</Text>
                        </View>
                        <TouchableOpacity onPress={navigateToTomorrow}>
                            <Text style={styles.tomorrowText}>Tomorrow &gt;</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Temperature Display */}
                    <View style={styles.tempContainer}>
                        <Text style={styles.temperature}>{currentTemp}°</Text>
                        <Text style={styles.feelsLike}>{feelsLike}°</Text>
                    </View>

                    {/* Weather Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons name="water-outline" size={24} color="#fff" />
                            <Text style={styles.statValue}>{precipitation}%</Text>
                            <Text style={styles.statLabel}>Precipitation</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Ionicons name="cloud-outline" size={24} color="#fff" />
                            <Text style={styles.statValue}>{humidity}%</Text>
                            <Text style={styles.statLabel}>Humidity</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Ionicons name="wind-outline" size={24} color="#fff" />
                            <Text style={styles.statValue}>{windSpeed} Km/h</Text>
                            <Text style={styles.statLabel}>Wind Speed</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Today's Forecast */}
                <View style={styles.forecastSection}>
                    <Text style={styles.sectionTitle}>Today</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.hourlyScroll}
                    >
                        {hourlyForecast.map((hour, index) => (
                            <View key={index} style={styles.hourlyItem}>
                                <Text style={styles.hourlyTime}>{hour.time}</Text>
                                <Ionicons name={hour.icon} size={32} color="#007AFF" />
                                <Text style={styles.hourlyTemp}>{hour.temp}°</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* T-Day Forecast */}
                <View style={styles.forecastSection}>
                    <Text style={styles.sectionTitle}>T-Day Forecast</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.hourlyScroll}
                    >
                        {weeklyForecast.slice(0, 3).map((day, index) => (
                            <View key={index} style={styles.hourlyItem}>
                                <Text style={styles.hourlyTime}>{day.day}</Text>
                                <Ionicons name={day.icon} size={32} color="#007AFF" />
                                <Text style={styles.hourlyTemp}>{day.temp}°</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Other Cities */}
                <View style={styles.otherCitiesSection}>
                    <Text style={styles.sectionTitle}>Other Cities</Text>
                    {otherCities.map((city, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.cityCard}
                            onPress={() => handleLocationPress(city)}
                        >
                            <View style={styles.cityInfo}>
                                <Text style={styles.cityName}>{city.name}</Text>
                                <Text style={styles.cityCondition}>{city.condition}</Text>
                            </View>
                            <View style={styles.cityTemp}>
                                <Text style={styles.cityTempValue}>{city.temp}°</Text>
                                <Ionicons name={city.icon} size={24} color="#007AFF" />
                            </View>
                        </TouchableOpacity>
                    ))}
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
    },
    weatherCard: {
        marginHorizontal: 16,
    marginTop: 16,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    checkWeatherTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
        paddingVertical: 0,
    },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 8,
    },
    tomorrowText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    tempContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 30,
    },
    temperature: {
        fontSize: 64,
        fontWeight: '700',
        color: '#fff',
    },
    feelsLike: {
        fontSize: 24,
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
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
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    hourlyScroll: {
        paddingRight: 16,
    },
    hourlyItem: {
        alignItems: 'center',
        marginRight: 24,
        minWidth: 70,
    },
    hourlyTime: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    hourlyTemp: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 8,
    },
    otherCitiesSection: {
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
    cityCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cityInfo: {
        flex: 1,
    },
    cityName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    cityCondition: {
        fontSize: 14,
        color: '#666',
    },
    cityTemp: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cityTempValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginRight: 8,
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

export default WeatherPage;