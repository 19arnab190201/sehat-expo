import React from "react";
import { View, StyleSheet } from "react-native";
import { useSession } from "../../../contexts/auth";
import UploadScreen from "../upload";
import DoctorScreen from "../doctor";

export default function CenterScreen() {
  const { session } = useSession();
  const isDoctor = session?.user?.userType === "doctor";

  return (
    <View style={styles.container}>
      {isDoctor ? <DoctorScreen /> : <UploadScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
