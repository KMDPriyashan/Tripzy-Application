import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Import Supabase functions with correct path
import BottomNav from "../../components/BottomNav";
import {
  getPopularLocations,
  searchDatabaseLocations,
  supabase,
} from "../../lib/supabase";
const mapPage = () => {
  const router = useRouter();
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [travelMode, setTravelMode] = useState("driving");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentLocationText, setCurrentLocationText] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [showAddDestination, setShowAddDestination] = useState(false);
  const [newDestination, setNewDestination] = useState("");
  const [routeDetails, setRouteDetails] = useState(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
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
    temp: "26°C",
    condition: "Mostly clear",
  });
  const [trafficInfo, setTrafficInfo] = useState("Light traffic in this area");

  // Load popular locations on mount
  useEffect(() => {
    loadPopularLocations();
  }, []);

  const loadPopularLocations = async () => {
    try {
      setLoadingPopular(true);
      const popular = await getPopularLocations(8);
      console.log("Loaded popular locations:", popular?.length || 0);
      setPopularLocations(popular || []);
    } catch (error) {
      console.error("Error loading popular locations:", error);
      setPopularLocations([]);
    } finally {
      setLoadingPopular(false);
    }
  };

  const locationImages = {
    sigiriya:
      "https://images.unsplash.com/photo-1580794749460-76f97b7180d8?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c2lnaXJpeWF8ZW58MHx8MHx8fDA%3D",
    balloon:
      "https://images.unsplash.com/photo-1497531551184-06b252e1bee1?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG90JTIwYWlyJTIwYmFsbG9ufGVufDB8fDB8fHww",
    sinharaja:
      "https://plus.unsplash.com/premium_photo-1730078556315-9ca0a48965ec?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c2luaGFyYWphJTIwcmFpbiUyMGZvcmVzdCUyMGxhbmRzY2FwZXxlbnwwfHwwfHx8MA%3D%3D",
    arugambay:
      "https://images.unsplash.com/photo-1507296993015-167a20c29988?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YXJ1Z2FtJTIwYmF5fGVufDB8fDB8fHww",
    ella: "https://images.unsplash.com/photo-1566766189268-ecac9118f2b7?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmluZSUyMGFyY2glMjBicmlkZ2V8ZW58MHx8MHx8fDA%3D",
    HortanPlains:
      "https://unsplash.com/photos/a-close-up-of-a-deer-in-a-field-with-trees-in-the-background-Ab8_tnImnvI",
    yala: "https://plus.unsplash.com/premium_photo-1661832611972-b6ee1aba3581?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8eWFsYSUyMG5hdGlvbmFsJTIwcGFya3xlbnwwfHwwfHx8MA%3D%3D",
    default:
      "https://images.unsplash.com/photo-1550505537-88544e390c5c?q=80&w=600",
  };

  const getPhoto = (name) => {
    const n = name.toLowerCase();
    // Location name eke sigiriya, ella wage keyword ekak thiyenawada balanawa
    const key = Object.keys(locationImages).find((k) => n.includes(k));
    return locationImages[key] || locationImages["default"];
  };
  // Search locations from database
  const searchLocations = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearching(true);

    try {
      const dbResults = await searchDatabaseLocations(query);

      if (dbResults && dbResults.length > 0) {
        const formattedDbResults = dbResults.map((loc) => ({
          id: loc.id,
          name: loc.name,
          address:
            loc.address || `${loc.city || loc.district || ""}, Sri Lanka`,
          latitude: parseFloat(loc.latitude),
          longitude: parseFloat(loc.longitude),
          source: "database",
          rating: loc.rating,
          category: loc.category,
          city: loc.city,
          district: loc.district,
          search_relevance: loc.search_relevance || 0,
        }));
        setSearchResults(formattedDbResults);
        setShowSearchResults(formattedDbResults.length > 0);
      } else {
        // Fallback to Google
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=AIzaSyATaHyVUefyJpWAOKlBAOONPWb4JiOpLlk`,
          );

          const data = await response.json();

          if (data.status === "OK" && data.results && data.results.length > 0) {
            const googleResults = data.results.slice(0, 5).map((place) => ({
              id: place.place_id,
              name: place.name,
              address: place.formatted_address,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              source: "google",
              types: place.types,
              rating: place.rating,
            }));
            setSearchResults(googleResults);
            setShowSearchResults(googleResults.length > 0);
          } else {
            setSearchResults([]);
            setShowSearchResults(false);
          }
        } catch (error) {
          setSearchResults([]);
          setShowSearchResults(false);
        }
      }
    } catch (error) {
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearching(false);
    }
  };

  // Handle text input change with debounce
  const handleSearchChange = (text, inputType) => {
    setSearchQuery(text);
    setSelectedInput(inputType);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (text.trim().length >= 2) {
        searchLocations(text);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500);
  };

  // Select a location from search results
  const selectLocation = (location) => {
    if (selectedInput === "from") {
      setFromLocation(location.name);
    } else if (selectedInput === "to") {
      setToLocation(location.name);
    } else if (selectedInput === "waypoint") {
      setWaypoints([
        ...waypoints,
        {
          id: Date.now(),
          name: location.name,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          source: location.source,
        },
      ]);
      setShowAddDestination(false);
    }

    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedInput(null);
  };

  const clearSearchResults = () => {
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedInput(null);
    setSearchQuery("");
  };

  const getTravelModeParam = () => {
    const modeMap = {
      driving: { ios: "d", android: "d", param: "driving" },
      walking: { ios: "w", android: "w", param: "walking" },
      transit: { ios: "r", android: "r", param: "transit" },
      cycling: { ios: "b", android: "b", param: "bicycling" },
    };
    return modeMap[travelMode];
  };

  const getTravelModeInfo = () => {
    const info = {
      driving: { label: "Driving", googleMode: "driving", emoji: "🚗" },
      walking: { label: "Walking", googleMode: "walking", emoji: "🚶" },
      transit: { label: "Transit", googleMode: "transit", emoji: "🚌" },
      cycling: { label: "Biking", googleMode: "bicycling", emoji: "🚲" },
    };
    return info[travelMode];
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Allow location permission to use current location",
        );
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
        const locationString = `${address.city || address.district || ""}, ${address.country || ""}`;
        setCurrentLocationText(locationString);
        setFromLocation(locationString);
      } else {
        setFromLocation(
          `${location.coords.latitude}, ${location.coords.longitude}`,
        );
      }

      setUseCurrentLocation(true);
    } catch (error) {
      Alert.alert("Error", "Unable to get current location");
    }
  };

  const clearCurrentLocation = () => {
    setUseCurrentLocation(false);
    setFromLocation("");
    setCurrentLocationText("");
  };

  const addWaypoint = () => {
    if (newDestination.trim()) {
      setWaypoints([
        ...waypoints,
        {
          id: Date.now(),
          name: newDestination,
          address: newDestination,
        },
      ]);
      setNewDestination("");
      setShowAddDestination(false);
      setSearchResults([]);
      setShowSearchResults(false);
    } else {
      Alert.alert("Error", "Please enter a destination");
    }
  };

  const removeWaypoint = (id) => {
    setWaypoints(waypoints.filter((wp) => wp.id !== id));
  };

  const calculateRoute = () => {
    if (!fromLocation || !toLocation) {
      Alert.alert("Error", "Please enter start and destination");
      return;
    }

    const modeInfo = getTravelModeInfo();

    const baseTimes = {
      driving: "7 hr 27 min",
      walking: "2 days 4 hr",
      transit: "8 hr 45 min",
      cycling: "14 hr 30 min",
    };

    const distances = {
      driving: "366 km",
      walking: "352 km",
      transit: "368 km",
      cycling: "366 km",
    };

    let extraTime = "";
    if (waypoints.length > 0) {
      extraTime = ` + ${waypoints.length * 30} min for stops`;
    }

    setRouteDetails({
      duration: baseTimes[travelMode] + extraTime,
      distance: distances[travelMode],
      route:
        travelMode === "walking"
          ? "via pedestrian paths"
          : travelMode === "cycling"
            ? "via bike lanes"
            : travelMode === "transit"
              ? "via public transport"
              : "via Outer Circular Exp/EO2",
      traffic:
        travelMode === "walking"
          ? "Walking route with sidewalks"
          : travelMode === "cycling"
            ? "Bike-friendly route"
            : travelMode === "transit"
              ? "Bus and train connections"
              : "Fastest route, usual traffic",
      tolls: travelMode === "driving",
      mode: modeInfo.label,
      emoji: modeInfo.emoji,
      stops: waypoints.length,
    });
  };

  const openGoogleMapsDirections = () => {
    if (!toLocation.trim()) {
      Alert.alert("Error", "Please enter destination");
      return;
    }

    let from = fromLocation.trim();
    if (!from) {
      from = "Current+Location";
    }

    const modeInfo = getTravelModeInfo();
    const modeParam = getTravelModeParam();

    let allDestinations = [from];
    waypoints.forEach((waypoint) => {
      allDestinations.push(waypoint.name);
    });
    allDestinations.push(toLocation);

    const encodedDestinations = allDestinations
      .map((dest) => encodeURIComponent(dest))
      .join("/");

    let url;

    if (Platform.OS === "ios") {
      if (waypoints.length > 0) {
        const waypointsString = waypoints
          .map((wp) => encodeURIComponent(wp.name))
          .join("|");
        url = `maps://app?saddr=${encodeURIComponent(from)}&daddr=${encodeURIComponent(toLocation)}&waypoints=${waypointsString}&dirflg=${modeParam.ios}`;
      } else {
        url = `maps://app?saddr=${encodeURIComponent(from)}&daddr=${encodeURIComponent(toLocation)}&dirflg=${modeParam.ios}`;
      }
    } else {
      url = `https://www.google.com/maps/dir/${encodedDestinations}`;

      if (modeParam.android === "w") {
        url += "/data=!4m2!4m1!3e1";
      } else if (modeParam.android === "b") {
        url += "/data=!4m2!4m1!3e2";
      } else if (modeParam.android === "r") {
        url += "/data=!4m2!4m1!3e3";
      } else {
        url += "/data=!4m2!4m1!3e0";
      }
    }

    let message = `Get ${modeInfo.label.toLowerCase()} directions:\n\n`;
    message += `From: ${from}\n`;
    if (waypoints.length > 0) {
      message += `Stops:\n`;
      waypoints.forEach((wp, idx) => {
        message += `   ${idx + 1}. ${wp.name}\n`;
      });
    }
    message += `To: ${toLocation}\n\n`;
    message += `Total: ${waypoints.length + 2} locations`;

    Alert.alert("Open Google Maps", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open",
        onPress: () => {
          Linking.openURL(url).catch(() => {
            Linking.openURL(
              `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(toLocation)}`,
            );
          });
        },
      },
    ]);
  };

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from("locations").select("count");
      if (error) {
        Alert.alert("Database Error", error.message);
      } else {
        Alert.alert("Success", "Database connected successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to database");
    }
  };

  const renderSearchResults = () => {
    if (!showSearchResults || searchResults.length === 0 || !selectedInput)
      return null;

    return (
      <View style={styles.searchResultsPanel}>
        <View style={styles.searchResultsHeader}>
          <Text style={styles.searchResultsTitle}>
            Search results ({searchResults.length} found)
          </Text>
          <TouchableOpacity onPress={clearSearchResults}>
            <Text style={styles.clearResultsText}>Close</Text>
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
              {item.source === "database" && (
                <Text style={styles.databaseBadge}>Saved</Text>
              )}
            </View>
            <Text style={styles.searchResultAddress} numberOfLines={1}>
              {item.address}
            </Text>
            {item.rating && (
              <Text style={styles.searchResultRating}>
                ⭐ Rating: {item.rating}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Map Enhance</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={testDatabaseConnection}
                style={styles.testButton}
              >
                <Text style={styles.testButtonText}>Test DB</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Search along the route</Text>
        <Text style={styles.subtitle}>
          Better Location, Finding Everything!
        </Text>

        {/* Best Travel Modes */}
        <View style={styles.modeContainer}>
          <Text style={styles.sectionTitle}>Select Travel Mode</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                travelMode === "driving" && styles.modeActive,
              ]}
              onPress={() => {
                setTravelMode("driving");
                setRouteDetails(null);
              }}
            >
              <Text style={styles.modeIcon}>🚗</Text>
              <Text
                style={[
                  styles.modeText,
                  travelMode === "driving" && styles.modeTextActive,
                ]}
              >
                Drive
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                travelMode === "walking" && styles.modeActive,
              ]}
              onPress={() => {
                setTravelMode("walking");
                setRouteDetails(null);
              }}
            >
              <Text style={styles.modeIcon}>🚶</Text>
              <Text
                style={[
                  styles.modeText,
                  travelMode === "walking" && styles.modeTextActive,
                ]}
              >
                Walk
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                travelMode === "transit" && styles.modeActive,
              ]}
              onPress={() => {
                setTravelMode("transit");
                setRouteDetails(null);
              }}
            >
              <Text style={styles.modeIcon}>🚌</Text>
              <Text
                style={[
                  styles.modeText,
                  travelMode === "transit" && styles.modeTextActive,
                ]}
              >
                Transit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                travelMode === "cycling" && styles.modeActive,
              ]}
              onPress={() => {
                setTravelMode("cycling");
                setRouteDetails(null);
              }}
            >
              <Text style={styles.modeIcon}>🚲</Text>
              <Text
                style={[
                  styles.modeText,
                  travelMode === "cycling" && styles.modeTextActive,
                ]}
              >
                Bike
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* From Location with Search */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Starting Point</Text>
          <View style={styles.locationInputWrapper}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              placeholder="Enter starting point..."
              placeholderTextColor="#92A2C6"
              value={fromLocation}
              onChangeText={(text) => {
                setFromLocation(text);
                if (!useCurrentLocation) {
                  handleSearchChange(text, "from");
                }
              }}
              editable={!useCurrentLocation}
              onFocus={() => {
                if (!useCurrentLocation) {
                  setSelectedInput("from");
                  if (fromLocation && fromLocation.length >= 2) {
                    searchLocations(fromLocation);
                  }
                }
              }}
            />
            <TouchableOpacity
              style={[
                styles.currentLocationButton,
                useCurrentLocation && styles.currentLocationActive,
              ]}
              onPress={
                useCurrentLocation ? clearCurrentLocation : getCurrentLocation
              }
            >
              <Text style={styles.currentLocationText}>📍</Text>
            </TouchableOpacity>
          </View>
          {useCurrentLocation && currentLocationText ? (
            <Text style={styles.locationHint}>
              Using Current Location: {currentLocationText}
            </Text>
          ) : null}

          {renderSearchResults()}

          {searching && selectedInput === "from" && (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="small" color="#0056D2" />
              <Text style={styles.searchingText}>Searching locations...</Text>
            </View>
          )}
        </View>

        {/* Waypoints */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Stops along the route</Text>
          {waypoints.length > 0 && (
            <Text style={styles.stopCount}>
              {waypoints.length} stop(s) added
            </Text>
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
            <Text style={styles.addStopText}>+ Add intermediate stop</Text>
          </TouchableOpacity>
        </View>

        {/* To Location with Search */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="Where are you going?"
            placeholderTextColor="#92A2C6"
            value={toLocation}
            onChangeText={(text) => {
              setToLocation(text);
              handleSearchChange(text, "to");
            }}
            onFocus={() => {
              setSelectedInput("to");
              if (toLocation && toLocation.length >= 2) {
                searchLocations(toLocation);
              }
            }}
          />

          {renderSearchResults()}

          {searching && selectedInput === "to" && (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="small" color="#0056D2" />
              <Text style={styles.searchingText}>Searching locations...</Text>
            </View>
          )}
        </View>

        {/* Popular Locations Quick Select */}
        {!loadingPopular &&
          popularLocations.length > 0 &&
          !showSearchResults && (
            <View style={styles.popularContainer}>
              <Text style={styles.popularTitle}>Popular Places</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.popularScroll}
              >
                {popularLocations.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.popularItem}
                    onPress={() => setToLocation(location.name)}
                  >
                    <Image
                      source={{ uri: getPhoto(location.name) }} // Meka dan dynamic wada karanawa
                      style={styles.popularImage}
                      resizeMode="cover"
                    />
                    <View style={styles.popularTextContainer}>
                      <Text style={styles.popularName} numberOfLines={1}>
                        {location.name}
                      </Text>
                    </View>
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
            <Text style={styles.trafficText}>Traffic: {trafficInfo}</Text>
            <Text style={styles.trafficSubText}>Updated just now</Text>
          </View>
        </View>

        {/* Route Details */}
        {routeDetails && (
          <View style={styles.routeDetails}>
            <Text style={styles.routeTitle}>
              {routeDetails.emoji} {routeDetails.mode} Route Details
            </Text>
            <Text style={styles.routeMain}>{routeDetails.duration}</Text>
            <Text style={styles.routeText}>{routeDetails.distance}</Text>
            <Text style={styles.routeText}>Via {routeDetails.route}</Text>
            <Text style={styles.routeText}>{routeDetails.traffic}</Text>
            {routeDetails.stops > 0 && (
              <Text style={styles.routeStops}>
                {routeDetails.stops} stop(s) along the route
              </Text>
            )}
            {routeDetails.tolls && (
              <Text style={styles.routeToll}>This route has tolls.</Text>
            )}
          </View>
        )}

        {/* Buttons */}
        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateRoute}
        >
          <Text style={styles.calculateButtonText}>Preview Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.directionsButton}
          onPress={openGoogleMapsDirections}
        >
          <Text style={styles.directionsButtonText}>
            Get {getTravelModeInfo().label} Directions
          </Text>
        </TouchableOpacity>

        {/* Bottom padding for navigation bar */}
        <View style={styles.bottomPadding} />

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
                placeholderTextColor="#92A2C6"
                value={newDestination}
                onChangeText={(text) => {
                  setNewDestination(text);
                  if (text.trim().length >= 2) {
                    searchLocations(text);
                    setSelectedInput("waypoint");
                  } else {
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }
                }}
                onFocus={() => {
                  setSelectedInput("waypoint");
                  if (newDestination && newDestination.length >= 2) {
                    searchLocations(newDestination);
                  }
                }}
              />

              {/* Search Results in Modal */}
              {searchResults.length > 0 && selectedInput === "waypoint" && (
                <View style={styles.modalResults}>
                  <Text style={styles.modalResultsTitle}>
                    Select from search results:
                  </Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {searchResults.slice(0, 5).map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.modalResultItem}
                        onPress={() => selectLocation(item)}
                      >
                        <Text style={styles.modalResultName}>{item.name}</Text>
                        <Text
                          style={styles.modalResultAddress}
                          numberOfLines={1}
                        >
                          {item.address}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {searching && selectedInput === "waypoint" && (
                <View style={styles.searchingContainer}>
                  <ActivityIndicator size="small" color="#0056D2" />
                  <Text style={styles.searchingText}>Searching...</Text>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => {
                    setShowAddDestination(false);
                    setSearchResults([]);
                    setShowSearchResults(false);
                    setNewDestination("");
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalAdd} onPress={addWaypoint}>
                  <Text style={styles.modalAddText}>Add Stop</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
};

// 🎨 Vibrant Blue Theme StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F6FF", // Light blue tinted background
  },
  header: {
    backgroundColor: "#0056D2", // Deep vibrant blue
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  testButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D4E4FF",
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
    color: "#1A365D", // Dark navy for contrast
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#4A6583",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1A365D",
  },
  modeContainer: {
    marginBottom: 25,
  },
  modeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modeButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D4E4FF",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  modeActive: {
    backgroundColor: "#0056D2",
    borderColor: "#0056D2",
    shadowOpacity: 0.2,
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  modeText: {
    fontSize: 13,
    color: "#4A6583",
    fontWeight: "600",
  },
  modeTextActive: {
    color: "#FFFFFF",
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1A365D",
  },
  locationInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationInput: {
    flex: 1,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D4E4FF",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#1A365D",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  currentLocationButton: {
    backgroundColor: "#FFFFFF",
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D4E4FF",
  },
  currentLocationActive: {
    backgroundColor: "#E6F0FF",
    borderColor: "#0056D2",
  },
  currentLocationText: {
    fontSize: 22, // Size of the 📍 icon
  },
  locationHint: {
    fontSize: 12,
    color: "#0056D2",
    marginTop: 8,
    marginLeft: 4,
    fontWeight: "600",
  },
  stopCount: {
    fontSize: 13,
    color: "#0056D2",
    marginBottom: 10,
    fontWeight: "600",
  },
  waypointItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#D4E4FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  waypointNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#0056D2",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "bold",
    marginRight: 12,
    fontSize: 13,
  },
  waypointText: {
    flex: 1,
    fontSize: 15,
    color: "#1A365D",
    fontWeight: "500",
  },
  removeWaypoint: {
    fontSize: 18,
    color: "#FF3B30",
    paddingHorizontal: 8,
    fontWeight: "bold",
  },
  addStopButton: {
    marginTop: 4,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#E6F0FF",
    borderRadius: 12,
  },
  addStopText: {
    color: "#0056D2",
    fontSize: 15,
    fontWeight: "700",
  },
  popularContainer: {
    marginTop: 4,
    marginBottom: 24,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
    color: "#1A365D",
  },
  popularScroll: {
    flexDirection: "row",
  },
  popularItem: {
    width: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#D4E4FF",
    overflow: "hidden",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  popularImage: {
    width: "100%",
    height: 100,
  },
  popularTextContainer: {
    padding: 12,
  },
  popularName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A365D",
    marginBottom: 4,
  },
  popularAddress: {
    fontSize: 12,
    color: "#4A6583",
    fontWeight: "500",
  },
  infoPanel: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#D4E4FF",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0056D2",
  },
  weatherCondition: {
    fontSize: 13,
    color: "#4A6583",
    marginTop: 4,
    fontWeight: "500",
  },
  trafficInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  trafficText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A365D",
  },
  trafficSubText: {
    fontSize: 12,
    color: "#6B829D",
    marginTop: 4,
  },
  routeDetails: {
    backgroundColor: "#E6F0FF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#0056D2",
  },
  routeTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0056D2",
    marginBottom: 12,
  },
  routeMain: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A365D",
    marginBottom: 6,
  },
  routeText: {
    fontSize: 15,
    color: "#4A6583",
    marginBottom: 6,
    fontWeight: "500",
  },
  routeStops: {
    fontSize: 14,
    color: "#1A365D",
    fontWeight: "700",
    marginTop: 8,
  },
  routeToll: {
    fontSize: 14,
    color: "#FF9500",
    fontWeight: "700",
    marginTop: 8,
  },
  calculateButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#0056D2",
  },
  calculateButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0056D2",
  },
  directionsButton: {
    backgroundColor: "#0056D2",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  directionsButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(26, 54, 93, 0.6)", // Deep blue overlay
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#F0F6FF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A365D",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D4E4FF",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#1A365D",
    marginBottom: 16,
  },
  modalResults: {
    maxHeight: 220,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#D4E4FF",
  },
  modalResultsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A6583",
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  modalResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F6FF",
  },
  modalResultName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A365D",
    marginBottom: 4,
  },
  modalResultAddress: {
    fontSize: 13,
    color: "#6B829D",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D4E4FF",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A6583",
  },
  modalAdd: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#0056D2",
    alignItems: "center",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modalAddText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  searchResultsPanel: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D4E4FF",
    overflow: "hidden",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  searchResultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F8FAFF",
    borderBottomWidth: 1,
    borderBottomColor: "#D4E4FF",
  },
  searchResultsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A6583",
  },
  clearResultsText: {
    fontSize: 13,
    color: "#FF3B30",
    fontWeight: "700",
  },
  searchResultItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F6FF",
  },
  searchResultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  searchResultName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1A365D",
  },
  databaseBadge: {
    fontSize: 11,
    backgroundColor: "#E6F0FF",
    color: "#0056D2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "600",
    overflow: "hidden",
  },
  searchResultAddress: {
    fontSize: 13,
    color: "#6B829D",
  },
  searchResultRating: {
    fontSize: 12,
    color: "#FF9500",
    marginTop: 6,
    fontWeight: "600",
  },
  searchingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 10,
  },
  searchingText: {
    fontSize: 14,
    color: "#4A6583",
    fontWeight: "500",
  },
  bottomPadding: {
    height: 90,
  },
});

export default mapPage;
