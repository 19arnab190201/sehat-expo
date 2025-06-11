import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Terms() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={24} color='#333' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing and using the Sehat app, you agree to be bound by these
            Terms and Conditions. If you do not agree to these terms, please do
            not use the app.
          </Text>

          <Text style={styles.sectionTitle}>2. Use of Service</Text>
          <Text style={styles.text}>
            The Sehat app is designed to provide healthcare-related services.
            You agree to use the app only for lawful purposes and in accordance
            with these terms.
          </Text>

          <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
          <Text style={styles.text}>
            You are responsible for maintaining the confidentiality of your
            account and for all activities that occur under your account. You
            must provide accurate and complete information when using the app.
          </Text>

          <Text style={styles.sectionTitle}>4. Medical Disclaimer</Text>
          <Text style={styles.text}>
            The information provided through the app is not intended to replace
            professional medical advice. Always consult with qualified
            healthcare providers for medical decisions.
          </Text>

          <Text style={styles.sectionTitle}>5. Privacy</Text>
          <Text style={styles.text}>
            Your use of the app is also governed by our Privacy Policy. Please
            review our Privacy Policy to understand our practices.
          </Text>

          <Text style={styles.sectionTitle}>6. Modifications</Text>
          <Text style={styles.text}>
            We reserve the right to modify these terms at any time. We will
            notify users of any material changes to these terms.
          </Text>

          <Text style={styles.sectionTitle}>7. Contact Us</Text>
          <Text style={styles.text}>
            If you have any questions about these Terms and Conditions, please
            contact our support team.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
});
