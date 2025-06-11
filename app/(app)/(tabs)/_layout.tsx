import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../../contexts/auth";

const styles = StyleSheet.create({
  tabItem: {
    justifyContent: "center",
    alignItems: "center",
    // Add any specific styling for non-upload tabs here if needed
  },
});

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const isDoctor = session?.user?.userType === "doctor";

  return (
    <Tabs
      screenOptions={{
        tabBarButton: ({ ref, ...props }) => (
          <Pressable
            // ref={ref} // Removed ref as per Option 1
            {...props}
            android_ripple={{ color: "transparent" }}
          />
        ),
        tabBarShowLabel: true, // Show tab labels for non-central tabs
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          height: 120, // User specified height
          paddingTop: 10,
          paddingHorizontal: 5,
          // marginHorizontal: 10, // User specified margin - removing as not in final screenshot
          // borderRadius: 20, // User specified border radius - removing as not in final screenshot
          paddingBottom: insets.bottom, // Use safe area inset for bottom padding
          bottom: 0,
        },
        headerShown: false, // Ensure header is hidden
        tabBarActiveTintColor: "#FF5893", // Match the pink color from the header
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: {
          // Style for the tab labels
          fontSize: 12,
          marginTop: 4, // Space between icon and label
        },
      }}>
      <Tabs.Screen
        name='index'
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabItem}>
              <Ionicons name='home-outline' size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name='reports'
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabItem}>
              <Ionicons name='bar-chart-outline' size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name='center'
        options={{
          title: isDoctor ? "Scan" : "Upload",
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                backgroundColor: "#FF5893",
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#FF5893",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 10,
                marginTop: -20,
              }}>
              <Ionicons
                name={isDoctor ? "scan-outline" : "add-circle-outline"}
                size={35}
                color='#fff'
              />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name='notifications'
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name='notifications-outline'
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabItem}>
              <Ionicons name='person-outline' size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
