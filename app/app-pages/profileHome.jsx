import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import BottomNav from "../../components/BottomNav";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

// ─── THEME ────────────────────────────────────────
const C = {
  bg: "#F4F7FF",
  white: "#FFFFFF",
  navy: "#0A1F44",
  blue: "#1877f2",
  blueSoft: "#EAF0FF",
  blueLight: "#5B9BFF",
  blueMid: "#D0E2FF",
  text: "#0A1F44",
  textMuted: "#6B80A3",
};

// ─── World Countries List ─────────────────────────
const WORLD_COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Congo-Brazzaville)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

// ─── Animated floating orb ──────────────────────
const FloatOrb = ({ style, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });
  return <Animated.View style={[style, { transform: [{ translateY }] }]} />;
};

// ─── Main ─────────────────────────────────────────
const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("traveller"); // 'traveller' or 'guide'
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Top-right menu & info pages
  const [menuVisible, setMenuVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    push: true,
    email: true,
    tripReminders: true,
    promotions: false,
  });

  // Travel statistics editing
  const [countriesModalVisible, setCountriesModalVisible] = useState(false);
  const [tripsModalVisible, setTripsModalVisible] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countrySearch, setCountrySearch] = useState("");

  // Trip history (Add Trip + Travel Days)
  const [trips, setTrips] = useState([]);
  const [tripDestination, setTripDestination] = useState("");
  const [tripDaysInput, setTripDaysInput] = useState("");
  const [tripHistoryModalVisible, setTripHistoryModalVisible] = useState(false);

  // Account & security
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  // User Profile Data
  const [userProfile, setUserProfile] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    emailVisibility: "private",
    phoneVisibility: "private",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    coverImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    bio: "Travel enthusiast exploring the world",
    location: "New York, USA",
    joinDate: "",
    totalTrips: 0,
    countriesVisited: 0,
    travelDays: 0,
    favoriteDestination: "",
    nextDestination: "",
    selectedCountries: [],
    trips: [],
  });

  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    email: "",
    phone: "",
    emailVisibility: "private",
    phoneVisibility: "private",
    favoriteDestination: "",
    nextDestination: "",
  });

  // Tour Guide Profile Data
  const [tourGuideProfile, setTourGuideProfile] = useState(null);
  const [hasTourGuideProfile, setHasTourGuideProfile] = useState(false);

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const pillFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCurrentUser();
    loadUserProfile();
    checkTourGuideProfile();
    loadNotificationSettings();

    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.timing(pillFade, {
        toValue: 1,
        duration: 600,
        delay: 380,
        useNativeDriver: true,
      }),
    ]).start();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
        loadUserProfile();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        router.replace("/loginpage");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const getCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("currentUser");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUserProfile(parsedUser);
        setSelectedCountries(parsedUser.selectedCountries || []);
        setTrips(parsedUser.trips || []);
        setEditForm({
          name: parsedUser.name || "",
          username: parsedUser.username || "",
          bio: parsedUser.bio || "",
          location: parsedUser.location || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
          emailVisibility: parsedUser.emailVisibility || "private",
          phoneVisibility: parsedUser.phoneVisibility || "private",
          favoriteDestination: parsedUser.favoriteDestination || "",
          nextDestination: parsedUser.nextDestination || "",
        });
      } else if (user) {
        // Create default profile
        const defaultProfile = {
          id: user.id,
          name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Traveler",
          username: user.email?.split("@")[0] || "traveler",
          email: user.email || "",
          phone: "",
          emailVisibility: "private",
          phoneVisibility: "private",
          avatar: "https://randomuser.me/api/portraits/men/1.jpg",
          coverImage:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
          bio: "Travel enthusiast exploring the world",
          location: "New York, USA",
          joinDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          }),
          totalTrips: 0,
          countriesVisited: 0,
          travelDays: 0,
          favoriteDestination: "",
          nextDestination: "",
          selectedCountries: [],
          trips: [],
        };
        setUserProfile(defaultProfile);
        setSelectedCountries([]);
        setTrips([]);
        await AsyncStorage.setItem(
          "currentUser",
          JSON.stringify(defaultProfile),
        );
        setEditForm({
          name: defaultProfile.name,
          username: defaultProfile.username,
          bio: defaultProfile.bio,
          location: defaultProfile.location,
          email: defaultProfile.email,
          phone: defaultProfile.phone,
          emailVisibility: defaultProfile.emailVisibility,
          phoneVisibility: defaultProfile.phoneVisibility,
          favoriteDestination: "",
          nextDestination: "",
        });
      }
    } catch (error) {
      console.log("Error loading user profile:", error);
    }
  };

  const checkTourGuideProfile = async () => {
    try {
      const savedGuide = await AsyncStorage.getItem("tourGuideProfile");
      if (savedGuide) {
        setTourGuideProfile(JSON.parse(savedGuide));
        setHasTourGuideProfile(true);
      }
    } catch (error) {
      console.log("Error checking tour guide profile:", error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("notificationSettings");
      if (saved) {
        setNotificationSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.log("Error loading notification settings:", error);
    }
  };

  const toggleNotification = async (key) => {
    try {
      const updated = {
        ...notificationSettings,
        [key]: !notificationSettings[key],
      };
      setNotificationSettings(updated);
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(updated),
      );
    } catch (error) {
      console.log("Error updating notification settings:", error);
    }
  };

  const persistProfile = async (updatedProfile) => {
    try {
      setUserProfile(updatedProfile);
      await AsyncStorage.setItem("currentUser", JSON.stringify(updatedProfile));
    } catch (error) {
      console.log("Error saving profile:", error);
    }
  };

  const toggleCountry = async (country) => {
    let updatedCountries;
    if (selectedCountries.includes(country)) {
      updatedCountries = selectedCountries.filter((c) => c !== country);
    } else {
      updatedCountries = [...selectedCountries, country];
    }
    setSelectedCountries(updatedCountries);
    const updatedProfile = {
      ...userProfile,
      selectedCountries: updatedCountries,
      countriesVisited: updatedCountries.length,
    };
    await persistProfile(updatedProfile);
  };

  const handleAddTrip = async () => {
    if (!tripDestination.trim()) {
      Alert.alert(
        "Missing destination",
        "Please enter the destination/country you visited",
      );
      return;
    }
    const days = parseInt(tripDaysInput, 10);
    if (!days || days <= 0) {
      Alert.alert(
        "Invalid number",
        "Please enter a valid number of travel days",
      );
      return;
    }

    const newTrip = {
      id: Date.now().toString(),
      destination: tripDestination.trim(),
      days,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };

    const updatedTrips = [newTrip, ...trips];
    setTrips(updatedTrips);

    // Automatically add the destination to visited countries if it matches
    let updatedCountries = selectedCountries;
    const matchedCountry = WORLD_COUNTRIES.find(
      (c) => c.toLowerCase() === tripDestination.trim().toLowerCase(),
    );
    if (matchedCountry && !selectedCountries.includes(matchedCountry)) {
      updatedCountries = [...selectedCountries, matchedCountry];
      setSelectedCountries(updatedCountries);
    }

    const updatedProfile = {
      ...userProfile,
      trips: updatedTrips,
      totalTrips: updatedTrips.length,
      travelDays: (userProfile.travelDays || 0) + days,
      selectedCountries: updatedCountries,
      countriesVisited: updatedCountries.length,
    };
    await persistProfile(updatedProfile);
    setTripDestination("");
    setTripDaysInput("");
    setTripsModalVisible(false);
  };

  const handleSaveProfile = async () => {
    setIsEditing(true);
    try {
      const updatedProfile = {
        ...userProfile,
        name: editForm.name,
        username: editForm.username,
        bio: editForm.bio,
        location: editForm.location,
        email: editForm.email,
        phone: editForm.phone,
        emailVisibility: editForm.emailVisibility,
        phoneVisibility: editForm.phoneVisibility,
        favoriteDestination: editForm.favoriteDestination,
        nextDestination: editForm.nextDestination,
      };

      setUserProfile(updatedProfile);
      await AsyncStorage.setItem("currentUser", JSON.stringify(updatedProfile));
      setEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.log("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters long",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      Alert.alert("Success", "Your password has been updated.");
      setNewPassword("");
      setConfirmPassword("");
      setChangePasswordModalVisible(false);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setLogoutConfirmVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const navigateToTourGuideProfile = () => {
    if (hasTourGuideProfile) {
      router.push("/app-pages/TourGuideList");
    } else {
      router.push("/app-pages/TGprofile");
    }
  };

  if (loading)
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>Tripzy</Text>
        <ActivityIndicator size="large" color={C.blue} />
      </View>
    );

  if (!user)
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>Tripzy</Text>
        <TouchableOpacity
          style={styles.splashBtn}
          onPress={() => router.push("/app-pages/TGprofile")}
        >
          <Text style={styles.splashBtnText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );

  const firstName = (userProfile.name || "Traveler").split(" ")[0];

  const filteredCountries = WORLD_COUNTRIES.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  // Small inline helper for rendering the Public / Only Me privacy toggle
  const renderPrivacyToggle = (field) => (
    <View style={styles.privacyToggleRow}>
      <TouchableOpacity
        style={[
          styles.privacyOption,
          editForm[field] === "public" && styles.privacyOptionActive,
        ]}
        onPress={() => setEditForm({ ...editForm, [field]: "public" })}
      >
        <Text
          style={[
            styles.privacyOptionText,
            editForm[field] === "public" && styles.privacyOptionTextActive,
          ]}
        >
          🌐 Public
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.privacyOption,
          editForm[field] === "private" && styles.privacyOptionActive,
        ]}
        onPress={() => setEditForm({ ...editForm, [field]: "private" })}
      >
        <Text
          style={[
            styles.privacyOptionText,
            editForm[field] === "private" && styles.privacyOptionTextActive,
          ]}
        >
          🔒 Only Me
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ══ HERO ══════════════════════════════ */}
        <View style={styles.hero}>
          <FloatOrb delay={0} style={styles.orbA} />
          <FloatOrb delay={600} style={styles.orbB} />
          <FloatOrb delay={300} style={styles.orbC} />

          <Animated.View
            style={[
              styles.topBar,
              { opacity: heroFade, transform: [{ translateY: heroSlide }] },
            ]}
          >
            <Animated.Text
              style={[styles.logoText, { transform: [{ scale: logoScale }] }]}
            >
              Tripzy
            </Animated.Text>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => setMenuVisible(true)}
            >
              <Text style={styles.menuDots}>⋯</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.welcomePill, { opacity: pillFade }]}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>Welcome back, {firstName}! 🌍</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: heroFade,
              transform: [{ translateY: heroSlide }],
            }}
          >
            <Text style={styles.heroH1}>Your Journey{"\n"}Your Way.</Text>
            <Text style={styles.heroSub}>
              Explore, plan, and connect with fellow travelers.
            </Text>
          </Animated.View>
        </View>

        {/* ══ TAB SELECTOR ══════════════════════ */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "traveller" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("traveller")}
          >
            <Text
              style={[
                styles.tabIcon,
                selectedTab === "traveller" && styles.activeTabIcon,
              ]}
            >
              ✈️
            </Text>
            <Text
              style={[
                styles.tabText,
                selectedTab === "traveller" && styles.activeTabText,
              ]}
            >
              Traveller
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "guide" && styles.activeTab]}
            onPress={() => setSelectedTab("guide")}
          >
            <Text
              style={[
                styles.tabIcon,
                selectedTab === "guide" && styles.activeTabIcon,
              ]}
            >
              👨‍✈️
            </Text>
            <Text
              style={[
                styles.tabText,
                selectedTab === "guide" && styles.activeTabText,
              ]}
            >
              Tour Guide
            </Text>
          </TouchableOpacity>
        </View>

        {/* ══ TRAVELLER SECTION ══════════════════════ */}
        {selectedTab === "traveller" && (
          <View style={styles.sectionContainer}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <Image
                source={{ uri: userProfile.coverImage }}
                style={styles.coverImage}
              />
              <View style={styles.profileInfoWrapper}>
                <Image
                  source={{ uri: userProfile.avatar }}
                  style={styles.profileAvatarLarge}
                />
                <Text style={styles.profileName}>{userProfile.name}</Text>
                <Text style={styles.profileUsername}>
                  @{userProfile.username}
                </Text>
                <Text style={styles.profileBio}>{userProfile.bio}</Text>

                <TouchableOpacity
                  style={styles.editProfileBtn}
                  onPress={() => setEditModalVisible(true)}
                >
                  <Text style={styles.editProfileBtnText}>✏️ Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Travel Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>📊 Travel Statistics</Text>
              <View style={styles.statsGrid}>
                <TouchableOpacity
                  style={styles.statBox}
                  activeOpacity={0.6}
                  onPress={() => setTripsModalVisible(true)}
                >
                  <Text style={styles.statValue}>{userProfile.totalTrips}</Text>
                  <Text style={styles.statLabelSm}>Total Trips</Text>
                </TouchableOpacity>
                <View style={styles.statDividerV} />
                <TouchableOpacity
                  style={styles.statBox}
                  activeOpacity={0.6}
                  onPress={() => setCountriesModalVisible(true)}
                >
                  <Text style={styles.statValue}>
                    {userProfile.countriesVisited}
                  </Text>
                  <Text style={styles.statLabelSm}>Countries</Text>
                </TouchableOpacity>
                <View style={styles.statDividerV} />
                <TouchableOpacity
                  style={styles.statBox}
                  activeOpacity={0.6}
                  onPress={() => setTripHistoryModalVisible(true)}
                >
                  <Text style={styles.statValue}>{userProfile.travelDays}</Text>
                  <Text style={styles.statLabelSm}>Travel Days</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Destinations */}
            {(userProfile.favoriteDestination ||
              userProfile.nextDestination) && (
              <View style={styles.destinationsCard}>
                <Text style={styles.cardTitle}>🎯 Destinations</Text>
                {userProfile.favoriteDestination && (
                  <View style={styles.destinationRow}>
                    <Text style={styles.destinationIcon}>⭐</Text>
                    <Text style={styles.destinationLabel}>Favorite:</Text>
                    <Text style={styles.destinationText}>
                      {userProfile.favoriteDestination}
                    </Text>
                  </View>
                )}
                {userProfile.nextDestination && (
                  <View style={styles.destinationRow}>
                    <Text style={styles.destinationIcon}>🎯</Text>
                    <Text style={styles.destinationLabel}>Next:</Text>
                    <Text style={styles.destinationText}>
                      {userProfile.nextDestination}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Location & Join Date */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>{userProfile.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.infoText}>
                  Joined {userProfile.joinDate}
                </Text>
              </View>
              {userProfile.emailVisibility === "public" &&
                userProfile.email && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>✉️</Text>
                    <Text style={styles.infoText}>{userProfile.email}</Text>
                  </View>
                )}
              {userProfile.phoneVisibility === "public" &&
                userProfile.phone && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📞</Text>
                    <Text style={styles.infoText}>{userProfile.phone}</Text>
                  </View>
                )}
            </View>
          </View>
        )}

        {/* ══ TOUR GUIDE SECTION ══════════════════════ */}
        {selectedTab === "guide" && (
          <View style={styles.sectionContainer}>
            {hasTourGuideProfile && tourGuideProfile ? (
              <View style={styles.guideCard}>
                <View
                  style={[styles.guideHeaderCard, { backgroundColor: C.blue }]}
                >
                  <Image
                    source={{
                      uri: tourGuideProfile.avatar || userProfile.avatar,
                    }}
                    style={styles.guideAvatarLarge}
                  />
                  <Text style={styles.guideNameLarge}>
                    {tourGuideProfile.name || userProfile.name}
                  </Text>
                  <View style={styles.guideRatingRow}>
                    <Text style={styles.guideStar}>⭐</Text>
                    <Text style={styles.guideRatingText}>
                      {tourGuideProfile.rating || 4.9} •{" "}
                      {tourGuideProfile.totalTours || 0} tours
                    </Text>
                  </View>
                </View>

                <View style={styles.guideDetailsCard}>
                  <Text style={styles.guideBioLarge}>
                    {tourGuideProfile.bio ||
                      "Professional tour guide ready to show you amazing places!"}
                  </Text>

                  <View style={styles.guideInfoRowCard}>
                    <Text style={styles.guideInfoIcon}>💰</Text>
                    <Text style={styles.guideInfoText}>
                      {tourGuideProfile.price || "$50/day"}
                    </Text>
                  </View>
                  <View style={styles.guideInfoRowCard}>
                    <Text style={styles.guideInfoIcon}>🗣️</Text>
                    <Text style={styles.guideInfoText}>
                      Speaks:{" "}
                      {tourGuideProfile.languages?.join(", ") ||
                        "English, Spanish"}
                    </Text>
                  </View>
                  <View style={styles.guideInfoRowCard}>
                    <Text style={styles.guideInfoIcon}>🎯</Text>
                    <Text style={styles.guideInfoText}>
                      Specializes in:{" "}
                      {tourGuideProfile.specialties?.join(", ") ||
                        "Cultural Tours, Adventure Travel"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.manageGuideBtn}
                    onPress={navigateToTourGuideProfile}
                  >
                    <Text style={styles.manageGuideBtnText}>
                      Manage Guide Profile →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.becomeGuideCard}>
                <View
                  style={[
                    styles.becomeGuideGradient,
                    { backgroundColor: C.blue },
                  ]}
                >
                  <Text style={styles.becomeGuideIcon}>👨‍✈️</Text>
                  <Text style={styles.becomeGuideTitle}>
                    Become a Tour Guide
                  </Text>
                  <Text style={styles.becomeGuideDesc}>
                    Share your local expertise, earn money, and meet travelers
                    from around the world!
                  </Text>
                  <TouchableOpacity
                    style={styles.becomeGuideBtn}
                    onPress={navigateToTourGuideProfile}
                  >
                    <Text style={styles.becomeGuideBtnText}>Get Started →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <BottomNav />

      {/* ══ TOP-RIGHT MENU DROPDOWN ══════════════════ */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setSettingsModalVisible(true);
              }}
            >
              <Text style={styles.menuItemIcon}>⚙️</Text>
              <Text style={styles.menuItemText}>Settings & Privacy</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setTermsModalVisible(true);
              }}
            >
              <Text style={styles.menuItemIcon}>📄</Text>
              <Text style={styles.menuItemText}>Terms & Conditions</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setNotificationsModalVisible(true);
              }}
            >
              <Text style={styles.menuItemIcon}>🔔</Text>
              <Text style={styles.menuItemText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ══ SETTINGS & PRIVACY MODAL ═════════════════ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: C.blue }]}>
              <Text style={styles.modalTitle}>Settings & Privacy</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.infoSectionTitle}>Account</Text>
              <Text style={styles.infoParagraph}>
                Manage your name, username, bio, and travel details from the
                Edit Profile screen. Your account information is used to
                personalize your Tripzy experience.
              </Text>

              <Text style={styles.infoSectionTitle}>Privacy</Text>
              <Text style={styles.infoParagraph}>
                Your profile information, including your travel statistics and
                visited countries, is stored securely on your device and only
                shared with other users when you choose to make your profile
                public as a tour guide. Your email address and phone number are
                only shown to other users if you set them to Public in Edit
                Profile.
              </Text>

              <Text style={styles.infoSectionTitle}>Data & Storage</Text>
              <Text style={styles.infoParagraph}>
                Tripzy stores your preferences locally so your profile and
                statistics are available even when you are offline. You can
                update or reset this information at any time from your profile.
              </Text>

              <Text style={styles.infoSectionTitle}>Security</Text>
              <Text style={styles.infoParagraph}>
                Your account is protected through secure authentication. For
                your safety, never share your login credentials with anyone.
              </Text>

              <Text style={styles.infoSectionTitle}>Account Actions</Text>
              <TouchableOpacity
                style={styles.settingsActionRow}
                onPress={() => {
                  setSettingsModalVisible(false);
                  setChangePasswordModalVisible(true);
                }}
              >
                <Text style={styles.settingsActionIcon}>🔑</Text>
                <Text style={styles.settingsActionText}>Change Password</Text>
                <Text style={styles.settingsActionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingsActionRow, { borderBottomWidth: 0 }]}
                onPress={() => {
                  setSettingsModalVisible(false);
                  setLogoutConfirmVisible(true);
                }}
              >
                <Text style={styles.settingsActionIcon}>🚪</Text>
                <Text
                  style={[styles.settingsActionText, styles.logoutActionText]}
                >
                  Logout
                </Text>
                <Text style={styles.settingsActionArrow}>›</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══ TERMS & CONDITIONS MODAL ═════════════════ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={termsModalVisible}
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: C.blue }]}>
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.infoSectionTitle}>
                1. Acceptance of Terms
              </Text>
              <Text style={styles.infoParagraph}>
                By creating an account and using Tripzy, you agree to be bound
                by these Terms & Conditions. If you do not agree with any part
                of these terms, please discontinue use of the app.
              </Text>

              <Text style={styles.infoSectionTitle}>
                2. User Responsibilities
              </Text>
              <Text style={styles.infoParagraph}>
                You are responsible for keeping your account information
                accurate and up to date. Any travel statistics, profile details,
                or tour guide information you submit should be truthful and
                respectful of other users.
              </Text>

              <Text style={styles.infoSectionTitle}>
                3. Tour Guide Services
              </Text>
              <Text style={styles.infoParagraph}>
                Users who create a tour guide profile are independently
                responsible for the accuracy of their listed services, pricing,
                and availability. Tripzy acts only as a platform connecting
                travelers and guides.
              </Text>

              <Text style={styles.infoSectionTitle}>4. Privacy</Text>
              <Text style={styles.infoParagraph}>
                We respect your privacy and only use your information to provide
                and improve the Tripzy experience, as outlined in our Privacy
                section.
              </Text>

              <Text style={styles.infoSectionTitle}>5. Changes to Terms</Text>
              <Text style={styles.infoParagraph}>
                These terms may be updated from time to time. Continued use of
                Tripzy after any changes constitutes acceptance of the revised
                terms.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══ NOTIFICATIONS MODAL ══════════════════════ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notificationsModalVisible}
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: C.blue }]}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity
                onPress={() => setNotificationsModalVisible(false)}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.notificationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationTitle}>
                    Push Notifications
                  </Text>
                  <Text style={styles.notificationSubtitle}>
                    Get alerts on your device
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.push}
                  onValueChange={() => toggleNotification("push")}
                  trackColor={{ false: C.blueMid, true: C.blue }}
                  thumbColor={C.white}
                />
              </View>

              <View style={styles.notificationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationTitle}>
                    Email Notifications
                  </Text>
                  <Text style={styles.notificationSubtitle}>
                    Receive updates via email
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.email}
                  onValueChange={() => toggleNotification("email")}
                  trackColor={{ false: C.blueMid, true: C.blue }}
                  thumbColor={C.white}
                />
              </View>

              <View style={styles.notificationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationTitle}>Trip Reminders</Text>
                  <Text style={styles.notificationSubtitle}>
                    Reminders about upcoming trips
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.tripReminders}
                  onValueChange={() => toggleNotification("tripReminders")}
                  trackColor={{ false: C.blueMid, true: C.blue }}
                  thumbColor={C.white}
                />
              </View>

              <View style={[styles.notificationRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationTitle}>
                    Promotions & Offers
                  </Text>
                  <Text style={styles.notificationSubtitle}>
                    News, deals, and offers from Tripzy
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.promotions}
                  onValueChange={() => toggleNotification("promotions")}
                  trackColor={{ false: C.blueMid, true: C.blue }}
                  thumbColor={C.white}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══ ADD TRIP MODAL (Total Trips + Travel Days) ══ */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={tripsModalVisible}
        onRequestClose={() => setTripsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContainer}>
            <Text style={styles.smallModalTitle}>Add New Trip</Text>
            <Text style={styles.smallModalSubtitle}>
              Add a trip you've taken. Your total trips, travel days, and
              countries visited will update automatically.
            </Text>

            <Text style={styles.inputLabel}>Destination / Country</Text>
            <TextInput
              style={styles.smallModalInput}
              value={tripDestination}
              onChangeText={setTripDestination}
              placeholder="e.g. Japan"
              autoFocus
            />

            <Text style={styles.inputLabel}>Number of Days</Text>
            <TextInput
              style={styles.smallModalInput}
              value={tripDaysInput}
              onChangeText={setTripDaysInput}
              placeholder="e.g. 7"
              keyboardType="numeric"
            />

            <View style={styles.smallModalBtnRow}>
              <TouchableOpacity
                style={[styles.smallModalBtn, styles.smallModalBtnSecondary]}
                onPress={() => {
                  setTripDestination("");
                  setTripDaysInput("");
                  setTripsModalVisible(false);
                }}
              >
                <Text style={styles.smallModalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallModalBtn, { backgroundColor: C.blue }]}
                onPress={handleAddTrip}
              >
                <Text style={styles.smallModalBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══ TRIP HISTORY MODAL (Travel Days) ════════════ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={tripHistoryModalVisible}
        onRequestClose={() => setTripHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: C.blue }]}>
              <Text style={styles.modalTitle}>Trip History</Text>
              <TouchableOpacity
                onPress={() => setTripHistoryModalVisible(false)}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.selectedCountText}>
                {userProfile.travelDays || 0} total travel days across{" "}
                {trips.length} {trips.length === 1 ? "trip" : "trips"}
              </Text>

              {trips.length === 0 ? (
                <Text style={styles.infoParagraph}>
                  You haven't added any trips yet. Tap "Total Trips" on your
                  profile to add your first trip!
                </Text>
              ) : (
                <FlatList
                  data={trips}
                  keyExtractor={(item) => item.id}
                  style={{ marginTop: 10, maxHeight: 380 }}
                  renderItem={({ item }) => (
                    <View style={styles.tripHistoryRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tripHistoryDestination}>
                          {item.destination}
                        </Text>
                        <Text style={styles.tripHistoryDate}>{item.date}</Text>
                      </View>
                      <Text style={styles.tripHistoryDays}>
                        {item.days} {item.days === 1 ? "day" : "days"}
                      </Text>
                    </View>
                  )}
                />
              )}

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  setTripHistoryModalVisible(false);
                  setTripsModalVisible(true);
                }}
              >
                <View
                  style={[styles.saveBtnGradient, { backgroundColor: C.blue }]}
                >
                  <Text style={styles.saveBtnText}>+ Add Trip</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══ COUNTRIES MODAL ══════════════════════════ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={countriesModalVisible}
        onRequestClose={() => setCountriesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: C.blue }]}>
              <Text style={styles.modalTitle}>Countries Visited</Text>
              <TouchableOpacity onPress={() => setCountriesModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.selectedCountText}>
                {selectedCountries.length}{" "}
                {selectedCountries.length === 1 ? "country" : "countries"}{" "}
                selected
              </Text>
              <TextInput
                style={styles.modalInput}
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholder="Search countries..."
              />
              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item}
                style={{ marginTop: 10, maxHeight: 380 }}
                renderItem={({ item }) => {
                  const isSelected = selectedCountries.includes(item);
                  return (
                    <TouchableOpacity
                      style={styles.countryItem}
                      onPress={() => toggleCountry(item)}
                    >
                      <Text style={styles.countryName}>{item}</Text>
                      <Text
                        style={[
                          styles.countryCheck,
                          !isSelected && { color: C.blueMid },
                        ]}
                      >
                        {isSelected ? "✓" : "○"}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => setCountriesModalVisible(false)}
              >
                <View
                  style={[styles.saveBtnGradient, { backgroundColor: C.blue }]}
                >
                  <Text style={styles.saveBtnText}>Done</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: C.blue }]}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.name}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, name: text })
                }
                placeholder="Enter your full name"
              />

              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.username}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, username: text })
                }
                placeholder="Enter username"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={editForm.bio}
                onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.location}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, location: text })
                }
                placeholder="Your location"
              />

              <Text style={styles.sectionLabel}>Contact Information</Text>
              <Text style={styles.privacyNote}>
                Used for password recovery and account security. Choose who can
                see this information on your profile.
              </Text>

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.email}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, email: text })
                }
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {renderPrivacyToggle("emailVisibility")}

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.phone}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, phone: text })
                }
                placeholder="+1 234 567 8900"
                keyboardType="phone-pad"
              />
              {renderPrivacyToggle("phoneVisibility")}

              <Text style={styles.sectionLabel}>Travel Statistics</Text>

              <Text style={styles.inputLabel}>Total Trips</Text>
              <TouchableOpacity
                style={styles.statEditRow}
                onPress={() => {
                  setEditModalVisible(false);
                  setTripsModalVisible(true);
                }}
              >
                <Text style={styles.statEditValue}>
                  {userProfile.totalTrips || 0}{" "}
                  {userProfile.totalTrips === 1 ? "trip" : "trips"}
                </Text>
                <Text style={styles.statEditAction}>+ Add Trip</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Countries Visited</Text>
              <TouchableOpacity
                style={styles.statEditRow}
                onPress={() => {
                  setEditModalVisible(false);
                  setCountriesModalVisible(true);
                }}
              >
                <Text style={styles.statEditValue}>
                  {userProfile.countriesVisited || 0}{" "}
                  {userProfile.countriesVisited === 1 ? "country" : "countries"}
                </Text>
                <Text style={styles.statEditAction}>Select Countries</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Travel Days</Text>
              <TouchableOpacity
                style={styles.statEditRow}
                onPress={() => {
                  setEditModalVisible(false);
                  setTripHistoryModalVisible(true);
                }}
              >
                <Text style={styles.statEditValue}>
                  {userProfile.travelDays || 0}{" "}
                  {userProfile.travelDays === 1 ? "day" : "days"}
                </Text>
                <Text style={styles.statEditAction}>View Trips</Text>
              </TouchableOpacity>

              <Text style={styles.sectionLabel}>Destinations</Text>

              <Text style={styles.inputLabel}>Favorite Destination</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.favoriteDestination}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, favoriteDestination: text })
                }
                placeholder="Your favorite place"
              />

              <Text style={styles.inputLabel}>Next Destination</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.nextDestination}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, nextDestination: text })
                }
                placeholder="Where to next?"
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                disabled={isEditing}
              >
                <View
                  style={[styles.saveBtnGradient, { backgroundColor: C.blue }]}
                >
                  <Text style={styles.saveBtnText}>
                    {isEditing ? "Saving..." : "Save Changes"}
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══ CHANGE PASSWORD MODAL ════════════════════ */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={changePasswordModalVisible}
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContainer}>
            <Text style={styles.smallModalTitle}>Change Password</Text>
            <Text style={styles.smallModalSubtitle}>
              Enter a new password for your account.
            </Text>

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.smallModalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              autoFocus
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.smallModalInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              secureTextEntry
            />

            <View style={styles.smallModalBtnRow}>
              <TouchableOpacity
                style={[styles.smallModalBtn, styles.smallModalBtnSecondary]}
                onPress={() => {
                  setNewPassword("");
                  setConfirmPassword("");
                  setChangePasswordModalVisible(false);
                }}
              >
                <Text style={styles.smallModalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallModalBtn, { backgroundColor: C.blue }]}
                onPress={handleChangePassword}
                disabled={isChangingPassword}
              >
                <Text style={styles.smallModalBtnText}>
                  {isChangingPassword ? "Saving..." : "Update"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══ LOGOUT CONFIRMATION MODAL ════════════════ */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutConfirmVisible}
        onRequestClose={() => setLogoutConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContainer}>
            <Text style={styles.smallModalTitle}>Log Out</Text>
            <Text style={styles.smallModalSubtitle}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.smallModalBtnRow}>
              <TouchableOpacity
                style={[styles.smallModalBtn, styles.logoutCancelBtn]}
                onPress={() => setLogoutConfirmVisible(false)}
              >
                <Text style={styles.logoutCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallModalBtn, styles.logoutConfirmBtn]}
                onPress={handleLogout}
              >
                <Text style={styles.smallModalBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── STYLES ───────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Splash / loading
  splash: {
    flex: 1,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  splashLogo: {
    fontSize: 58,
    fontWeight: "900",
    color: C.blue,
    fontFamily: "serif",
    letterSpacing: 2,
  },
  splashBtn: {
    backgroundColor: C.blue,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 50,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  splashBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  // Hero
  hero: {
    backgroundColor: C.white,
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 28,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },

  // Orbs
  orbA: {
    position: "absolute",
    top: -48,
    right: -48,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: C.blue,
    opacity: 0.07,
  },
  orbB: {
    position: "absolute",
    bottom: -30,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: C.blueLight,
    opacity: 0.09,
  },
  orbC: {
    position: "absolute",
    top: 110,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.blue,
    opacity: 0.05,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 46,
    fontWeight: "900",
    color: C.blue,
    fontFamily: "serif",
    letterSpacing: 1.5,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.blueMid,
    overflow: "hidden",
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  menuDots: {
    fontSize: 22,
    fontWeight: "900",
    color: C.blue,
    letterSpacing: 2,
  },

  // Welcome pill
  welcomePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.blueSoft,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: C.blueMid,
    gap: 8,
  },
  pillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.blue },
  pillText: {
    color: C.blue,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Hero text
  heroH1: {
    fontSize: 40,
    fontWeight: "900",
    color: C.navy,
    lineHeight: 48,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
    marginBottom: 0,
  },

  // Tab Selector
  tabContainer: {
    flexDirection: "row",
    backgroundColor: C.white,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  activeTab: {
    backgroundColor: C.blue,
  },
  tabIcon: {
    fontSize: 18,
  },
  activeTabIcon: {
    color: C.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.textMuted,
  },
  activeTabText: {
    color: C.white,
  },

  // Section Container
  sectionContainer: {
    padding: 20,
  },

  // Profile Card
  profileCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  coverImage: {
    width: "100%",
    height: 100,
  },
  profileInfoWrapper: {
    alignItems: "center",
    padding: 16,
    marginTop: -40,
  },
  profileAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: C.white,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: C.navy,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: C.textMuted,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: "center",
    marginBottom: 16,
  },
  editProfileBtn: {
    backgroundColor: C.blueSoft,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: C.blueMid,
  },
  editProfileBtnText: {
    color: C.blue,
    fontSize: 14,
    fontWeight: "600",
  },

  // Stats Card
  statsCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.navy,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: C.blue,
    marginBottom: 4,
  },
  statLabelSm: {
    fontSize: 11,
    color: C.textMuted,
  },
  statDividerV: {
    width: 1,
    height: 40,
    backgroundColor: C.blueMid,
  },

  // Destinations Card
  destinationsCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  destinationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  destinationLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.navy,
    marginRight: 8,
  },
  destinationText: {
    fontSize: 13,
    color: C.textMuted,
    flex: 1,
  },

  // Info Card
  infoCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: C.textMuted,
  },

  // Guide Card
  guideCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  guideHeaderCard: {
    alignItems: "center",
    padding: 24,
  },
  guideAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: C.white,
    marginBottom: 12,
  },
  guideNameLarge: {
    fontSize: 22,
    fontWeight: "bold",
    color: C.white,
    marginBottom: 4,
  },
  guideRatingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  guideStar: {
    fontSize: 14,
    marginRight: 4,
    color: "#FFD700",
  },
  guideRatingText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  guideDetailsCard: {
    padding: 20,
  },
  guideBioLarge: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  guideInfoRowCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  guideInfoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  guideInfoText: {
    fontSize: 13,
    color: C.textMuted,
    flex: 1,
  },
  manageGuideBtn: {
    backgroundColor: C.blue,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  manageGuideBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "600",
  },

  // Become Guide Card
  becomeGuideCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  becomeGuideGradient: {
    alignItems: "center",
    padding: 32,
  },
  becomeGuideIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  becomeGuideTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: C.white,
    marginBottom: 8,
  },
  becomeGuideDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  becomeGuideBtn: {
    backgroundColor: C.white,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
  },
  becomeGuideBtnText: {
    color: C.blue,
    fontSize: 16,
    fontWeight: "600",
  },

  // Top-right menu dropdown
  menuOverlay: {
    flex: 1,
    alignItems: "flex-end",
    paddingTop: 104,
    paddingRight: 24,
    backgroundColor: "rgba(10,31,68,0.15)",
  },
  menuDropdown: {
    backgroundColor: C.white,
    borderRadius: 14,
    width: 210,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemIcon: {
    fontSize: 17,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.navy,
  },
  menuDivider: {
    height: 1,
    backgroundColor: C.blueMid,
    marginHorizontal: 8,
  },

  // Info pages (Settings, Terms)
  infoSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: C.navy,
    marginTop: 16,
    marginBottom: 6,
  },
  infoParagraph: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 20,
  },

  // Settings action rows (Change Password / Logout)
  settingsActionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.blueMid,
    gap: 12,
  },
  settingsActionIcon: {
    fontSize: 18,
  },
  settingsActionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: C.navy,
  },
  logoutActionText: {
    color: "#E53935",
  },
  settingsActionArrow: {
    fontSize: 20,
    color: C.textMuted,
  },

  // Notifications
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.blueMid,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: C.navy,
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 12,
    color: C.textMuted,
  },

  // Small modals (Add Trip / Change Password / Logout)
  smallModalContainer: {
    backgroundColor: C.white,
    borderRadius: 20,
    margin: 30,
    padding: 22,
  },
  smallModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.navy,
    marginBottom: 6,
  },
  smallModalSubtitle: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 16,
  },
  smallModalInput: {
    borderWidth: 1,
    borderColor: C.blueMid,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: C.navy,
    backgroundColor: C.bg,
    marginBottom: 18,
  },
  smallModalBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  smallModalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  smallModalBtnSecondary: {
    backgroundColor: C.blueSoft,
    borderWidth: 1,
    borderColor: C.blueMid,
  },
  smallModalBtnSecondaryText: {
    color: C.blue,
    fontSize: 15,
    fontWeight: "600",
  },
  smallModalBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "600",
  },

  // Logout confirmation buttons
  logoutCancelBtn: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.blueMid,
  },
  logoutCancelBtnText: {
    color: C.navy,
    fontSize: 15,
    fontWeight: "600",
  },
  logoutConfirmBtn: {
    backgroundColor: "#E53935",
  },

  // Trip history rows
  tripHistoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.blueMid,
  },
  tripHistoryDestination: {
    fontSize: 14,
    fontWeight: "600",
    color: C.navy,
    marginBottom: 2,
  },
  tripHistoryDate: {
    fontSize: 12,
    color: C.textMuted,
  },
  tripHistoryDays: {
    fontSize: 14,
    fontWeight: "700",
    color: C.blue,
  },

  // Countries modal
  selectedCountText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.blue,
    marginBottom: 10,
  },
  countryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.blueMid,
  },
  countryName: {
    fontSize: 14,
    color: C.navy,
  },
  countryCheck: {
    fontSize: 18,
    color: C.blue,
    fontWeight: "700",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: C.white,
    borderRadius: 20,
    margin: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: C.white,
  },
  modalClose: {
    fontSize: 24,
    color: C.white,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: C.navy,
    marginBottom: 8,
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.navy,
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.blueMid,
  },
  privacyNote: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 4,
    lineHeight: 18,
  },
  privacyToggleRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  privacyOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: C.blueSoft,
    borderWidth: 1,
    borderColor: C.blueMid,
  },
  privacyOptionActive: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  privacyOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.blue,
  },
  privacyOptionTextActive: {
    color: C.white,
  },
  statEditRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: C.blueMid,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    backgroundColor: C.bg,
  },
  statEditValue: {
    fontSize: 15,
    fontWeight: "700",
    color: C.navy,
  },
  statEditAction: {
    fontSize: 13,
    fontWeight: "600",
    color: C.blue,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: C.blueMid,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: C.navy,
    backgroundColor: C.bg,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveBtn: {
    marginTop: 24,
    marginBottom: 30,
  },
  saveBtnGradient: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomePage;
