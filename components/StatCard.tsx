import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface StatCardProps {
    title: string;
    value?: string | number | null;
    percentage?: string;
    isPositive?: boolean;
    icon: keyof typeof MaterialIcons.glyphMap;
    hasBorderRight?: boolean;
    hasBorderBottom?: boolean;
}

export function StatCard({ title, value, percentage, isPositive = true, icon, hasBorderRight, hasBorderBottom }: StatCardProps) {
    // Logic: strictly fallback to "0" if value is null, undefined, or empty string.
    const displayValue = (value === null || value === undefined || value === '') ? '0' : value;

    return (
        <View className={`p-5 w-[50%] ${hasBorderRight ? 'border-r border-gray-100' : ''} ${hasBorderBottom ? 'border-b border-gray-100' : ''} justify-center`}>
            <View className="w-10 h-10 bg-gray-50 rounded-lg items-center justify-center mb-4">
                <MaterialIcons name={icon} size={20} color="#64748B" />
            </View>

            <Text className="text-gray-500 font-bold text-[10px] tracking-wider uppercase mb-1">{title}</Text>

            <View className="flex-row items-baseline justify-between mt-1 pr-2">
                <Text className="text-xl font-bold text-gray-900">{displayValue}</Text>
                {percentage && (
                    <Text className={`text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{percentage}
                    </Text>
                )}
            </View>
        </View>
    );
}
