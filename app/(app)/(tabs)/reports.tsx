import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../utils/api";
import { useSession } from "../../../contexts/auth";
import { useFocusEffect } from "@react-navigation/native";

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

interface Patient {
  _id: string;
  name: string;
  sehatId: string;
  dateOfBirth?: string;
  gender?: string;
  lastViewedAt: string;
  viewCount: number;
}

export default function ReportsScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      if (!session?.accessToken) {
        setError("Please sign in to view your reports");
        return;
      }

      const headers = {
        Authorization: `Bearer ${session.accessToken}`,
      };

      if (session.user.userType === "doctor") {
        const patientsResponse = await api.get("/ai/doctor/patients", {
          headers,
        });
        setPatients(patientsResponse.data.data);
      }

      const summariesResponse = await api.get("/ai/summaries", { headers });
      setSummaries(summariesResponse.data.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session?.accessToken]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [session?.accessToken])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options).replace(", ", " ");
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={{ ...styles.summaryCard, width: "97%" }}
      onPress={() => router.push(`/patient-records?sehatId=${item.sehatId}`)}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryIconContainer}>
          <Ionicons name='person-outline' size={24} color='#FF5893' />
        </View>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryDate}>
            {formatDate(item.lastViewedAt)}
          </Text>
          <Text style={styles.summaryTitle} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
        <Ionicons name='chevron-forward' size={24} color='#666' />
      </View>

      <View style={styles.summaryDetails}>
        <View style={styles.detailItem}>
          <Ionicons name='id-card-outline' size={16} color='#666' />
          <Text style={styles.detailText}>{item.sehatId}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name='eye-outline' size={16} color='#666' />
          <Text style={styles.detailText}>{item.viewCount} Views</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSummaryItem = ({ item }: { item: AISummary }) => (
    <TouchableOpacity
      style={styles.summaryCard}
      onPress={() => router.push(`/prescription/${item._id}`)}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryIconContainer}>
          <Ionicons name='document-text-outline' size={24} color='#FF5893' />
        </View>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryDate}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.summaryTitle} numberOfLines={2}>
            {item.summary}
          </Text>
        </View>
        <Ionicons name='chevron-forward' size={24} color='#666' />
      </View>

      <View style={styles.summaryDetails}>
        <View style={styles.detailItem}>
          <Ionicons name='medkit-outline' size={16} color='#666' />
          <Text style={styles.detailText}>
            {item.keyMedications.length} Medications
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name='warning-outline' size={16} color='#666' />
          <Text style={styles.detailText}>{item.warnings.length} Warnings</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#FF5893' />
        <Text style={styles.loadingText}>Loading your reports...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name='alert-circle-outline' size={50} color='#d9534f' />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchData();
          }}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {session?.user.userType === "doctor"
            ? "Patient's Reports"
            : "Reports"}
        </Text>
        {session?.user.userType !== "doctor" && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => router.push("/upload")}>
            <Ionicons name='add-circle-outline' size={24} color='#FF5893' />
            <Text style={styles.uploadButtonText}>New Report</Text>
          </TouchableOpacity>
        )}
      </View>

      {session?.user.userType === "doctor" && (
        <View style={styles.section}>
          {patients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name='people-outline' size={50} color='#6c757d' />
              <Text style={styles.emptyText}>No patients yet</Text>
            </View>
          ) : (
            <FlatList
              data={patients}
              renderItem={renderPatientItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContainer}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {session?.user.userType === "patient" && (
        <View style={styles.section}>
          {summaries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name='document-outline' size={50} color='#6c757d' />
              <Text style={styles.emptyText}>No reports available</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => router.push("/upload")}>
                <Text style={styles.uploadButtonText}>
                  Upload Your First Report
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={summaries}
              renderItem={renderSummaryItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 16,
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF5893",
  },
  uploadButtonText: {
    color: "#FF5893",
    marginLeft: 4,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
    width: "100%",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF0F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  summaryDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d9534f",
    textAlign: "center",
    marginVertical: 12,
  },
  retryButton: {
    backgroundColor: "#FF5893",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
    marginVertical: 12,
  },
});
