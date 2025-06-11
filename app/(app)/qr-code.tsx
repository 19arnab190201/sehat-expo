import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useSession } from "../../contexts/auth";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

export default function QRCodeScreen() {
  const { session } = useSession();
  const userName = session?.user?.name || "User";
  const sehatId = session?.user?.sehatId || "N/A";

  // Use qrCodeRef to refer to the card View
  const qrCodeRef = useRef<View>(null); // Changed type to View

  const handleShare = async () => {
    try {
      // Use captureRef to capture the specific view
      if (qrCodeRef.current) {
        const uri = await captureRef(qrCodeRef.current, {
          format: "jpg",
          quality: 0.8,
        });

        // Log the URI after it's captured
        // console.log("Image captured to", uri);

        // Define the caption text (note: may not appear with image depending on receiving app)
        const captionText = `Here is the SEHAT ID for ${userName}: #${sehatId}`;

        // Use expo-sharing to share the file URI
        if (await Sharing.isAvailableAsync()) {
          // shareAsync primarily shares the file; captionText may not be included
          await Sharing.shareAsync(`file://${uri}`);
        } else {
          alert("Sharing is not available on this device.");
        }
      } else {
        alert("Could not capture card: ref is null.");
      }
    } catch (error: any) {
      console.error("Error sharing QR code:", error);
      alert("Failed to share QR code.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Apply the ref to the card View */}
        <View ref={qrCodeRef} style={styles.card}>
          {/* Placeholder for Avatar */}
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${userName}&background=FFB240&color=121212`,
            }} // Replace with dynamic avatar source if available
            style={styles.avatar}
          />

          <Text style={styles.userName}>{userName}</Text>

          {/* QR Code */}
          {sehatId !== "N/A" && (
            <QRCode
              value={sehatId}
              size={200}
              color='#000'
              backgroundColor='#fff'
            />
          )}

          <Text style={styles.scanText}>scan to share your details</Text>

          <View style={styles.sehatIdContainer}>
            <Text style={styles.sehatIdLabel}>SEHAT ID :</Text>
            <Text style={styles.sehatIdValue}>#{sehatId}</Text>
            {/* Optional: Add a copy icon */}
            {/* <TouchableOpacity>
              <Ionicons name="copy-outline" size={20} color="#FF5893" />
            </TouchableOpacity> */}
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name='share-social-outline' size={20} color='#FF5893' />
          <Text style={styles.shareButtonText}>Share QR Code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FF5893",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 30,
  },
  avatar: {
    width: 67,
    height: 67,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: "400",
    color: "#FF5893",
    marginBottom: 20,
  },
  qrCodeContainer: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  scanText: {
    fontSize: 14,
    color: "#888",
    marginTop: 10,
  },
  sehatIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  sehatIdLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginRight: 5,
  },
  sehatIdValue: {
    fontSize: 16,
    color: "#FF5893",
    fontWeight: "bold",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: "70%",
    borderWidth: 1,
    borderColor: "#FF5893",
  },
  shareButtonText: {
    fontSize: 16,
    color: "#FF5893",
    marginLeft: 8,
    fontWeight: "500",
  },
});
