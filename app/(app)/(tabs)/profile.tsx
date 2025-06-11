import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import { useSession } from "../../../contexts/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { api } from "../../../utils/api";

export default function Profile() {
  const { session, signOut } = useSession();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userData, setUserData] = React.useState(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/users/me");
      setUserData(response.data.data);
    } catch (error: any) {
      setError(error.message || "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground} />
      <View style={styles.profileSection}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${session?.user.name}&background=FFB240&color=121212`,
            }}
            style={styles.avatar}
          />
          {session?.user.userType === "patient" && (
            <Pressable
              onPress={() => {
                router.push("/(app)/qr-code");
              }}>
              <View style={styles.qrButton}>
                <Ionicons name='qr-code-outline' size={20} color='black' />
              </View>
            </Pressable>
          )}
        </View>
        <Text style={styles.name}>{session?.user.name || "User"}</Text>
        <View style={styles.phoneContainer}>
          <Text style={styles.phoneNumber}>{session?.user.phoneNumber}</Text>
          {session?.user.isPhoneVerified && (
            <View style={styles.verifiedChip}>
              <Ionicons name='checkmark-circle' size={14} color='#4CAF50' />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        {session?.user.userType === "patient" && (
          <Text style={styles.sehatId}>
            SEHAT ID: #{session?.user.sehatId || "N/A"}
          </Text>
        )}
        <Text style={styles.userType}>
          {session?.user.userType
            ? session.user.userType.charAt(0).toUpperCase() +
              session.user.userType.slice(1)
            : "User"}
        </Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(app)/notifications")}>
          <View
            style={[styles.menuIconContainer, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name='notifications-outline' size={22} color='#FF9800' />
          </View>
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name='chevron-forward' size={20} color='#999' />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(app)/terms")}>
          <View
            style={[styles.menuIconContainer, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name='document-text-outline' size={22} color='#1976D2' />
          </View>
          <Text style={styles.menuText}>Terms & Conditions</Text>
          <Ionicons name='chevron-forward' size={20} color='#999' />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(app)/privacy")}>
          <View
            style={[styles.menuIconContainer, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons
              name='shield-checkmark-outline'
              size={22}
              color='#4CAF50'
            />
          </View>
          <Text style={styles.menuText}>Privacy Policy</Text>
          <Ionicons name='chevron-forward' size={20} color='#999' />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={signOut}
        activeOpacity={0.7}>
        <Ionicons name='log-out-outline' size={22} color='#F44336' />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: "#FF5893",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
    paddingTop: 100,
    zIndex: 1,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  qrButton: {
    position: "absolute",
    bottom: -4,
    right: -7,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  verifiedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 2,
    fontWeight: "500",
  },
  sehatId: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    marginBottom: 8,
  },
  userType: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  menuSection: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 20,
    marginHorizontal: 20,
  },
  logoutText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});
