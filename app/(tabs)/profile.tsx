import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../services/firebaseConfig';
import { useRouter, useFocusEffect } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { WebhookCard } from '../../components/WebhookCard';

export default function Profile() {
    const router = useRouter();
    const [stores, setStores] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const user = auth.currentUser;

    const fetchStores = async () => {
        if (!user) return;
        try {
            const q = query(collection(db, 'stores'), where('ownerId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const userStores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStores(userStores);
        } catch (error) {
            console.error("Error fetching stores:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStores();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStores();
        setRefreshing(false);
    }

    const handleLogout = async () => {
        await signOut(auth);
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-6 pb-6 pt-2 border-b border-gray-100">
                <Text className="text-3xl font-bold text-text_main mb-6">My Profile</Text>
                <View className="flex-row items-center space-x-4">
                    <View className="h-16 w-16 bg-primary rounded-full items-center justify-center shadow-sm">
                        <Text className="text-white text-2xl font-bold">
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </Text>
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-text_main mb-0.5">{user?.displayName || "Store Owner"}</Text>
                        <Text className="text-text_muted text-sm">{user?.email}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-4 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View className="flex-row justify-between items-center mb-4 px-2">
                    <Text className="text-lg font-bold text-gray-800">My Stores</Text>
                    <TouchableOpacity onPress={() => router.push('/setup')} className="flex-row items-center">
                        <MaterialIcons name="add" size={20} color="#635BFF" />
                        <Text className="text-primary font-bold ml-1">Add New</Text>
                    </TouchableOpacity>
                </View>

                {stores.map((store) => (
                    <TouchableOpacity
                        key={store.id}
                        // @ts-ignore
                        onPress={() => router.push({ pathname: '/store-settings/[id]', params: { id: store.id } })}
                        className="bg-white p-5 rounded-xl shadow-sm mb-4 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center space-x-4">
                            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                                <MaterialIcons name="store" size={20} color="#635BFF" />
                            </View>
                            <View>
                                <Text className="font-bold text-text_main text-base">{store.storeName}</Text>
                                <Text className="text-xs text-text_muted">ID: {store.id.substring(0, 8)}...</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
                    </TouchableOpacity>
                ))}

                {stores.length === 0 && !refreshing && (
                    <View className="items-center py-10">
                        <Text className="text-gray-400">No stores found.</Text>
                    </View>
                )}

                <TouchableOpacity onPress={handleLogout} className="mt-8 bg-white border border-gray-200 p-4 rounded-xl items-center flex-row justify-center space-x-2">
                    <MaterialIcons name="logout" size={20} color="#EF4444" />
                    <Text className="text-red-500 font-bold">Sign Out</Text>
                </TouchableOpacity>

                <View className="mt-8">
                    <WebhookCard storeId="test-store-1" />
                </View>

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
