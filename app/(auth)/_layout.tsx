import { Redirect, Stack } from "expo-router";
import { useSession } from "../../contexts/auth";

export default function AuthLayout() {
  const { session } = useSession();

  if (session) {
    return <Redirect href='/(tabs)' />;
  }

  return (
    <Stack>
      <Stack.Screen name='login' options={{ headerShown: false }} />
      <Stack.Screen name='signup' options={{ headerShown: false }} />
      <Stack.Screen name='verify' options={{ headerShown: false }} />
    </Stack>
  );
}
