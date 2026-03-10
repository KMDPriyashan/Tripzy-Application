import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="loginpage" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="Trip plan pages/createPlan" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="app-pages/myItineraries" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="app-pages/packingList" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="app-pages/budgetEstimate" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="app-pages/TourGuide" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="app-pages/settings" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}