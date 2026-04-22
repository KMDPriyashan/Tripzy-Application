import { Stack } from "expo-router";
import { NotificationProvider } from "../context/NotificationContext.js";

export default function RootLayout() {
  return (
    <NotificationProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="loginpage" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />

        {/* (tabs) is the tab navigator group */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* App Pages */}
        <Stack.Screen
          name="app-pages/TourGuideList"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/TourGuideCard"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/TourGuide"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/TGprofile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/createPlan"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/budgetEstimate"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/packingList"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="app-pages/map" options={{ headerShown: false }} />
        <Stack.Screen
          name="app-pages/settings"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="app-pages/plan" options={{ headerShown: false }} />
        <Stack.Screen
          name="app-pages/weather"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/community"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/CreatePost"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/CreateProfile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/EditProfile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/ProfileScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/selected-location"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/solo-chat"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/group-chat"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/tomorrow-weather"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="app-pages/weather-notification"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateStory/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      </Stack>
    </NotificationProvider>
  );
}
