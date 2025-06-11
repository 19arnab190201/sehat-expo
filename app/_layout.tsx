import { Stack } from "expo-router";
import { SessionProvider } from "../contexts/auth";
import { SplashScreenController } from "../components/SplashScreenController";
import { useSession } from "../contexts/auth";

export default function Root() {
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session } = useSession();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        navigationBarColor: "#121417",
      }}>
      <Stack.Screen
        name='(app)'
        options={{ headerShown: false }}
        redirect={!session}
      />
      <Stack.Screen
        name='(auth)'
        options={{ headerShown: false }}
        redirect={!!session}
      />
      <Stack.Screen name='+not-found' />
    </Stack>
  );
}
