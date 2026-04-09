import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Import Supabase functions with correct path
import { getPopularLocations, searchDatabaseLocations, supabase } from '../../lib/supabase';

const mapPage = () => {
  const router = useRouter();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [travelMode, setTravelMode] = useState('driving');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentLocationText, setCurrentLocationText] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [showAddDestination, setShowAddDestination] = useState(false);
  const [newDestination, setNewDestination] = useState('');
  const [routeDetails, setRouteDetails] = useState(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedInput, setSelectedInput] = useState(null);
  const searchTimeout = useRef(null);
  
  // Popular locations state
  const [popularLocations, setPopularLocations] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  
  // Weather and traffic info
  const [weatherInfo, setWeatherInfo] = useState({
    temp: '26°C',
    condition: 'Mostly clear'
  });
  const [trafficInfo, setTrafficInfo] = useState('Light traffic in this area');

  // Load popular locations on mount
  useEffect(() => {
    loadPopularLocations();
  }, []);

  const loadPopularLocations = async () => {
    try {
      setLoadingPopular(true);
      const popular = await getPopularLocations(8);
      console.log('Loaded popular locations:', popular?.length || 0);
      setPopularLocations(popular || []);
    } catch (error) {
      console.error('Error loading popular locations:', error);
      setPopularLocations([]);
    } finally {
      setLoadingPopular(false);
    }
  };

  // Updated searchLocations function with better error handling
  const searchLocations = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearching(true);
    const allResults = [];

    try {
      console.log('Searching for:', query);
      
      // 1. Search in Supabase Database
      const dbResults = await searchDatabaseLocations(query);
      console.log('Database results count:', dbResults?.length || 0);
      
      if (dbResults && dbResults.length > 0) {
        const formattedDbResults = dbResults.map(loc => ({
          id: loc.id,
          name: loc.name,
          address: loc.address || `${loc.city || loc.district || ''}, Sri Lanka`,
          latitude: parseFloat(loc.latitude),
          longitude: parseFloat(loc.longitude),
          source: 'database',
          rating: loc.rating,
          category: loc.category,
          city: loc.city,
          district: loc.district,
          search_relevance: loc.search_relevance || 0
        }));
        allResults.push(...formattedDbResults);
      }

      // 2. Search in Google Places API (only if no database results)
      if (allResults.length === 0) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=AIzaSyATaHyVUefyJpWAOKlBAOONPWb4JiOpLlk`
          );
          
          const data = await response.json();
          
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            const googleResults = data.results.slice(0, 5).map(place => ({
              id: place.place_id,
              name: place.name,
              address: place.formatted_address,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              source: 'google',
              types: place.types,
              rating: place.rating
            }));
            allResults.push(...googleResults);
          }
        } catch (error) {
          console.error('Google search error:', error);
        }
      }

      // Sort and set results
      allResults.sort((a, b) => {
        if (a.source === 'database' && b.source !== 'database') return -1;
        if (a.source !== 'database' && b.source === 'database') return 1;
        if (a.source === 'database' && b.source === 'database') {
          return (b.search_relevance || 0) - (a.search_relevance || 0);
        }
        return 0;
      });

      const finalResults = allResults.slice(0, 10);
      setSearchResults(finalResults);
      setShowSearchResults(finalResults.length > 0);
      
      if (finalResults.length === 0 && allResults.length === 0) {
        // Show local suggestions as fallback
        getLocalSuggestions(query);
      }
    } catch (error) {
      console.error('Search error:', error);
      getLocalSuggestions(query);
    } finally {
      setSearching(false);
    }
  };

  // Local suggestions as fallback
  const getLocalSuggestions = (query) => {
    const localPlaces = [
      { id: '1', name: 'Gampaha Town', address: 'Gampaha, Sri Lanka', latitude: 7.0908, longitude: 80.0056 },
      { id: '2', name: 'Henerathgoda Botanical Garden', address: 'Gampaha, Sri Lanka', latitude: 7.1011, longitude: 80.0156 },
      { id: '3', name: 'Gampaha Wickramarachchi University', address: 'Gampaha, Sri Lanka', latitude: 7.0875, longitude: 80.0117 },
      { id: '4', name: 'Gampaha Railway Station', address: 'Gampaha, Sri Lanka', latitude: 7.0897, longitude: 80.0100 },
      { id: '5', name: 'Kandy City Center', address: 'Kandy, Sri Lanka', latitude: 7.2914, longitude: 80.6386 },
      { id: '6', name: 'Galle Fort', address: 'Galle, Sri Lanka', latitude: 6.0275, longitude: 80.2183 },
      { id: '7', name: 'Colombo City Center', address: 'Colombo, Sri Lanka', latitude: 6.9271, longitude: 79.8612 },
      { id: '8', name: 'Temple of the Tooth', address: 'Kandy, Sri Lanka', latitude: 7.2936, longitude: 80.6414 },
    ];
    
    const filtered = localPlaces.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.address.toLowerCase().includes(query.toLowerCase())
    );
    
    const formattedResults = filtered.map(place => ({
      ...place,
      source: 'local',
      rating: 4.0
    }));
    
    setSearchResults(formattedResults);
    setShowSearchResults(formattedResults.length > 0);
  };

  // Handle text input change with debounce
  const handleSearchChange = (text, inputType) => {
    setSearchQuery(text);
    setSelectedInput(inputType);
    setShowSearchResults(true); // Keep results visible while typing
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      searchLocations(text);
    }, 500);
  };

  // Select a location from search results
  const selectLocation = (location) => {
    if (selectedInput === 'from') {
      setFromLocation(location.name);
    } else if (selectedInput === 'to') {
      setToLocation(location.name);
    } else if (selectedInput === 'waypoint') {
      setWaypoints([...waypoints, { 
        id: Date.now(), 
        name: location.name, 
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        source: location.source
      }]);
      setShowAddDestination(false);
    }
    
    // Clear search results after selection
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedInput(null);
  };

  // Clear search results (for cancel button)
  const clearSearchResultsManually = () => {
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedInput(null);
    setSearchQuery('');
  };

  // Travel mode mapping
  const getTravelModeParam = () => {
    const modeMap = {
      driving: { ios: 'd', android: 'd', param: 'driving' },
      walking: { ios: 'w', android: 'w', param: 'walking' },
      transit: { ios: 'r', android: 'r', param: 'transit' },
      cycling: { ios: 'b', android: 'b', param: 'bicycling' }
    };
    return modeMap[travelMode];
  };

  const getTravelModeInfo = () => {
    const info = {
      driving: { icon: '🚗', label: 'Driving', googleMode: 'driving' },
      walking: { icon: '🚶', label: 'Walking', googleMode: 'walking' },
      transit: { icon: '🚌', label: 'Transit', googleMode: 'transit' },
      cycling: { icon: '🚲', label: 'Biking', googleMode: 'bicycling' }
    };
    return info[travelMode];
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location permission to use current location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationString = `${address.city || address.district || ''}, ${address.country || ''}`;
        setCurrentLocationText(locationString);
        setFromLocation(locationString);
      } else {
        setFromLocation(`${location.coords.latitude}, ${location.coords.longitude}`);
      }
      
      setUseCurrentLocation(true);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Unable to get current location');
    }
  };

  const clearCurrentLocation = () => {
    setUseCurrentLocation(false);
    setFromLocation('');
    setCurrentLocationText('');
  };

  const addWaypoint = () => {
    if (newDestination.trim()) {
      setWaypoints([...waypoints, { id: Date.now(), name: newDestination, address: newDestination }]);
      setNewDestination('');
      setShowAddDestination(false);
    } else {
      Alert.alert('Error', 'Please enter a destination');
    }
  };

  const removeWaypoint = (id) => {
    setWaypoints(waypoints.filter(wp => wp.id !== id));
  };

  const calculateRoute = () => {
    if (!fromLocation || !toLocation) {
      Alert.alert('Error', 'Please enter start and destination');
      return;
    }

    const modeInfo = getTravelModeInfo();
    
    const baseTimes = {
      driving: '7 hr 27 min',
      walking: '2 days 4 hr',
      transit: '8 hr 45 min',
      cycling: '14 hr 30 min'
    };

    const distances = {
      driving: '366 km',
      walking: '352 km',
      transit: '368 km',
      cycling: '366 km'
    };

    let extraTime = '';
    if (waypoints.length > 0) {
      extraTime = ` + ${waypoints.length * 30} min for stops`;
    }

    setRouteDetails({
      duration: baseTimes[travelMode] + extraTime,
      distance: distances[travelMode],
      route: travelMode === 'walking' ? 'via pedestrian paths' : 
             travelMode === 'cycling' ? 'via bike lanes' :
             travelMode === 'transit' ? 'via public transport' : 
             'via Outer Circular Exp/EO2',
      traffic: travelMode === 'walking' ? 'Walking route with sidewalks' :
               travelMode === 'cycling' ? 'Bike-friendly route' :
               travelMode === 'transit' ? 'Bus and train connections' :
               'Fastest route, the usual traffic',
      tolls: travelMode === 'driving' ? true : false,
      mode: modeInfo.label,
      stops: waypoints.length
    });
  };

  const openGoogleMapsDirections = () => {
    if (!toLocation.trim()) {
      Alert.alert('Error', 'Please enter destination');
      return;
    }

    let from = fromLocation.trim();
    if (!from) {
      from = 'Current+Location';
    }

    const modeInfo = getTravelModeInfo();
    const modeParam = getTravelModeParam();

    let allDestinations = [from];
    waypoints.forEach(waypoint => {
      allDestinations.push(waypoint.name);
    });
    allDestinations.push(toLocation);
    
    const encodedDestinations = allDestinations.map(dest => encodeURIComponent(dest)).join('/');
    
    let url;
    
    if (Platform.OS === 'ios') {
      if (waypoints.length > 0) {
        const waypointsString = waypoints.map(wp => encodeURIComponent(wp.name)).join('|');
        url = `maps://app?saddr=${encodeURIComponent(from)}&daddr=${encodeURIComponent(toLocation)}&waypoints=${waypointsString}&dirflg=${modeParam.ios}`;
      } else {
        url = `maps://app?saddr=${encodeURIComponent(from)}&daddr=${encodeURIComponent(toLocation)}&dirflg=${modeParam.ios}`;
      }
    } else {
      url = `https://www.google.com/maps/dir/${encodedDestinations}`;
      
      if (modeParam.android === 'w') {
        url += '/data=!4m2!4m1!3e1';
      } else if (modeParam.android === 'b') {
        url += '/data=!4m2!4m1!3e2';
      } else if (modeParam.android === 'r') {
        url += '/data=!4m2!4m1!3e3';
      } else {
        url += '/data=!4m2!4m1!3e0';
      }
    }
    
    let message = `Get ${modeInfo.label.toLowerCase()} directions:\n\n`;
    message += `📍 From: ${from}\n`;
    if (waypoints.length > 0) {
      message += `🛑 Stops:\n`;
      waypoints.forEach((wp, idx) => {
        message += `   ${idx + 1}. ${wp.name}\n`;
      });
    }
    message += `🎯 To: ${toLocation}\n\n`;
    message += `Total: ${waypoints.length + 2} locations`;
    
    Alert.alert('Open Google Maps', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => {
        Linking.openURL(url).catch(() => {
          Linking.openURL(`https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(toLocation)}`);
        });
      }}
    ]);
  };

  // Debug button to test database connection
  const testDatabaseConnection = async () => {
    console.log('🔍 Testing database connection...');
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('count');
      
      if (error) {
        console.error('Database error:', error);
        Alert.alert('Database Error', error.message);
      } else {
        console.log('Database connected!');
        Alert.alert('Success', 'Database connected successfully!');
      }
      
      const popular = await getPopularLocations(5);
      console.log('Popular locations:', popular);
      
    } catch (error) {
      console.error('Connection test failed:', error);
      Alert.alert('Error', 'Failed to connect to database');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map Enhance</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={testDatabaseConnection} style={styles.testButton}>
            <Text style={styles.testButtonText}>🔧</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Search along the route...</Text>
        <Text style={styles.subtitle}>📍 Better Location, Finding Everything!</Text>

        {/* Best Travel Modes */}
        <View style={styles.modeContainer}>
          <Text style={styles.sectionTitle}>Best travel modes</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity 
              style={[styles.modeButton, travelMode === 'driving' && styles.modeActive]}
              onPress={() => { setTravelMode('driving'); setRouteDetails(null); }}
            >
              <Text style={styles.modeIcon}>🚗</Text>
              <Text style={[styles.modeText, travelMode === 'driving' && styles.modeTextActive]}>Drive</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modeButton, travelMode === 'walking' && styles.modeActive]}
              onPress={() => { setTravelMode('walking'); setRouteDetails(null); }}
            >
              <Text style={styles.modeIcon}>🚶</Text>
              <Text style={[styles.modeText, travelMode === 'walking' && styles.modeTextActive]}>Walk</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modeButton, travelMode === 'transit' && styles.modeActive]}
              onPress={() => { setTravelMode('transit'); setRouteDetails(null); }}
            >
              <Text style={styles.modeIcon}>🚌</Text>
              <Text style={[styles.modeText, travelMode === 'transit' && styles.modeTextActive]}>Transit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modeButton, travelMode === 'cycling' && styles.modeActive]}
              onPress={() => { setTravelMode('cycling'); setRouteDetails(null); }}
            >
              <Text style={styles.modeIcon}>🚲</Text>
              <Text style={[styles.modeText, travelMode === 'cycling' && styles.modeTextActive]}>Bike</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* From Location with Search */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>From 🚀</Text>
          <View style={styles.locationInputWrapper}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              placeholder="Enter starting point..."
              placeholderTextColor="#999"
              value={fromLocation}
              onChangeText={(text) => {
                setFromLocation(text);
                handleSearchChange(text, 'from');
              }}
              editable={!useCurrentLocation}
              onFocus={() => {
                if (!useCurrentLocation) {
                  setSelectedInput('from');
                  if (fromLocation) handleSearchChange(fromLocation, 'from');
                }
              }}
            />
            <TouchableOpacity 
              style={styles.currentLocationButton}
              onPress={useCurrentLocation ? clearCurrentLocation : getCurrentLocation}
            >
              <Text style={styles.currentLocationText}>📍</Text>
            </TouchableOpacity>
          </View>
          {useCurrentLocation && currentLocationText ? (
            <Text style={styles.locationHint}>Using: {currentLocationText}</Text>
          ) : null}
          
          {/* Search Results for "From" Section */}
          {showSearchResults && selectedInput === 'from' && searchResults.length > 0 && (
            <View style={styles.searchResultsPanel}>
              <View style={styles.searchResultsHeader}>
                <Text style={styles.searchResultsTitle}>
                  {searchResults.filter(r => r.source === 'database').length > 0 ? 
                    '📍 From your saved places' : '📍 Search results'}
                </Text>
                <TouchableOpacity onPress={clearSearchResultsManually}>
                  <Text style={styles.clearResultsText}>✕ Cancel</Text>
                </TouchableOpacity>
              </View>
              {searchResults.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.searchResultItem}
                  onPress={() => selectLocation(item)}
                >
                  <View style={styles.searchResultHeader}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    {item.source === 'database' && (
                      <Text style={styles.databaseBadge}>📌 Saved</Text>
                    )}
                  </View>
                  <Text style={styles.searchResultAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                  {item.rating && (
                    <Text style={styles.searchResultRating}>⭐ {item.rating}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {searching && selectedInput === 'from' && (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.searchingText}>Searching locations...</Text>
            </View>
          )}
        </View>

        {/* Waypoints */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Stops along the route 🛑</Text>
          {waypoints.length > 0 && (
            <Text style={styles.stopCount}>{waypoints.length} stop(s) added</Text>
          )}
          {waypoints.map((waypoint, index) => (
            <View key={waypoint.id} style={styles.waypointItem}>
              <Text style={styles.waypointNumber}>{index + 1}</Text>
              <Text style={styles.waypointText}>{waypoint.name}</Text>
              <TouchableOpacity onPress={() => removeWaypoint(waypoint.id)}>
                <Text style={styles.removeWaypoint}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addStopButton}
            onPress={() => setShowAddDestination(true)}
          >
            <Text style={styles.addStopText}>+ Add destination</Text>
          </TouchableOpacity>
        </View>

        {/* To Location with Search */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>To 🎯</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter destination..."
            placeholderTextColor="#999"
            value={toLocation}
            onChangeText={(text) => {
              setToLocation(text);
              handleSearchChange(text, 'to');
            }}
            onFocus={() => {
              setSelectedInput('to');
              if (toLocation) handleSearchChange(toLocation, 'to');
            }}
          />
          
          {/* Search Results for "To" Section */}
          {showSearchResults && selectedInput === 'to' && searchResults.length > 0 && (
            <View style={styles.searchResultsPanel}>
              <View style={styles.searchResultsHeader}>
                <Text style={styles.searchResultsTitle}>
                  {searchResults.filter(r => r.source === 'database').length > 0 ? 
                    '📍 From your saved places' : '📍 Search results'}
                </Text>
                <TouchableOpacity onPress={clearSearchResultsManually}>
                  <Text style={styles.clearResultsText}>✕ Cancel</Text>
                </TouchableOpacity>
              </View>
              {searchResults.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.searchResultItem}
                  onPress={() => selectLocation(item)}
                >
                  <View style={styles.searchResultHeader}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    {item.source === 'database' && (
                      <Text style={styles.databaseBadge}>📌 Saved</Text>
                    )}
                  </View>
                  <Text style={styles.searchResultAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                  {item.rating && (
                    <Text style={styles.searchResultRating}>⭐ {item.rating}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {searching && selectedInput === 'to' && (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.searchingText}>Searching locations...</Text>
            </View>
          )}
        </View>

        {/* Popular Locations Quick Select */}
        {!loadingPopular && popularLocations.length > 0 && !showSearchResults && (
          <View style={styles.popularContainer}>
            <Text style={styles.popularTitle}>📍 Popular Places</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.popularScroll}
            >
              {popularLocations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={styles.popularItem}
                  onPress={() => {
                    setToLocation(location.name);
                    setRouteDetails(null);
                  }}
                >
                  <Text style={styles.popularIcon}>
                    {location.category === 'restaurant' ? '🍽️' :
                     location.category === 'hospital' ? '🏥' :
                     location.category === 'hotel' ? '🏨' :
                     location.category === 'park' ? '🌳' :
                     location.category === 'shopping_mall' ? '🛍️' :
                     location.category === 'temple' ? '🛕' : '📍'}
                  </Text>
                  <Text style={styles.popularName}>{location.name}</Text>
                  <Text style={styles.popularAddress} numberOfLines={1}>
                    {location.city || location.district || 'Sri Lanka'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Weather & Traffic Info */}
        <View style={styles.infoPanel}>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherTemp}>{weatherInfo.temp}</Text>
            <Text style={styles.weatherCondition}>{weatherInfo.condition}</Text>
          </View>
          <View style={styles.trafficInfo}>
            <Text style={styles.trafficText}>🚦 {trafficInfo}</Text>
            <Text style={styles.trafficSubText}>Updated just now</Text>
          </View>
        </View>

        {/* Route Details */}
        {routeDetails && (
          <View style={styles.routeDetails}>
            <Text style={styles.routeTitle}>
              {routeDetails.mode} Route Details {routeDetails.mode === 'Walking' ? '🚶' : routeDetails.mode === 'Biking' ? '🚲' : routeDetails.mode === 'Transit' ? '🚌' : '🚗'}
            </Text>
            <Text style={styles.routeMain}>{routeDetails.duration}</Text>
            <Text style={styles.routeText}>{routeDetails.distance}</Text>
            <Text style={styles.routeText}>via {routeDetails.route}</Text>
            <Text style={styles.routeText}>{routeDetails.traffic}</Text>
            {routeDetails.stops > 0 && (
              <Text style={styles.routeStops}>📍 {routeDetails.stops} stop(s) along the route</Text>
            )}
            {routeDetails.tolls && <Text style={styles.routeToll}>This route has tolls.</Text>}
          </View>
        )}

        {/* Buttons */}
        <TouchableOpacity style={styles.calculateButton} onPress={calculateRoute}>
          <Text style={styles.calculateButtonText}>Preview Route</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.directionsButton} onPress={openGoogleMapsDirections}>
          <Text style={styles.directionsButtonText}>
            {getTravelModeInfo().icon} Get {getTravelModeInfo().label} Directions
          </Text>
        </TouchableOpacity>

        {/* Add Destination Modal */}
        <Modal
          visible={showAddDestination}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Destination</Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Enter destination name..."
                value={newDestination}
                onChangeText={(text) => {
                  setNewDestination(text);
                  handleSearchChange(text, 'waypoint');
                }}
                onFocus={() => setSelectedInput('waypoint')}
              />
              
              {searchResults.length > 0 && selectedInput === 'waypoint' && (
                <View style={styles.modalResults}>
                  {searchResults.slice(0, 3).map((item) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.modalResultItem}
                      onPress={() => selectLocation(item)}
                    >
                      <Text style={styles.modalResultName}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAddDestination(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalAdd} onPress={addWaypoint}>
                  <Text style={styles.modalAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  testButtonText: {
    fontSize: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modeContainer: {
    marginBottom: 25,
  },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modeActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  modeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  modeTextActive: {
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInput: {
    flex: 1,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  currentLocationButton: {
    backgroundColor: '#f0f0f0',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currentLocationText: {
    fontSize: 24,
  },
  locationHint: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 5,
    marginLeft: 5,
  },
  stopCount: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 8,
  },
  waypointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  waypointNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: 'bold',
    marginRight: 12,
  },
  waypointText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  removeWaypoint: {
    fontSize: 18,
    color: '#ff4444',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  addStopButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 10,
    borderStyle: 'dashed',
    marginTop: 5,
  },
  addStopText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  popularContainer: {
    marginBottom: 20,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  popularScroll: {
    flexDirection: 'row',
  },
  popularItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  popularIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  popularName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  popularAddress: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  searchResultsPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultsTitle: {
    fontSize: 12,
    color: '#666',
  },
  clearResultsText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  databaseBadge: {
    fontSize: 10,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  searchResultAddress: {
    fontSize: 12,
    color: '#666',
  },
  searchResultRating: {
    fontSize: 11,
    color: '#FFB800',
    marginTop: 4,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 10,
  },
  searchingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  infoPanel: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 12,
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherCondition: {
    fontSize: 14,
    color: '#666',
  },
  trafficInfo: {
    marginTop: 4,
  },
  trafficText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ff6b6b',
    marginBottom: 4,
  },
  trafficSubText: {
    fontSize: 11,
    color: '#888',
  },
  routeDetails: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  routeMain: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  routeText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  routeStops: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 5,
    fontWeight: '500',
  },
  routeToll: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 5,
    fontWeight: '500',
  },
  calculateButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  directionsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  directionsButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalResults: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 15,
  },
  modalResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalResultName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
  },
  modalAdd: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalAddText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default mapPage;