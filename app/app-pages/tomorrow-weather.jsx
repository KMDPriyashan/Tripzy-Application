// tomorrow-weather.jsx - Tomorrow Weather Page
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TomorrowWeatherPage = () => {
    const router = useRouter();
    const [currentTemp, setCurrentTemp] = useState(22);
    const [feelsLike, setFeelsLike] = useState(21);
    const [weatherCondition, setWeatherCondition] = useState('Sunny');
    const [tomorrowForecast, setTomorrowForecast] = useState(null);
    const [currentDayName, setCurrentDayName] = useState('');

    // Get tomorrow's date and update forecast dynamically
    useEffect(() => {
        updateForecastForTomorrow();
    }, []);

    const updateForecastForTomorrow = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' });
        setCurrentDayName(currentDay);
        
        const tomorrowDayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Dynamic weekly forecast that starts from tomorrow
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const tomorrowIndex = daysOfWeek.indexOf(tomorrowDayName);
        
        // Create forecast data starting from tomorrow
        const weeklyData = [];
        for (let i = 0; i < 7; i++) {
            const dayIndex = (tomorrowIndex + i) % 7;
            const dayName = daysOfWeek[dayIndex];
            
            // Simulate different weather conditions based on day and season
            const conditions = [
                { condition: 'Sunny Day', temp: 24 + Math.floor(Math.random() * 5), icon: 'sunny-outline', color: '#FF9800' },
                { condition: 'Mostly Rain', temp: 19 + Math.floor(Math.random() * 4), icon: 'rainy-outline', color: '#4A90E2' },
                { condition: 'Cloudy day', temp: 22 + Math.floor(Math.random() * 3), icon: 'cloudy-outline', color: '#78909C' },
                { condition: 'Partly Cloudy', temp: 23 + Math.floor(Math.random() * 4), icon: 'partly-sunny-outline', color: '#64B5F6' },
                { condition: 'Thunderstorms', temp: 20 + Math.floor(Math.random() * 3), icon: 'thunderstorm-outline', color: '#5C6BC0' },
            ];
            
            const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
            
            weeklyData.push({
                day: dayName,
                condition: randomCondition.condition,
                temp: randomCondition.temp,
                icon: randomCondition.icon,
                color: randomCondition.color,
                isTomorrow: i === 0
            });
        }
        
        // Set tomorrow's forecast separately for the hero section
        const tomorrowData = weeklyData[0];
        setTomorrowForecast({
            day: tomorrowDayName,
            date: tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ...tomorrowData
        });
        
        setCurrentTemp(tomorrowData.temp);
        setWeatherCondition(tomorrowData.condition);
        setFeelsLike(tomorrowData.temp - 1);
    };

    const bottomNavItems = [
        { name: 'Home', icon: 'home-outline', route: '/app-pages/home' },
        { name: 'Map', icon: 'map-outline', route: '/app-pages/map' },
        { name: 'Feed', icon: 'newspaper-outline', route: '/app-pages/feed' },
        { name: 'Group', icon: 'people-outline', route: '/app-pages/community' },
        { name: 'Profile', icon: 'person-outline', route: '/app-pages/profile' },
    ];

    const weeklyForecast = tomorrowForecast ? [
        tomorrowForecast,
        { day: getDayAfter(1), condition: 'Partly Cloudy', temp: 23, icon: 'partly-sunny-outline' },
        { day: getDayAfter(2), condition: 'Sunny Day', temp: 25, icon: 'sunny-outline' },
        { day: getDayAfter(3), condition: 'Cloudy day', temp: 22, icon: 'cloudy-outline' },
        { day: getDayAfter(4), condition: 'Mostly Rain', temp: 19, icon: 'rainy-outline' },
    ] : [];

    const getDayAfter = (days) => {
        const date = new Date();
        date.setDate(date.getDate() + days + 1);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const getWeatherIconForCondition = (condition) => {
        if (condition.includes('Sunny')) return 'sunny-outline';
        if (condition.includes('Rain')) return 'rainy-outline';
        if (condition.includes('Cloudy')) return 'cloudy-outline';
        if (condition.includes('Thunder')) return 'thunderstorm-outline';
        return 'partly-sunny-outline';
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
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Weather Forecast</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Tomorrow's Weather Card */}
                <LinearGradient
                    colors={tomorrowForecast ? ['#4A90E2', '#357ABD'] : ['#FF9800', '#F57C00']}
                    style={styles.weatherCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.tomorrowBadge}>
                        <Text style={styles.tomorrowBadgeText}>Tomorrow's Forecast</Text>
                    </View>
                    <Text style={styles.tomorrowDay}>{tomorrowForecast?.day || 'Tomorrow'}</Text>
                    <Text style={styles.tomorrowDate}>{tomorrowForecast?.date || ''}</Text>
                    <View style={styles.tempContainer}>
                        <Text style={styles.temperature}>{currentTemp}°</Text>
                        <Text style={styles.feelsLike}>Feels like {feelsLike}°</Text>
                    </View>
                    <View style={styles.conditionContainer}>
                        <Ionicons name={tomorrowForecast?.icon || 'sunny-outline'} size={48} color="#fff" />
                        <Text style={styles.conditionText}>{weatherCondition}</Text>
                    </View>
                </LinearGradient>

                {/* Weekly Forecast */}
                <View style={styles.forecastSection}>
                    <Text style={styles.sectionTitle}>7-Day Forecast (Starting Tomorrow)</Text>
                    <View style={styles.weeklyList}>
                        {weeklyForecast.map((day, index) => (
                            <View key={index} style={[styles.weeklyItem, day.isTomorrow && styles.tomorrowItem]}>
                                <Text style={[styles.dayName, day.isTomorrow && styles.tomorrowDayText]}>
                                    {day.isTomorrow ? 'Tomorrow' : day.day}
                                </Text>
                                <View style={styles.conditionWrapper}>
                                    <Ionicons name={day.icon || getWeatherIconForCondition(day.condition)} size={24} color={day.isTomorrow ? '#007AFF' : '#666'} />
                                    <Text style={[styles.dayCondition, day.isTomorrow && styles.tomorrowConditionText]}>
                                        {day.condition}
                                    </Text>
                                </View>
                                <Text style={[styles.dayTemp, day.isTomorrow && styles.tomorrowTempText]}>
                                    {day.temp}°
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Weather Tips for Tomorrow */}
                <View style={styles.tipsSection}>
                    <Text style={styles.tipsTitle}>📋 Preparation Tips</Text>
                    <View style={styles.tipList}>
                        <View style={styles.tipItem}>
                            <Ionicons name="umbrella-outline" size={20} color="#007AFF" />
                            <Text style={styles.tipText}>
                                {weatherCondition.includes('Rain') ? 'Don\'t forget to carry an umbrella tomorrow!' : 'No rain expected tomorrow, perfect for outdoor plans.'}
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="thermometer-outline" size={20} color="#FF6B6B" />
                            <Text style={styles.tipText}>
                                {currentTemp > 30 ? 'Stay hydrated and wear light clothing.' : currentTemp < 20 ? 'Bring a light jacket for the cooler weather.' : 'Comfortable temperatures expected.'}
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
                            <Text style={styles.tipText}>
                                Plan your activities accordingly. {currentDayName === 'Saturday' || currentDayName === 'Sunday' ? 'Weekend travel might be busy!' : 'Weekday travel may have less traffic.'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Info Note */}
                <View style={styles.infoNote}>
                    <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
                    <Text style={styles.infoText}>
                        This forecast is updated daily. Check back for the most accurate weather information for your travels in Sri Lanka.
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
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    tomorrowBadge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 12,
    },
    tomorrowBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    tomorrowDay: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    tomorrowDate: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 16,
    },
    tempContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    temperature: {
        fontSize: 72,
        fontWeight: '700',
        color: '#fff',
    },
    feelsLike: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
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
        fontSize: 18,
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
    tomorrowItem: {
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    dayName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        width: 90,
    },
    tomorrowDayText: {
        color: '#007AFF',
        fontWeight: '700',
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
    tomorrowConditionText: {
        color: '#007AFF',
        fontWeight: '500',
    },
    dayTemp: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        width: 50,
        textAlign: 'right',
    },
    tomorrowTempText: {
        color: '#007AFF',
    },
    tipsSection: {
        backgroundColor: '#E8F5E9',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        padding: 16,
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2E7D32',
        marginBottom: 12,
    },
    tipList: {
        gap: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    infoNote: {
        backgroundColor: '#FFF3E0',
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#E65100',
        lineHeight: 18,
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