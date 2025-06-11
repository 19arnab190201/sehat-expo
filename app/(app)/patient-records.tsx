import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../utils/api";
import { useSession } from "../../contexts/auth";

interface PatientRecord {
  patient: {
    name: string;
    sehatId: string;
    userType: string;
    dateOfBirth?: string;
    gender?: string;
  };
  summaries: {
    _id: string;
    summary: string;
    keyMedications: string[];
    dosages: string[];
    warnings: string[];
    recommendations: string[];
    confidence: number;
    createdAt: string;
  }[];
}

const BreathingStar = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const breathingAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]);

    const rotateAnimation = Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    Animated.loop(breathingAnimation).start();
    Animated.loop(rotateAnimation).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.starContainer}>
      <Animated.View
        style={[
          styles.star,
          {
            transform: [{ scale: scaleAnim }, { rotate: spin }],
            opacity: opacityAnim,
          },
        ]}>
        <Ionicons name='sparkles' size={48} color='#FF5893' />
      </Animated.View>
    </View>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  // Add ordinal suffix to day
  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${ordinal(day)} ${month} ${year}`;
};

export default function PatientRecordsScreen() {
  const { sehatId } = useLocalSearchParams();
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [patientData, setPatientData] = useState<PatientRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overallSummary, setOverallSummary] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/ai/${sehatId}/summaries`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        console.log(response.data.data);
        setPatientData(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to fetch patient data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchOverallSummary = async () => {
      try {
        setLoadingSummary(true);
        const response = await api.get(`/ai/${sehatId}/overall-summary`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        setOverallSummary(response.data.data.overallSummary);
      } catch (err) {
        console.error("Error fetching overall summary:", err);
        setOverallSummary("Unable to generate overall summary at this time.");
      } finally {
        setLoadingSummary(false);
      }
    };

    if (sehatId && session?.accessToken) {
      fetchPatientData();
      fetchOverallSummary();
    }
  }, [sehatId, session?.accessToken]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#FF5893' />
          <Text style={styles.loadingText}>Loading patient records...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name='alert-circle-outline' size={48} color='#FF5893' />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!patientData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name='document-outline' size={48} color='#FF5893' />
          <Text style={styles.errorText}>No patient data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Patient Records</Text>
            <Text style={styles.sehatId}>
              SEHAT ID: #{patientData.patient.sehatId}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFF5F8",
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#FF5893",
            }}
            onPress={() => {
              router.push({
                pathname: "/new-summary",
                params: { sehatId: patientData.patient.sehatId },
              });
            }}>
            <Ionicons name='add-circle-outline' size={20} color='#FF5893' />
            <Text
              style={{
                marginLeft: 8,
                color: "#FF5893",
                fontSize: 16,
                fontWeight: "500",
              }}>
              Add New
            </Text>
          </TouchableOpacity>
        </View>

        {/* Basic Information Card */}
        <View style={styles.basicInfoCard}>
          <View style={styles.basicInfoHeader}>
            <Ionicons name='person-outline' size={24} color='#FF5893' />
            <Text style={styles.basicInfoTitle}>Patient Information</Text>
          </View>
          <View style={styles.basicInfoContent}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{patientData.patient.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Age</Text>
              <Text style={styles.value}>
                {patientData.patient.dateOfBirth
                  ? `${Math.floor(
                      (new Date().getTime() -
                        new Date(patientData.patient.dateOfBirth).getTime()) /
                        (1000 * 60 * 60 * 24 * 365.25)
                    )} years`
                  : "Not specified"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.value}>
                {patientData.patient.gender
                  ? patientData.patient.gender.charAt(0).toUpperCase() +
                    patientData.patient.gender.slice(1)
                  : "Not specified"}
              </Text>
            </View>
          </View>
        </View>

        {/* AI Overall Summary Section */}
        <View style={styles.basicInfoCard}>
          <View style={styles.basicInfoHeader}>
            <Ionicons name='analytics-outline' size={24} color='#FF5893' />
            <Text style={styles.basicInfoTitle}>AI Overall Summary</Text>
          </View>
          <View style={styles.basicInfoContent}>
            {loadingSummary ? (
              <View style={styles.summaryLoadingContainer}>
                <BreathingStar />
                <Text style={styles.summaryLoadingText}>
                  Generating summary...
                </Text>
              </View>
            ) : (
              <Text style={styles.summaryText}>{overallSummary}</Text>
            )}
          </View>
        </View>

        {/* AI Analysis Reports Section */}
        {patientData.summaries && patientData.summaries.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderContent}>
                <Ionicons name='analytics-outline' size={24} color='#FF5893' />
                <Text style={styles.sectionTitle}>AI Analysis Reports</Text>
              </View>
            </View>
            <View style={styles.summariesContainer}>
              {patientData.summaries.map((summary) => (
                <View key={summary._id} style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <View style={styles.summaryHeaderLeft}>
                      <Text style={styles.summaryDate}>
                        {formatDate(summary.createdAt)}
                      </Text>
                      <Text style={styles.confidenceText}>
                        Confidence: {(summary.confidence * 100).toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.summaryHeaderRight}>
                      <Ionicons
                        name='document-text-outline'
                        size={24}
                        color='#FF5893'
                      />
                    </View>
                  </View>

                  <Text style={styles.summaryText}>{summary.summary}</Text>

                  <View style={styles.medicationsList}>
                    {summary.keyMedications.map((med, index) => (
                      <View key={index} style={styles.medicationItem}>
                        <View style={styles.medicationIcon}>
                          <Ionicons
                            name='medkit-outline'
                            size={16}
                            color='#FF5893'
                          />
                        </View>
                        <View style={styles.medicationInfo}>
                          <Text style={styles.medicationName}>{med}</Text>
                          <Text style={styles.dosage}>
                            {summary.dosages[index]}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {summary.warnings.length > 0 && (
                    <View style={styles.warningsContainer}>
                      <View style={styles.warningHeader}>
                        <Ionicons
                          name='warning-outline'
                          size={20}
                          color='#E53E3E'
                        />
                        <Text style={styles.warningsTitle}>Warnings</Text>
                      </View>
                      {summary.warnings.map((warning, index) => (
                        <Text key={index} style={styles.warningText}>
                          • {warning}
                        </Text>
                      ))}
                    </View>
                  )}

                  {summary.recommendations.length > 0 && (
                    <View style={styles.recommendationsContainer}>
                      <View style={styles.recommendationHeader}>
                        <Ionicons
                          name='checkmark-circle-outline'
                          size={20}
                          color='#38A169'
                        />
                        <Text style={styles.recommendationsTitle}>
                          Recommendations
                        </Text>
                      </View>
                      {summary.recommendations.map((rec, index) => (
                        <Text key={index} style={styles.recommendationText}>
                          • {rec}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 70,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  header: {
    backgroundColor: "#FF5893",
    padding: 20,
    paddingTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  sehatId: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF5893",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  section: {
    padding: 0,
  },
  summariesContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryHeaderLeft: {
    flex: 1,
  },
  summaryHeaderRight: {
    marginLeft: 12,
  },
  summaryDate: {
    fontSize: 14,
    color: "#666",
  },
  confidenceText: {
    fontSize: 12,
    color: "#FF5893",
    marginTop: 4,
  },
  summaryText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  medicationsList: {
    marginBottom: 16,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  medicationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF0F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dosage: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  warningsContainer: {
    backgroundColor: "#FFF5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  warningsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E53E3E",
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#E53E3E",
    marginBottom: 4,
    lineHeight: 20,
  },
  recommendationsContainer: {
    backgroundColor: "#F0FFF4",
    borderRadius: 8,
    padding: 12,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#38A169",
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: "#38A169",
    marginBottom: 4,
    lineHeight: 20,
  },
  basicInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  basicInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  basicInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  basicInfoContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  starContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  star: {
    position: "absolute",
  },
  summaryLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 16,
  },
  summaryLoadingText: {
    fontSize: 16,
    color: "#666",
  },
});
