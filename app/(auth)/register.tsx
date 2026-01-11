import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password) return Alert.alert('Error', 'Please fill all fields');
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            // Create User Document
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: name,
                createdAt: new Date(),
            });

            router.replace('/(tabs)/dashboard');
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center px-6">
            <Text className="text-3xl font-bold text-text_main mb-2">Create Account</Text>
            <Text className="text-text_muted mb-8">Join Shoppego Dashboard</Text>

            <TextInput
                className="w-full p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 text-text_main"
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
            />

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
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Sign Up</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-center text-text_muted">Already have an account? <Text className="text-primary font-bold">Sign In</Text></Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
