import { View, Text, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, setDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../../services/firebaseConfig';

import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ChartModule } from '../../components/ChartModule';
import { StatCard } from '../../components/StatCard';
import { TrafficCard } from '../../components/TrafficCard';
import { RecentOrders } from '../../components/RecentOrders';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync({
            // projectId: 'your-project-id', // only needed if not using EAS
        })).data;
        console.log("Push Token Obtained:", token);
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export default function Dashboard() {
    const [storeName, setStoreName] = useState('Shoppego');
    const [expoPushToken, setExpoPushToken] = useState('');
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {
        // Register for push notifications
        registerForPushNotificationsAsync().then(async token => {
            if (token) {
                setExpoPushToken(token);
                // Save token to Firestore for our test user
                try {
                    // Simulating User ID: test-store-1
                    await setDoc(doc(db, "users", "test-store-1"), {
                        fcmToken: token,
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
                    console.log("Token saved to Firestore for user: test-store-1");
                } catch (e) {
                    console.error("Error saving token to Firestore:", e);
                }
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log("Notification Received:", notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("Notification Response:", response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    useEffect(() => {
        const fetchStoreName = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const q = query(collection(db, 'stores'), where('ownerId', '==', user.uid), limit(1));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const storeData = querySnapshot.docs[0].data();
                        if (storeData.storeName) {
                            setStoreName(storeData.storeName);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching store name:", error);
                }
            }
        };
        fetchStoreName();
    }, []);
    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-50">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-teal-100 rounded-full overflow-hidden items-center justify-center border-2 border-white shadow-sm">
                        {/* Avatar Placeholder - ideally would be an Image */}
                        <MaterialIcons name="person" size={24} color="#009688" />
                    </View>
                    <Text className="text-xl font-bold text-gray-900">{storeName}</Text>
                </View>
                <View className="flex-row gap-4">
                    <TouchableOpacity>
                        <MaterialIcons name="search" size={24} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <MaterialIcons name="notifications-none" size={24} color="#64748B" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>

                {/* Chart Section */}
                <ChartModule />

                <View className="mb-8">
                    <Text className="text-gray-500 font-semibold text-xs tracking-wider uppercase mb-4">KEY STATISTICS</Text>

                    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <View className="flex-row flex-wrap">
                            <StatCard
                                title="Total Orders"
                                value="342"
                                percentage="5.2%"
                                isPositive={true}
                                icon="shopping-bag"
                                hasBorderRight
                                hasBorderBottom
                            />
                            <StatCard
                                title="Avg. Order Value"
                                value="$41.50"
                                percentage="0.0%"
                                isPositive={true}
                                icon="payments"
                                hasBorderBottom
                            />
                            <StatCard
                                title="Store Visitors"
                                value="1,205"
                                percentage="12.4%"
                                isPositive={true}
                                icon="group"
                                hasBorderRight
                            />
                            <StatCard
                                title="Refunds"
                                value="$120"
                                percentage="2.1%"
                                isPositive={false}
                                icon="keyboard-return"
                            />
                        </View>
                    </View>
                </View>

                {/* Traffic Spike */}
                <TrafficCard />
                {/* Recent Orders */}
                <RecentOrders />

                {/* Bottom padding for scrolling past bottom tabs */}
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
