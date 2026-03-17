import { Stack } from 'expo-router';
import { NotificationProvider } from './app-pages/context/NotificationContext.js';

export default function RootLayout() {
  return (
    <NotificationProvider>
      <Stack>
        {/* Your existing stack screens */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="loginpage" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="app-pages/TourGuide" options={{ headerShown: false }} />
        <Stack.Screen name="app-pages/map" options={{ headerShown: false }} />
        <Stack.Screen name="app-pages/feed" options={{ headerShown: false }} />
        <Stack.Screen name="app-pages/plan" options={{ headerShown: false }} />
        <Stack.Screen name="app-pages/TGprofile" options={{ headerShown: false }} />
        

        <Stack.Screen
          name="app-pages/createPlan" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="app-pages/myItineraries" 
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
      </Stack>
    </NotificationProvider>
  );
}