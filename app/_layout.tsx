import "../global.css";
import { Stack } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { View, ActivityIndicator } from "react-native";

export default function Layout() {
    const { initialized } = useAuth();

    if (!initialized) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#635BFF" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="setup/index" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        </Stack>
    );
}
