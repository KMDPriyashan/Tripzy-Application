import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/loginpage" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
      <Stack.Screen name="auth/profile" options={{ headerShown: false }} />
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
    </Stack>
  );
}