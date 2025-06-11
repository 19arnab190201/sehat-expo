import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { api } from "../../utils/api";
import { useSession } from "../../contexts/auth";
import { useRouter } from "expo-router";

interface AIResponse {
  status: string;
  data: {
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
  };
}

export default function UploadScreen() {
  const [uploading, setUploading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const { session } = useSession();
  const router = useRouter();

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      const mimeType = asset.mimeType || "application/pdf";

      await processPrescription(asset.uri, mimeType);
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const processPrescription = async (uri: string, mimeType: string) => {
    try {
      if (!session?.accessToken) {
        Alert.alert("Error", "Please sign in to upload prescriptions");
        return;
      }

      setUploading(true);
      setAiResponse(null);

      const formData = new FormData();
      formData.append("prescription", {
        uri,
        type: mimeType,
        name: `prescription.${mimeType.split("/")[1]}`,
      } as any);

      const response = await api.post("/ai/process", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      setAiResponse(response.data);
    } catch (error) {
      console.error("Error processing prescription:", error);
      Alert.alert("Error", "Failed to process prescription. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleReupload = () => {
    setAiResponse(null);
  };

  const renderEmptyState = (type: string) => (
    <View style={styles.emptyCard}>
      <Ionicons name='information-circle-outline' size={24} color='#666' />
      <Text style={styles.emptyText}>No {type} available</Text>
    </View>
  );

  const renderMedicationCard = (
    medication: string,
    dosage: string,
    index: number
  ) => (
    <View key={index} style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <Ionicons name='medical-outline' size={20} color='#FF5893' />
        <Text style={styles.medicationName}>{medication}</Text>
      </View>
      {dosage && (
        <View style={styles.dosageContainer}>
          <Ionicons name='time-outline' size={16} color='#666' />
          <Text style={styles.dosageText}>{dosage}</Text>
        </View>
      )}
    </View>
  );

  const renderWarningCard = (warning: string, index: number) => (
    <View key={index} style={styles.warningCard}>
      <View style={styles.warningHeader}>
        <Ionicons name='warning-outline' size={20} color='#FF6B6B' />
        <Text style={styles.warningTitle}>Warning</Text>
      </View>
      <Text style={styles.warningText}>{warning}</Text>
    </View>
  );

  const renderRecommendationCard = (recommendation: string, index: number) => (
    <View key={index} style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <Ionicons name='checkmark-circle-outline' size={20} color='#4CAF50' />
        <Text style={styles.recommendationTitle}>Recommendation</Text>
      </View>
      <Text style={styles.recommendationText}>{recommendation}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Upload</Text>

        {!aiResponse && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickFile}
            disabled={uploading}>
            <Ionicons
              name={uploading ? "cloud-upload" : "cloud-upload-outline"}
              size={32}
              color='#FF5893'
            />
            <Text style={styles.uploadText}>
              {uploading ? "Processing..." : "Upload Document"}
            </Text>
          </TouchableOpacity>
        )}

        {aiResponse && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseTitle}>Analysis Results</Text>

            {/* Summary Section */}
            <View style={styles.summarySection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name='document-text-outline'
                  size={24}
                  color='#FF5893'
                />
                <Text style={styles.summaryTitle}>Summary</Text>
              </View>
              <Text style={styles.summaryText}>
                {aiResponse.data.summary || "No summary available"}
              </Text>
            </View>

            {/* Medications Section */}
            <View style={styles.medicationsSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name='medkit-outline' size={24} color='#FF5893' />
                <Text style={styles.sectionTitle}>Medications</Text>
              </View>
              <View style={styles.medicationsList}>
                {aiResponse.data.keyMedications.length > 0
                  ? aiResponse.data.keyMedications.map((medication, index) =>
                      renderMedicationCard(
                        medication,
                        aiResponse.data.dosages[index] || "",
                        index
                      )
                    )
                  : renderEmptyState("medications")}
              </View>
            </View>

            {/* Warnings Section */}
            <View style={styles.warningsSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name='alert-circle-outline'
                  size={24}
                  color='#FF6B6B'
                />
                <Text style={styles.sectionTitle}>Warnings</Text>
              </View>
              <View style={styles.warningsList}>
                {aiResponse.data.warnings.length > 0
                  ? aiResponse.data.warnings.map((warning, index) =>
                      renderWarningCard(warning, index)
                    )
                  : renderEmptyState("warnings")}
              </View>
            </View>

            {/* Recommendations Section */}
            <View style={styles.recommendationsSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name='checkmark-circle-outline'
                  size={24}
                  color='#4CAF50'
                />
                <Text style={styles.sectionTitle}>Recommendations</Text>
              </View>
              <View style={styles.recommendationsList}>
                {aiResponse.data.recommendations.length > 0
                  ? aiResponse.data.recommendations.map(
                      (recommendation, index) =>
                        renderRecommendationCard(recommendation, index)
                    )
                  : renderEmptyState("recommendations")}
              </View>
            </View>

            {/* Confidence Score */}
            <View style={styles.confidenceContainer}>
              <Ionicons name='analytics-outline' size={20} color='#666' />
              <Text style={styles.confidence}>
                Confidence: {(aiResponse.data.confidence * 100).toFixed(1)}%
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.reuploadButton]}
                onPress={handleReupload}>
                <Ionicons name='refresh-outline' size={24} color='#FF5893' />
                <Text style={[styles.actionButtonText, styles.reuploadText]}>
                  Re-upload
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={() => router.replace("/(app)/(tabs)")}>
                <Ionicons name='checkmark-outline' size={24} color='#fff' />
                <Text style={[styles.actionButtonText, styles.saveText]}>
                  Done
                </Text>
              </TouchableOpacity>
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
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  uploadButton: {
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FF5893",
    borderStyle: "dashed",
    marginBottom: 20,
  },
  uploadText: {
    marginTop: 8,
    fontSize: 16,
    color: "#FF5893",
  },
  responseContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  responseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summarySection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#FF5893",
  },
  summaryText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  medicationsSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  medicationsList: {
    gap: 12,
  },
  medicationCard: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  medicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  dosageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 28,
  },
  dosageText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  warningsSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  warningsList: {
    gap: 12,
  },
  warningCard: {
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 28,
    lineHeight: 20,
  },
  recommendationsSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationCard: {
    backgroundColor: "#F0FFF4",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0FFE0",
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 28,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  confidence: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  emptyCard: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  reuploadButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FF5893",
  },
  saveButton: {
    backgroundColor: "#FF5893",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  reuploadText: {
    color: "#FF5893",
  },
  saveText: {
    color: "#fff",
  },
});
