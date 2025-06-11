import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Pressable,
  FlatList,
} from "react-native";
import { useSession } from "../../../contexts/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../../utils/api";
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

export default function HomeScreen() {
  const { session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const fetchData = async () => {
    try {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      if (session.user.userType === "doctor") {
        // Fetch patients for doctors
        const response = await api.get("/ai/doctor/patients", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setPatients(response.data.data);
      } else {
        // Fetch summaries for patients
        const response = await api.get("/ai/summaries", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setSummaries(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session?.user, session?.accessToken]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [session?.accessToken])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#FF5893' />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name='alert-circle-outline' size={48} color='#FF5893' />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (session?.user?.userType === "doctor") {
    return (
      <ScrollView style={styles.container}>
        {/* Pink Header */}
        <View style={styles.headerBg}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: `https://ui-avatars.com/api/?name=${session.user.name}&background=FFB240&color=121212`,
                }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>
                {getGreeting()}, Dr.{" "}
                {session.user.name?.split(" ")[0] || "User"}!{" "}
                <Text style={{ fontSize: 20 }}>👋</Text>
              </Text>
              <Text style={styles.sehatId}>
                SEHAT ID :{" "}
                <Text style={styles.sehatIdValue}>
                  #{session.user.sehatId || "N/A"}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Patients Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Patients</Text>
            <Text style={styles.patientCount}>
              {patients.length} {patients.length === 1 ? "Patient" : "Patients"}
            </Text>
          </View>

          {patients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name='people-outline' size={48} color='#FF5893' />
              <Text style={styles.emptyText}>No patients examined yet</Text>
              <Text style={styles.emptySubtext}>
                Start by viewing a patient's records
              </Text>
            </View>
          ) : (
            <View style={styles.patientsList}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient._id}
                  style={styles.patientCard}
                  onPress={() =>
                    router.push(`/patient-records?sehatId=${patient.sehatId}`)
                  }>
                  <View style={styles.patientCardContent}>
                    <View style={styles.patientAvatarContainer}>
                      <Image
                        source={{
                          uri: `https://ui-avatars.com/api/?name=${patient.name}&background=FFB240&color=121212`,
                        }}
                        style={styles.patientAvatar}
                      />
                    </View>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <Text style={styles.patientId}>
                        SEHAT ID: {patient.sehatId}
                      </Text>
                      <View style={styles.patientDetailsRow}>
                        {patient.dateOfBirth && (
                          <View style={styles.detailItem}>
                            <Ionicons
                              name='calendar-outline'
                              size={16}
                              color='#666'
                            />
                            <Text style={styles.detailText}>
                              {formatDate(patient.dateOfBirth)}
                            </Text>
                          </View>
                        )}
                        <View style={styles.detailItem}>
                          <Ionicons name='eye-outline' size={16} color='#666' />
                          <Text style={styles.detailText}>
                            {patient.viewCount}{" "}
                            {patient.viewCount === 1 ? "View" : "Views"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // Patient View
  return (
    <ScrollView style={styles.container}>
      {/* Pink Header */}
      <View style={styles.headerBg}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>
              {getGreeting()}, {session?.user?.name?.split(" ")[0] || "User"}!{" "}
              <Text style={{ fontSize: 20 }}>👋</Text>
            </Text>
            <Text style={styles.sehatId}>
              SEHAT ID :{" "}
              <Text style={styles.sehatIdValue}>
                #{session?.user?.sehatId || "N/A"}
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Reports Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Reports</Text>
          <Text style={styles.patientCount}>
            {summaries.length} {summaries.length === 1 ? "Report" : "Reports"}
          </Text>
        </View>

        {summaries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name='document-outline' size={48} color='#FF5893' />
            <Text style={styles.emptyText}>No reports available</Text>
            <Text style={styles.emptySubtext}>
              Upload your first prescription to get started
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.push("/upload")}>
              <Text style={styles.uploadButtonText}>Upload Report</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.patientsList}>
            {summaries.map((summary) => (
              <TouchableOpacity
                key={summary._id}
                style={styles.patientCard}
                onPress={() => router.push(`/prescription/${summary._id}`)}>
                <View style={styles.patientCardContent}>
                  <View style={styles.patientAvatarContainer}>
                    <Ionicons
                      name='document-text-outline'
                      size={24}
                      color='#FF5893'
                    />
                  </View>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName} numberOfLines={2}>
                      {summary.summary}
                    </Text>
                    <Text style={styles.patientId}>
                      {formatDate(summary.createdAt)}
                    </Text>
                    <View style={styles.patientDetailsRow}>
                      <View style={styles.detailItem}>
                        <Ionicons
                          name='medkit-outline'
                          size={16}
                          color='#666'
                        />
                        <Text style={styles.detailText}>
                          {summary.keyMedications.length} Medications
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons
                          name='warning-outline'
                          size={16}
                          color='#666'
                        />
                        <Text style={styles.detailText}>
                          {summary.warnings.length} Warnings
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerBg: {
    backgroundColor: "#FF5893",
    paddingTop: 80,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  sehatId: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  sehatIdValue: {
    fontWeight: "600",
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  patientCount: {
    fontSize: 14,
    color: "#666",
  },
  patientsList: {
    gap: 15,
  },
  patientCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  patientAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF0F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  patientAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  patientId: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  patientDetailsRow: {
    flexDirection: "row",
    gap: 15,
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
  emptyContainer: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: "#FF5893",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
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
    color: "#FF5893",
    textAlign: "center",
    marginTop: 10,
  },
  qrButton: {
    position: "absolute",
    bottom: -4,
    right: -40,
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
});
