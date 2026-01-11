import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../services/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SetupStore() {
    const [storeName, setStoreName] = useState('');
    const [currency, setCurrency] = useState('MYR');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreateStore = async () => {
        if (!storeName) return Alert.alert('Error', 'Please enter a store name');

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No authenticated user');

            // Generate webhook secret (simple uuid or random string)
            const webhookSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            // Create Store Doc
            const storeRef = await addDoc(collection(db, 'stores'), {
                ownerId: user.uid,
                storeName,
                currency,
                webhookSecret,
                createdAt: new Date()
            });

            // Update User with storeId
            await updateDoc(doc(db, 'users', user.uid), {
                stores: arrayUnion(storeRef.id)
            });

            Alert.alert('Success', `Store Created! Webhook Secret: ${webhookSecret}`);
            router.replace('/(tabs)/dashboard');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center px-6">
            <Text className="text-3xl font-bold text-text_main mb-2">Setup Your Store</Text>
            <Text className="text-text_muted mb-8">Create your first store profile.</Text>

            <TextInput
                className="w-full p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 text-text_main"
                placeholder="Store Name (e.g. My Boutique)"
                value={storeName}
                onChangeText={setStoreName}
            />

            <TextInput
                className="w-full p-4 border border-gray-200 rounded-lg mb-6 bg-gray-50 text-text_main"
                placeholder="Currency (e.g. MYR)"
                value={currency}
                onChangeText={setCurrency}
            />

            <TouchableOpacity
                className="w-full p-4 bg-primary rounded-lg items-center"
                onPress={handleCreateStore}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Create Store</Text>}
            </TouchableOpacity>
        </SafeAreaView>
    );
}
