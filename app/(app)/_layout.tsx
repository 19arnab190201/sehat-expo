import { Redirect, Stack } from "expo-router";
import { useSession } from "../../contexts/auth";

export default function AppLayout() {
  const { session } = useSession();

  if (!session) {
    return <Redirect href='/' />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='(patient)' options={{ headerShown: false }} />
      <Stack.Screen name='(doctor)' options={{ headerShown: false }} />
      <Stack.Screen name='prescription' options={{ headerShown: false }} />
      <Stack.Screen name='qr-code' options={{ headerShown: false }} />
    </Stack>
  );
}
