import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)/dashboard');
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center px-6">
            <Text className="text-3xl font-bold text-text_main mb-2">Welcome Back</Text>
            <Text className="text-text_muted mb-8">Sign in to manage your store</Text>

            <TextInput
                className="w-full p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 text-text_main"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <TextInput
                className="w-full p-4 border border-gray-200 rounded-lg mb-6 bg-gray-50 text-text_main"
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                className="w-full p-4 bg-primary rounded-lg items-center mb-4"
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Sign In</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-center text-text_muted">Don't have an account? <Text className="text-primary font-bold">Sign Up</Text></Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
