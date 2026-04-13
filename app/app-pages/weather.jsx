// app-pages/weather.jsx
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Open-Meteo API (Free, no API key required)
const WEATHER_API_BASE = 'https://api.open-meteo.com/v1';
const GEOCODING_API_BASE = 'https://geocoding-api.open-meteo.com/v1';

export default function WeatherPage() {
  const router = useRouter();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [selectedHourlyIndex, setSelectedHourlyIndex] = useState(0);
  const [searchError, setSearchError] = useState('');

  // Load weather on component mount
  useEffect(() => {
    loadWeather();
  }, []);

  // Get weather by coordinates
  const getWeatherByCoordinates = async (latitude, longitude) => {
    try {
      const response = await axios.get(`${WEATHER_API_BASE}/forecast`, {
        params: {
          latitude: latitude,
          longitude: longitude,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m',
          hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
          timezone: 'auto',
          forecast_days: 7
        }
      });
      
      return formatWeatherData(response.data);
    } catch (error) {
      console.error('Weather API error:', error);
      throw error;
    }
  };

  // Get weather by city name - IMPROVED with better search
  const getWeatherByCity = async (cityName) => {
    try {
      // First attempt: Direct search with geocoding API
      const geoResponse = await axios.get(`${GEOCODING_API_BASE}/search`, {
        params: {
          name: cityName,
          count: 5,
          language: 'en',
          format: 'json'
        },
        timeout: 10000
      });
      
      if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        // Second attempt: Try with different formatting
        const formattedCity = cityName.trim().replace(/\s+/g, ' ');
        const retryResponse = await axios.get(`${GEOCODING_API_BASE}/search`, {
          params: {
            name: formattedCity,
            count: 5,
            language: 'en',
            format: 'json'
          },
          timeout: 10000
        });
        
        if (!retryResponse.data.results || retryResponse.data.results.length === 0) {
          throw new Error(`City "${cityName}" not found. Please check spelling or try a nearby city.`);
        }
        
        var results = retryResponse.data.results;
      } else {
        var results = geoResponse.data.results;
      }
      
      // Take the best match (first result)
      const { latitude, longitude, name, country, admin1 } = results[0];
      const displayCity = name || cityName;
      const displayRegion = admin1 || country || '';
      
      const weatherData = await getWeatherByCoordinates(latitude, longitude);
      
      return {
        ...weatherData,
        location: { name: displayCity, country: displayRegion, latitude, longitude }
      };
    } catch (error) {
      console.error('Error fetching weather by city:', error.message);
      throw error;
    }
  };

  // Get weather for current location
  const getCurrentLocationWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      const reverseGeo = await Location.reverseGeocodeAsync({ latitude, longitude });
      const cityName = reverseGeo[0]?.city || reverseGeo[0]?.region || reverseGeo[0]?.subregion || '';
      const country = reverseGeo[0]?.country || '';
      
      const weatherData = await getWeatherByCoordinates(latitude, longitude);
      
      return {
        ...weatherData,
        location: { name: cityName || 'Current Location', country, latitude, longitude }
      };
    } catch (error) {
      console.error('Error getting current location weather:', error);
      throw error;
    }
  };

  // Format weather data for display
  const formatWeatherData = (data) => {
    const weatherCodes = getWeatherCodeMapping();
    
    return {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        precipitation: data.current.precipitation,
        rain: data.current.rain,
        weatherCode: data.current.weather_code,
        weatherDescription: weatherCodes[data.current.weather_code]?.description || 'Clear',
        weatherIcon: weatherCodes[data.current.weather_code]?.icon || '☀️'
      },
      hourly: data.hourly.time.map((time, index) => ({
        time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hour: new Date(time).getHours(),
        temperature: Math.round(data.hourly.temperature_2m[index]),
        humidity: data.hourly.relative_humidity_2m[index],
        precipitationProbability: data.hourly.precipitation_probability[index],
        weatherCode: data.hourly.weather_code[index],
        weatherIcon: weatherCodes[data.hourly.weather_code[index]]?.icon || '☀️'
      })),
      daily: data.daily.time.map((time, index) => ({
        date: new Date(time),
        dayName: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
        fullDayName: new Date(time).toLocaleDateString('en-US', { weekday: 'long' }),
        monthDay: new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        maxTemp: Math.round(data.daily.temperature_2m_max[index]),
        minTemp: Math.round(data.daily.temperature_2m_min[index]),
        precipitation: data.daily.precipitation_sum[index],
        weatherCode: data.daily.weather_code[index],
        weatherIcon: weatherCodes[data.daily.weather_code[index]]?.icon || '☀️',
        weatherDescription: weatherCodes[data.daily.weather_code[index]]?.description || 'Clear'
      }))
    };
  };

  // WMO Weather Interpretation Codes
  const getWeatherCodeMapping = () => {
    return {
      0: { description: 'Clear sky', icon: '☀️' },
      1: { description: 'Mainly clear', icon: '🌤️' },
      2: { description: 'Partly cloudy', icon: '⛅' },
      3: { description: 'Overcast', icon: '☁️' },
      45: { description: 'Foggy', icon: '🌫️' },
      48: { description: 'Fog', icon: '🌫️' },
      51: { description: 'Light drizzle', icon: '🌦️' },
      53: { description: 'Moderate drizzle', icon: '🌧️' },
      55: { description: 'Dense drizzle', icon: '🌧️' },
      61: { description: 'Light rain', icon: '🌦️' },
      63: { description: 'Moderate rain', icon: '🌧️' },
      65: { description: 'Heavy rain', icon: '🌧️' },
      71: { description: 'Light snow', icon: '🌨️' },
      73: { description: 'Moderate snow', icon: '❄️' },
      75: { description: 'Heavy snow', icon: '❄️' },
      95: { description: 'Thunderstorm', icon: '⛈️' },
      96: { description: 'Thunderstorm with hail', icon: '⛈️' },
      99: { description: 'Heavy thunderstorm', icon: '⛈️' }
    };
  };

  // Get travel recommendation based on weather
  const getTravelRecommendation = (weatherCode, temperature) => {
    if (temperature > 35) {
      return { text: '☀️ Extreme heat! Avoid outdoor activities between 11am-3pm.', color: '#FF6B6B' };
    } else if (temperature > 30) {
      return { text: '☀️ Hot! Stay hydrated and use sunscreen.', color: '#FF9800' };
    } else if (temperature < 10) {
      return { text: '❄️ Cold! Wear warm layers and a jacket.', color: '#4A90E2' };
    } else if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
      return { text: '🌧️ Rain expected! Bring an umbrella.', color: '#6B7B8D' };
    } else if ([71, 73, 75, 85, 86].includes(weatherCode)) {
      return { text: '❄️ Snow expected! Drive carefully.', color: '#B0C4DE' };
    } else if ([95, 96, 99].includes(weatherCode)) {
      return { text: '⛈️ Thunderstorms! Stay indoors if possible.', color: '#FF6B6B' };
    } else if (temperature >= 18 && temperature <= 28 && [0, 1, 2].includes(weatherCode)) {
      return { text: '🌿 Perfect weather for outdoor activities!', color: '#4CAF50' };
    }
    return { text: '📍 Check conditions before heading out.', color: '#666' };
  };

  // Load main weather function
  const loadWeather = async () => {
    try {
      setLoading(true);
      setSearchError('');
      let data;
      
      if (useCurrentLocation) {
        try {
          data = await getCurrentLocationWeather();
        } catch (locationError) {
          console.log('Location failed, falling back to default city');
          data = await getWeatherByCity('Colombo');
          Alert.alert('Info', 'Using default location (Colombo). Please enable location services for current weather.');
        }
      } else if (searchCity.trim()) {
        data = await getWeatherByCity(searchCity);
      } else {
        data = await getWeatherByCity('Colombo');
      }
      
      setWeatherData(data);
      setSearchError('');
    } catch (error) {
      console.error('Error loading weather:', error);
      setSearchError(error.message || 'Could not fetch weather data');
      Alert.alert('Weather Error', error.message || 'Could not fetch weather data. Please try another city name.');
      
      // Fallback to default city only if we don't have data
      if (!weatherData) {
        try {
          const fallbackData = await getWeatherByCity('Colombo');
          setWeatherData(fallbackData);
        } catch (e) {
          console.error('Fallback also failed:', e);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWeather();
  };

  const handleSearch = () => {
    if (!searchCity.trim()) {
      Alert.alert('Error', 'Please enter a city name');
      return;
    }
    setUseCurrentLocation(false);
    loadWeather();
  };

  const handleUseCurrentLocation = () => {
    setUseCurrentLocation(true);
    setSearchCity('');
    setSearchError('');
    loadWeather();
  };

  // Render current weather section
  const renderCurrentWeather = () => {
    if (!weatherData) return null;
    
    const { current, location } = weatherData;
    const recommendation = getTravelRecommendation(current.weatherCode, current.temperature);
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
    
    return (
      <View style={styles.currentCard}>
        <View style={styles.cardGradient} />
        <View style={styles.locationHeader}>
          <View>
            <Text style={styles.greeting}>{greeting}!</Text>
            <Text style={styles.locationName}>
              {location?.name || 'Current Location'}
              {location?.country && `, ${location.country}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={22} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tempSection}>
          <Text style={styles.temperature}>{current.temperature}°</Text>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherIcon}>{current.weatherIcon}</Text>
            <Text style={styles.weatherDesc}>{current.weatherDescription}</Text>
          </View>
          <Text style={styles.feelsLike}>Feels like {current.feelsLike}°</Text>
        </View>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Ionicons name="water-outline" size={24} color="#007AFF" />
            <Text style={styles.detailValue}>{current.humidity}%</Text>
            <Text style={styles.detailLabel}>Humidity</Text>
          </View>
          <View style={styles.detailCard}>
            <Ionicons name="wind-outline" size={24} color="#007AFF" />
            <Text style={styles.detailValue}>{current.windSpeed} km/h</Text>
            <Text style={styles.detailLabel}>Wind Speed</Text>
          </View>
          {current.precipitation > 0 && (
            <View style={styles.detailCard}>
              <Ionicons name="rainy-outline" size={24} color="#007AFF" />
              <Text style={styles.detailValue}>{current.precipitation} mm</Text>
              <Text style={styles.detailLabel}>Rainfall</Text>
            </View>
          )}
        </View>
        
        <View style={[styles.recommendationCard, { backgroundColor: recommendation.color + '20' }]}>
          <Text style={[styles.recommendationText, { color: recommendation.color }]}>
            {recommendation.text}
          </Text>
        </View>
      </View>
    );
  };

  // Render hourly forecast
  const renderHourlyForecast = () => {
    if (!weatherData?.hourly) return null;
    
    const hourlyData = weatherData.hourly.slice(0, 12);
    const currentHour = new Date().getHours();
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Hourly Forecast</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hourlyScrollContent}
        >
          {hourlyData.map((hour, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.hourlyCard,
                currentHour === hour.hour && styles.hourlyCardCurrent
              ]}
              onPress={() => setSelectedHourlyIndex(index)}
            >
              <Text style={[
                styles.hourlyTime,
                currentHour === hour.hour && styles.hourlyTextCurrent
              ]}>{hour.time}</Text>
              <Text style={styles.hourlyIcon}>{hour.weatherIcon}</Text>
              <Text style={styles.hourlyTemp}>{hour.temperature}°</Text>
              {hour.precipitationProbability > 0 && (
                <Text style={styles.precipProb}>{hour.precipitationProbability}%</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render daily forecast
  const renderDailyForecast = () => {
    if (!weatherData?.daily) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>7-Day Forecast</Text>
        {weatherData.daily.map((day, index) => (
          <View key={index} style={styles.dailyCard}>
            <View style={styles.dailyLeft}>
              <Text style={styles.dailyDay}>{day.dayName}</Text>
              <Text style={styles.dailyDate}>{day.monthDay}</Text>
            </View>
            
            <View style={styles.dailyCenter}>
              <Text style={styles.dailyIcon}>{day.weatherIcon}</Text>
              <Text style={styles.dailyDesc} numberOfLines={1}>{day.weatherDescription}</Text>
            </View>
            
            <View style={styles.dailyRight}>
              <Text style={styles.dailyHigh}>{day.maxTemp}°</Text>
              <Text style={styles.dailyLow}>{day.minTemp}°</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render weather highlights
  const renderHighlights = () => {
    if (!weatherData?.current) return null;
    
    const { current } = weatherData;
    const sunrise = "6:00 AM";
    const sunset = "6:00 PM";
    const uvIndex = "7";
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Weather Highlights</Text>
        <View style={styles.highlightsGrid}>
          <View style={styles.highlightCard}>
            <Ionicons name="sunny-outline" size={28} color="#FF9800" />
            <Text style={styles.highlightValue}>UV Index {uvIndex}</Text>
            <Text style={styles.highlightLabel}>High</Text>
          </View>
          <View style={styles.highlightCard}>
            <Ionicons name="eye-outline" size={28} color="#007AFF" />
            <Text style={styles.highlightValue}>10 km</Text>
            <Text style={styles.highlightLabel}>Visibility</Text>
          </View>
          <View style={styles.highlightCard}>
            <Ionicons name="compass-outline" size={28} color="#007AFF" />
            <Text style={styles.highlightValue}>{current.windDirection}°</Text>
            <Text style={styles.highlightLabel}>Wind Direction</Text>
          </View>
          <View style={styles.highlightCard}>
            <Ionicons name="cloud-outline" size={28} color="#007AFF" />
            <Text style={styles.highlightValue}>{current.humidity}%</Text>
            <Text style={styles.highlightLabel}>Humidity</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !weatherData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Fetching weather data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Hero Section - Centered Heading */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Weather Forecast 🌦️</Text>
        <View style={styles.titleUnderline}>
          
        </View>
        <Text style={styles.heroSubtitle}>
          Plan your day with accurate weather updates and travel recommendations
        </Text>
      </View>

      {/* Enhanced Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchIconWrapper}>
            <Ionicons name="search-outline" size={20} color="#fff" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search any city worldwide..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchCity}
            onChangeText={setSearchCity}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchCity.length > 0 && (
            <TouchableOpacity onPress={() => setSearchCity('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.locationButton, useCurrentLocation && styles.locationButtonActive]}
          onPress={handleUseCurrentLocation}
        >
          <Ionicons name="location" size={20} color={useCurrentLocation ? '#fff' : '#007AFF'} />
          <Text style={[styles.locationButtonText, useCurrentLocation && styles.locationButtonTextActive]}>
            Current
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderCurrentWeather()}
        {renderHourlyForecast()}
        {renderDailyForecast()}
        {renderHighlights()}
        
        {/* Travel Tip */}
        <View style={styles.tipContainer}>
          <Ionicons name="bulb-outline" size={24} color="#FFD700" />
          <Text style={styles.tipTitle}>Travel Tip</Text>
          <Text style={styles.tipText}>
            Plan your outdoor activities based on the weather forecast. 
            Early mornings usually offer the best conditions for sightseeing and photography.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  // Hero Section Styles
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'black',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  titleUnderline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  underlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  underlineLine: {
    width: 40,
    height: 2,
    backgroundColor: '#007AFF',
    marginHorizontal: 6,
    borderRadius: 1,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Enhanced Search Section Styles
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIconWrapper: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e8f5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  locationButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#007AFF',
  },
  locationButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  currentCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#007AFF',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  refreshBtn: {
    padding: 8,
  },
  tempSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  temperature: {
    fontSize: 72,
    fontWeight: '300',
    color: '#007AFF',
    marginBottom: 10,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  weatherIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  weatherDesc: {
    fontSize: 16,
    color: '#666',
  },
  feelsLike: {
    fontSize: 14,
    color: '#999',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  detailCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 16,
    minWidth: 90,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recommendationCard: {
    padding: 12,
    borderRadius: 16,
  },
  recommendationText: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  hourlyScrollContent: {
    paddingRight: 10,
  },
  hourlyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hourlyCardCurrent: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  hourlyTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  hourlyTextCurrent: {
    color: '#007AFF',
    fontWeight: '600',
  },
  hourlyIcon: {
    fontSize: 24,
    marginVertical: 5,
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  precipProb: {
    fontSize: 10,
    color: '#007AFF',
    marginTop: 2,
  },
  dailyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dailyLeft: {
    width: 70,
  },
  dailyDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dailyDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  dailyCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dailyIcon: {
    fontSize: 24,
  },
  dailyDesc: {
    fontSize: 12,
    color: '#666',
  },
  dailyRight: {
    flexDirection: 'row',
    gap: 12,
  },
  dailyHigh: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dailyLow: {
    fontSize: 14,
    color: '#999',
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  highlightCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    width: (SCREEN_WIDTH - 42) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  highlightLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tipContainer: {
    margin: 16,
    padding: 15,
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginVertical: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});