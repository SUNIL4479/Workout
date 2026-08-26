import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import { colors, font } from "./src/theme";
import { RootStackParamList, MainTabParamList } from "./src/navigation";

import LandingScreen from "./src/screens/LandingScreen";
import SignInScreen from "./src/screens/SignInScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import WorkoutStudioScreen from "./src/screens/WorkoutStudioScreen";
import NutritionScreen from "./src/screens/NutritionScreen";
import AnalyticsScreen from "./src/screens/AnalyticsScreen";
import BadgesScreen from "./src/screens/BadgesScreen";
import WorkoutPlayerScreen from "./src/screens/WorkoutPlayerScreen";
import CoachChatScreen from "./src/screens/CoachChatScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

const TAB_ICONS: Record<keyof MainTabParamList, { on: any; off: any }> = {
  Dashboard: { on: "home", off: "home-outline" },
  Studio: { on: "barbell", off: "barbell-outline" },
  Nutrition: { on: "restaurant", off: "restaurant-outline" },
  Analytics: { on: "stats-chart", off: "stats-chart-outline" },
  Badges: { on: "trophy", off: "trophy-outline" },
  Profile: { on: "person", off: "person-outline" },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name as keyof MainTabParamList];
          return <Ionicons name={focused ? icons.on : icons.off} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Studio" component={WorkoutStudioScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Badges" component={BadgesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      {!user ? (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Player"
            component={WorkoutPlayerScreen}
            options={{ animation: "slide_from_bottom", gestureEnabled: false }}
          />
          <Stack.Screen name="Chat" component={CoachChatScreen} options={{ animation: "slide_from_bottom" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("./assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 88,
    paddingBottom: 24,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontFamily: font.semiBold,
    fontSize: 11,
  },
});
