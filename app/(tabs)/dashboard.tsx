import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ChartModule } from '../../components/ChartModule';
import { StatCard } from '../../components/StatCard';
import { TrafficCard } from '../../components/TrafficCard';
import { RecentOrders } from '../../components/RecentOrders';

export default function Dashboard() {
    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-50">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-teal-100 rounded-full overflow-hidden items-center justify-center border-2 border-white shadow-sm">
                        {/* Avatar Placeholder - ideally would be an Image */}
                        <MaterialIcons name="person" size={24} color="#009688" />
                    </View>
                    <Text className="text-xl font-bold text-gray-900">Shoppego</Text>
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

                {/* Key Statistics */}
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
