import { Stack } from 'expo-router';
import { NotificationProvider } from './app-pages/context/NotificationContext.js';


export default function RootLayout() {
  return (
    <NotificationProvider>
      <Stack>
        {/* Your screens */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="loginpage" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* App Pages - Hide headers for all */}
      <Stack.Screen name="app-pages/TourGuideProfile" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/TourGuideList" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/TourGuideCard" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/TourGuide" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/TGprofile" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/createPlan" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/myItineraries" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/budgetEstimate" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/packingList" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/feed" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/map" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/settings" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/plan" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/weather" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/community" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/feedProfile" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/feedFeeling" options={{ headerShown: false }} />
      <Stack.Screen name="app-pages/group-chat" options={{ headerShown: false }} />

  
      </Stack>
    </NotificationProvider>
  );
}

