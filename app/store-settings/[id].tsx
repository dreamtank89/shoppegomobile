import { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function StoreSettings() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [webhookUrl, setWebhookUrl] = useState('');

    useEffect(() => {
        fetchStore();
        // Construct the webhook URL based on the project ID
        // Note: For local dev it would be diff, but for prod it's standard
        const projectId = "shoppego-dashboard-fp";
        const region = "us-central1"; // Default region
        setWebhookUrl(`https://${region}-${projectId}.cloudfunctions.net/shoppegoWebhook`);
    }, [id]);

    const fetchStore = async () => {
        try {
            const docRef = doc(db, 'stores', id as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setStore({ id: docSnap.id, ...docSnap.data() });
            } else {
                Alert.alert('Error', 'Store not found');
                router.back();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Delete Store",
            "Are you sure? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'stores', id as string));
                            router.back();
                        } catch (e: any) {
                            Alert.alert('Error', e.message);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <View className="flex-1 bg-white justify-center items-center"><Text>Loading...</Text></View>;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row items-center space-x-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text_main">Store Settings</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                <View className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <Text className="text-text_muted text-xs uppercase font-bold mb-2">Store Profile</Text>
                    <Text className="text-2xl font-bold text-text_main mb-1">{store?.storeName}</Text>
                    <Text className="text-text_muted">{store?.currency} • {store?.id}</Text>
                </View>

                <View className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <Text className="text-text_muted text-xs uppercase font-bold mb-4">Webhook Configuration</Text>
                    <Text className="text-text_main mb-2">Copy these details into your Shoppego.my Settings.</Text>

                    <View className="mb-4">
                        <Text className="text-sm font-semibold mb-1 text-text_main">Webhook URL</Text>
                        <View className="bg-gray-100 p-3 rounded-lg">
                            <Text className="text-gray-600 select-all">{webhookUrl}</Text>
                        </View>
                    </View>

                    <View>
                        <Text className="text-sm font-semibold mb-1 text-text_main">Secret Key</Text>
                        <View className="bg-gray-100 p-3 rounded-lg">
                            <Text className="text-gray-600 select-all font-mono">{store?.webhookSecret}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleDelete}
                    className="bg-red-50 p-4 rounded-xl items-center border border-red-100"
                >
                    <Text className="text-red-600 font-bold">Delete Store</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
