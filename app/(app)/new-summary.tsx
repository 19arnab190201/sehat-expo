import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSession } from "../../contexts/auth";
import { api } from "../../utils/api";

interface FormData {
  sehatId: string;
  summary: string;
  keyMedications: string[];
  dosages: string[];
  warnings: string[];
  recommendations: string[];
}

export default function NewSummaryScreen() {
  const router = useRouter();
  const { sehatId } = useLocalSearchParams();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    sehatId: sehatId as string,
    summary: "",
    keyMedications: [""],
    dosages: [""],
    warnings: [""],
    recommendations: [""],
  });

  const addField = (field: keyof FormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeField = (field: keyof FormData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(
        (_: string, i: number) => i !== index
      ),
    }));
  };

  const updateField = (field: keyof FormData, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item: string, i: number) =>
        i === index ? value : item
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.summary.trim()) {
        Alert.alert("Error", "Summary is required");
        return;
      }

      if (!formData.keyMedications.some((med) => med.trim())) {
        Alert.alert("Error", "At least one key medication is required");
        return;
      }

      if (!formData.dosages.some((dosage) => dosage.trim())) {
        Alert.alert("Error", "At least one dosage is required");
        return;
      }

      setLoading(true);

      // Filter out empty fields
      const filteredData = {
        ...formData,
        keyMedications: formData.keyMedications.filter((med) => med.trim()),
        dosages: formData.dosages.filter((dosage) => dosage.trim()),
        warnings: formData.warnings.filter((warning) => warning.trim()),
        recommendations: formData.recommendations.filter((rec) => rec.trim()),
      };

      const response = await api.post("/ai/manual-summary", filteredData, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      Alert.alert("Success", "Summary created successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Prescription</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Overall Dignosis</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          value={formData.summary}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, summary: text }))
          }
          placeholder='Enter here...'
        />

        <Text style={styles.label}>Key Medications</Text>
        {formData.keyMedications.map((medication, index) => (
          <View key={index} style={styles.fieldContainer}>
            <TextInput
              style={styles.input}
              value={medication}
              onChangeText={(text) =>
                updateField("keyMedications", index, text)
              }
              placeholder='Enter medication name'
            />
            {index > 0 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeField("keyMedications", index)}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addField("keyMedications")}>
          <Text style={styles.addButtonText}>Add Medication</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Dosages</Text>
        {formData.dosages.map((dosage, index) => (
          <View key={index} style={styles.fieldContainer}>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={(text) => updateField("dosages", index, text)}
              placeholder='Enter dosage'
            />
            {index > 0 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeField("dosages", index)}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addField("dosages")}>
          <Text style={styles.addButtonText}>Add Dosage</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Warnings</Text>
        {formData.warnings.map((warning, index) => (
          <View key={index} style={styles.fieldContainer}>
            <TextInput
              style={styles.input}
              value={warning}
              onChangeText={(text) => updateField("warnings", index, text)}
              placeholder='Enter warning'
            />
            {index > 0 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeField("warnings", index)}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addField("warnings")}>
          <Text style={styles.addButtonText}>Add Warning</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Recommendations</Text>
        {formData.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.fieldContainer}>
            <TextInput
              style={styles.input}
              value={recommendation}
              onChangeText={(text) =>
                updateField("recommendations", index, text)
              }
              placeholder='Enter recommendation'
            />
            {index > 0 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeField("recommendations", index)}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addField("recommendations")}>
          <Text style={styles.addButtonText}>Add Recommendation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          <Text style={styles.submitButtonText}>
            {loading ? "Creating..." : "Create Prescription"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: "#FF5893",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: "#FF5893",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#FF5893",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 100,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
