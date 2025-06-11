import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSession } from "../../contexts/auth";
import { useState, useRef, useEffect } from "react";
import * as SMS from "expo-sms";

const OTP_LENGTH = 5;
const { width } = Dimensions.get("window");
const BOX_SIZE = (width - 100) / OTP_LENGTH;

export default function Verify() {
  const { verifyOTP } = useSession();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const animatedValues = useRef(otp.map(() => new Animated.Value(0))).current;

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) {
      Alert.alert("Error", "Please enter the complete 5-digit OTP");
      return;
    }

    try {
      setLoading(true);
      await verifyOTP(params.phoneNumber as string, otpString);
      router.replace("/(app)/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to verify OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await useSession().signIn(params.phoneNumber as string);
      Alert.alert("Success", "OTP resent successfully");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the code sent to {params.phoneNumber}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.otpContainer}>
          {Array(OTP_LENGTH)
            .fill(0)
            .map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.otpBox,
                  {
                    transform: [
                      {
                        scale: animatedValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.05],
                        }),
                      },
                    ],
                    borderColor: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ["#E0E0E0", "#FF5893"],
                    }),
                    backgroundColor: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ["#FFFFFF", "#FFF5F8"],
                    }),
                  },
                ]}>
                <TextInput
                  ref={(ref) => {
                    if (ref) {
                      inputRefs.current[index] = ref;
                    }
                  }}
                  style={styles.otpInput}
                  maxLength={1}
                  keyboardType='number-pad'
                  value={otp[index]}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  editable={!loading}
                  selectTextOnFocus
                />
              </Animated.View>
            ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={handleResend}
          disabled={loading}>
          <Text style={styles.linkText}>Didn't receive code? </Text>
          <Text style={styles.link}>Resend</Text>
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  otpBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#E0E0E0",
  },
  otpInput: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    letterSpacing: 1,
    borderWidth: 0,
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
});
