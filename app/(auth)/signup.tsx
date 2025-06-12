import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSession } from "../../contexts/auth";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Signup() {
  const { signUp } = useSession();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userType, setUserType] = useState<"patient" | "doctor">("patient");
  const [loading, setLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | null>(null);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select Date of Birth";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSignup = async () => {
    if (!name || !phoneNumber) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await signUp(
        phoneNumber,
        userType,
        name,
        dateOfBirth?.toISOString() || "",
        gender || undefined
      );
      router.push({
        pathname: "/(auth)/verify",
        params: { phoneNumber },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "iiiiii Failed to sign up" + JSON.stringify(error)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='Full Name'
            value={name}
            onChangeText={setName}
            editable={!loading}
            placeholderTextColor='#999'
          />
          <TextInput
            style={styles.input}
            placeholder='Phone Number'
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType='phone-pad'
            editable={!loading}
            placeholderTextColor='#999'
          />
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
            disabled={loading}>
            <Text
              style={[styles.dateText, !dateOfBirth && styles.placeholderText]}>
              {formatDate(dateOfBirth)}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date()}
              mode='date'
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <Text style={styles.sectionTitle}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "male" && styles.genderButtonActive,
            ]}
            onPress={() => setGender("male")}
            disabled={loading}>
            <Text
              style={[
                styles.genderText,
                gender === "male" && styles.genderTextActive,
              ]}>
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "female" && styles.genderButtonActive,
            ]}
            onPress={() => setGender("female")}
            disabled={loading}>
            <Text
              style={[
                styles.genderText,
                gender === "female" && styles.genderTextActive,
              ]}>
              Female
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>I am a</Text>
        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === "patient" && styles.userTypeButtonActive,
            ]}
            onPress={() => setUserType("patient")}
            disabled={loading}>
            <Text
              style={[
                styles.userTypeText,
                userType === "patient" && styles.userTypeTextActive,
              ]}>
              Patient
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === "doctor" && styles.userTypeButtonActive,
            ]}
            onPress={() => setUserType("doctor")}
            disabled={loading}>
            <Text
              style={[
                styles.userTypeText,
                userType === "doctor" && styles.userTypeTextActive,
              ]}>
              Doctor
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? "Creating Account..." : "Continue"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerBackground: {
    height: 180,
    backgroundColor: "#FF5893",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 60,
  },
  headerContent: {
    paddingHorizontal: 30,
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#333",
  },
  userTypeContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  userTypeButtonActive: {
    backgroundColor: "#FF5893",
    borderColor: "#FF5893",
  },
  userTypeText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  userTypeTextActive: {
    color: "white",
  },
  genderContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  genderButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  genderButtonActive: {
    backgroundColor: "#FF5893",
    borderColor: "#FF5893",
  },
  genderText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  genderTextActive: {
    color: "white",
  },
  button: {
    backgroundColor: "#FF5893",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#FF5893",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  linkText: {
    color: "#666",
    fontSize: 14,
  },
  link: {
    color: "#FF5893",
    fontSize: 14,
    fontWeight: "600",
  },
  dateText: {
    color: "#333",
    fontSize: 16,
  },
  placeholderText: {
    color: "#999",
  },
});
