import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';

// TODO: Replace with actual Project ID from your Firebase Console
const FIREBASE_PROJECT_ID = "shoppego-dashboard-fp";
const REGION = "us-central1"; // Default region
const FUNCTION_NAME = "shoppegoWebhook";

export const WebhookCard = ({ storeId }: { storeId: string }) => {
    const [copied, setCopied] = useState(false);

    // Construct the URL
    // Format: https://REGION-PROJECT_ID.cloudfunctions.net/FUNCTION_NAME?storeId=STORE_ID
    const webhookUrl = `https://${REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/${FUNCTION_NAME}?storeId=${storeId}`;

    const handleCopy = async () => {
        await Clipboard.setStringAsync(webhookUrl);
        setCopied(true);
        // Reset "Copied" state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <View className="mb-6">
            <Text className="text-gray-500 font-semibold text-xs tracking-wider uppercase mb-3">
                WEBHOOK INTEGRATION
            </Text>

            <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <Text className="text-gray-600 text-sm mb-3">
                    Paste this URL into Shoppego to receive real-time order updates.
                </Text>

                <View className="flex-row items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <MaterialIcons name="link" size={20} color="#64748B" />
                    <Text className="flex-1 text-gray-600 text-xs font-medium" numberOfLines={1} ellipsizeMode="middle">
                        {webhookUrl}
                    </Text>

                    <TouchableOpacity
                        onPress={handleCopy}
                        className={`px-3 py-1.5 rounded-lg ${copied ? 'bg-green-100' : 'bg-white border border-gray-200'}`}
                    >
                        {copied ? (
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="check" size={14} color="#166534" />
                                <Text className="text-xs font-bold text-green-700">Copied</Text>
                            </View>
                        ) : (
                            <Text className="text-xs font-semibold text-gray-700">Copy</Text>
                        )}
                    </TouchableOpacity>
                </View>


            </View>
        </View>
    );
};
