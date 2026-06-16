import { Stack, usePathname } from "expo-router";
import BottomNav from "../components/BottomNav";
import { NotificationProvider } from "./app-pages/context/NotificationContext"; // ✅ removed .js

export default function RootLayout() {
  const pathname = usePathname();

  const hideNavbarRoutes = ["/", "/loginpage", "/signup", "/welcome"];
  const shouldHideNavbar = hideNavbarRoutes.includes(pathname);

  return (
    <NotificationProvider>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="loginpage" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="app-pages/TourGuideProfile" />
          <Stack.Screen name="app-pages/TourGuideList" />
          <Stack.Screen name="app-pages/TourGuideCard" />
          <Stack.Screen name="app-pages/TourGuide" />
          <Stack.Screen name="app-pages/TGprofile" />
          <Stack.Screen name="app-pages/createPlan" />
          <Stack.Screen name="app-pages/myItineraries" />
          <Stack.Screen name="app-pages/budgetEstimate" />
          <Stack.Screen name="app-pages/packingList" />
          <Stack.Screen name="app-pages/feed" />
          <Stack.Screen name="app-pages/map" />
          <Stack.Screen name="app-pages/settings" />
          <Stack.Screen name="app-pages/plan" />
          <Stack.Screen name="app-pages/weather" />
          <Stack.Screen name="app-pages/community" />
          <Stack.Screen name="app-pages/feedProfile" />
          <Stack.Screen name="app-pages/feedFeeling" />
          <Stack.Screen name="app-pages/group-chat" />
        </Stack>

        {!shouldHideNavbar && <BottomNav />}
      </>
    </NotificationProvider>
  );
}
