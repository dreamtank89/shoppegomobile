import { View, Text, TouchableOpacity } from 'react-native';

interface Order {
    id: string;
    store: string;
    time: string;
    amount: string;
    status: 'completed' | 'pending' | 'processing';
}

// Temporary data for demonstration
const RECENT_ORDERS: Order[] = [
    { id: '#1024', store: 'Main Boutique', time: 'Just now', amount: '$55.00', status: 'completed' },
    { id: '#1023', store: 'Etsy Shop', time: '2 mins ago', amount: '$120.00', status: 'processing' },
    { id: '#1022', store: 'Amazon', time: '15 mins ago', amount: '$89.99', status: 'completed' },
];

export function RecentOrders() {
    return (
        <View>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-500 font-semibold text-xs tracking-wider uppercase">RECENT ORDERS</Text>
                <TouchableOpacity>
                    <Text className="text-[#635BFF] font-semibold text-xs uppercase">VIEW ALL</Text>
                </TouchableOpacity>
            </View>

            <View className="gap-4">
                {RECENT_ORDERS.map((order) => (
                    <View key={order.id} className="flex-row justify-between items-center">
                        <View>
                            <View className="flex-row items-center mb-1">
                                <Text className="font-bold text-gray-900 text-base mr-2">Order {order.id}</Text>
                                <View className={`w-2 h-2 rounded-full ${order.status === 'completed' ? 'bg-green-400' : 'bg-orange-400'}`} />
                            </View>
                            <Text className="text-gray-500 text-sm">{order.store} • {order.time}</Text>
                        </View>
                        <Text className="font-bold text-gray-900 text-base">{order.amount}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
