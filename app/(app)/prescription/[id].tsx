import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useSession } from "../../../contexts/auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface AISummary {
  _id: string;
  createdBy: {
    _id: string;
    name: string;
    userType: string;
  };
  summary: string;
  keyMedications: string[];
  dosages: string[];
  warnings: string[];
  recommendations: string[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export default function PrescriptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useSession();

  const [summary, setSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || typeof id !== "string" || !session?.accessToken) {
        setLoading(false);
        setError("Summary ID or access token missing.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/ai/summaries/${id}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        setSummary(response.data.data);
      } catch (err: any) {
        console.error("Error fetching summary data:", err);
        setError(err.message || "Failed to fetch summary data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, session?.accessToken]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options).replace(", ", " ");
  };

  const renderMedicationItem = (
    medication: string,
    dosage: string,
    index: number
  ) => (
    <View key={index} style={styles.medicationItem}>
      <View style={styles.iconContainer}>
        <MaterialIcons name='medication' size={24} color='#F43D74' />
      </View>
      <View style={styles.medicationTextContainer}>
        <Text style={styles.medicationName}>
          {medication || "Unknown medication"}
        </Text>
        <Text style={styles.medicationDosage}>{dosage || "Dosage N/A"}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#FF5893' />
        <Text style={styles.loadingText}>Loading summary...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name='alert-circle-outline' size={50} color='#d9534f' />
        <Text style={styles.errorText}>Error loading summary: {error}</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}>
          <Text style={styles.backButtonErrorText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!summary) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name='document-outline' size={50} color='#6c757d' />
        <Text style={styles.emptyText}>
          Summary not found or not available.
        </Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}>
          <Text style={styles.backButtonErrorText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.customBackButton}>
          <Ionicons name='arrow-back' size={24} color='#fff' />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Summary Details</Text>
      </View>
      <ScrollView style={styles.content}>
        {/* Summary Info Section */}
        <View style={styles.section}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <Text style={styles.sectionTitle}>Summary Information</Text>
            <Text style={styles.patientDate}>
              {formatDate(summary.createdAt)}
            </Text>
          </View>
          <View style={styles.patientDataCard}>
            {session?.user ? (
              <View style={styles.patientInfoRow}>
                <View style={styles.avatarPlaceholder} />
                <View style={styles.patientTextDetails}>
                  <Text style={styles.patientName}>{session?.user?.name}</Text>
                  <Text style={styles.patientDetails}>
                    SEHAT ID: {session?.user?.sehatId}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name='person-outline' size={24} color='#6c757d' />
                <Text style={styles.emptyStateText}>
                  User details not available
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.card}>
            {summary.summary ? (
              <Text style={styles.aiSummaryText}>{summary.summary}</Text>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons
                  name='document-text-outline'
                  size={24}
                  color='#6c757d'
                />
                <Text style={styles.emptyStateText}>No summary available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Medications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medications</Text>
          <View style={styles.medicationsList}>
            {summary.keyMedications && summary.keyMedications.length > 0 ? (
              summary.keyMedications.map((medication, index) =>
                renderMedicationItem(
                  medication,
                  summary.dosages[index] || "",
                  index
                )
              )
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name='medkit-outline' size={24} color='#6c757d' />
                <Text style={styles.emptyStateText}>
                  No medications available
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Warnings and Recommendations Section */}
        {(summary.warnings?.length > 0 ||
          summary.recommendations?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.card}>
              {summary.recommendations?.length > 0 && (
                <>
                  <Text style={styles.noteTitle}>Recommendations:</Text>
                  {summary.recommendations.map((rec, index) => (
                    <Text key={index} style={styles.noteText}>
                      • {rec}
                    </Text>
                  ))}
                </>
              )}

              {summary.warnings?.length > 0 && (
                <>
                  <Text style={styles.noteTitle}>Warnings:</Text>
                  <View style={styles.warningsChipContainer}>
                    {summary.warnings.map((warning, index) => (
                      <View key={index} style={styles.warningChip}>
                        <Text style={styles.warningChipText}>{warning}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Confidence Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidence Score</Text>
          <View style={styles.card}>
            <View style={styles.confidenceContainer}>
              <Ionicons name='analytics-outline' size={20} color='#666' />
              <Text style={styles.confidence}>
                {(summary.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingBottom: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Very light gray background
  },
  content: {
    padding: 15,
    paddingBottom: 30,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5893",
    paddingTop: 45, // Adjust for status bar
    paddingBottom: 15,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 6,
  },
  customBackButton: {
    marginRight: 15,
    padding: 5,
  },
  customHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600", // Slightly less bold
    marginBottom: 14,
    color: "#333",
  },
  patientDataCard: {
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(34,31,31,0.1)",
  },
  // Patient Info Styles
  patientInfoRow: {
    backgroundColor: "#F2F2F5",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
  },
  patientTextDetails: {
    flex: 1,
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: "100%",
    backgroundColor: "#e0e0e0",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#FF5893",
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  patientDate: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  // Diagnosis Summary Styles
  diagnosisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  diagnosisLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  diagnosisValue: {
    fontSize: 15,
    color: "#555",
    flexShrink: 1,
    marginLeft: 10,
  },
  aiSummaryContainer: {
    marginTop: 12,
  },
  aiSummaryTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  aiSummaryText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  // Medications Styles
  medicationsList: {
    // No specific style needed if list items have their own padding/margin
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(34,31,31,0.1)",
    borderRadius: 12,
  },

  medicationName: {
    fontSize: 14,
    fontWeight: 500,
    color: "#333",
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  // Doctor Notes Styles
  noteTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    lineHeight: 20,
  },
  warningsChipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  warningChip: {
    backgroundColor: "#fff3cd", // Light yellow for warnings
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#ffc107", // Yellow border
  },
  warningChipText: {
    fontSize: 12,
    color: "#856404", // Dark yellow text
    fontWeight: "600",
  },
  // Loading and Error Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#6c757d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    fontSize: 16,
    color: "#d9534f", // Red color for error
    textAlign: "center",
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d", // Muted text color
    textAlign: "center",
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: "#FF5893", // Match new header color
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  backButtonErrorText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  iconContainer: {
    backgroundColor: "#F7F0E9", // Light pink/off-white background
    padding: 14,
    borderRadius: 8,
  },
  medicationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  emptyStateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  confidence: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
});
