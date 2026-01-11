import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export function TrafficCard() {
    return (
        <View className="bg-gray-50 p-4 rounded-2xl mb-6 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-2">
                    <MaterialIcons name="trending-up" size={20} color="#635BFF" />
                    <Text className="ml-2 font-bold text-gray-900 text-base">Traffic Spike</Text>
                </View>
                <Text className="text-gray-500 text-sm leading-5">
                    Store traffic is 40% higher than usual. Check your inventory levels.
                </Text>
            </View>
            <TouchableOpacity>
                <Text className="text-[#635BFF] font-semibold">View</Text>
            </TouchableOpacity>
        </View>
    );
}
