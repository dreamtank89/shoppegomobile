import { View, Text, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useState } from 'react';

export function ChartModule() {
    const [range, setRange] = useState<'Today' | '7D' | '30D'>('Today');

    const data = [
        { value: 0 },
        { value: 20 },
        { value: 18 },
        { value: 40 },
        { value: 36 },
        { value: 60 },
        { value: 50 },
        { value: 80 },
    ];

    const RangeButton = ({ title }: { title: 'Today' | '7D' | '30D' }) => (
        <TouchableOpacity
            onPress={() => setRange(title)}
            className={`px-3 py-1 rounded-lg ${range === title ? 'bg-gray-100' : 'bg-transparent'}`}
        >
            <Text className={`text-xs font-semibold ${range === title ? 'text-gray-900' : 'text-gray-400'}`}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="mb-8">
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-gray-500 font-semibold text-xs tracking-wider uppercase mt-2">TOTAL REVENUE</Text>

                <View className="flex-row bg-white border border-gray-100 rounded-xl p-1">
                    <RangeButton title="Today" />
                    <RangeButton title="7D" />
                    <RangeButton title="30D" />
                </View>
            </View>

            <View className="flex-row items-center gap-3 mb-6">
                <Text className="text-4xl font-bold text-gray-900">$14,203.50</Text>
                <View className="bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <Text className="text-green-600 font-bold text-xs">↑ 12%</Text>
                </View>
            </View>

            <LineChart
                areaChart
                curved
                data={data}
                height={220}
                thickness={4}
                color="#635BFF"
                startFillColor="#635BFF"
                startOpacity={0.15}
                endFillColor="#635BFF"
                endOpacity={0.02}
                hideDataPoints
                hideRules={false}
                rulesType="dashed"
                rulesColor="#F1F5F9"
                yAxisColor="transparent"
                xAxisColor="transparent"
                hideYAxisText
                initialSpacing={0}
                pointerConfig={{
                    pointerStripHeight: 160,
                    pointerStripColor: '#635BFF',
                    pointerStripWidth: 2,
                    pointerStripUptoDataPoint: true,
                    pointerColor: '#635BFF',
                    radius: 8,
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 90,
                    activatePointersOnLongPress: false,
                    autoAdjustPointerLabelPosition: false,
                    pointerComponent: () => (
                        <View className="h-4 w-4 rounded-full bg-white border-4 border-[#635BFF] shadow-lg" />
                    ),
                    pointerLabelComponent: (items: any) => {
                        return (
                            <View className="bg-white rounded-lg px-3 py-2 shadow-xl border border-gray-100 -ml-4">
                                <Text className="text-gray-900 font-bold text-lg">${items[0].value}</Text>
                            </View>
                        );
                    },
                }}
            />

            {/* Custom X Axis Labels to match design exactly */}
            <View className="flex-row justify-between px-2 mt-2">
                <Text className="text-gray-400 text-xs">12 AM</Text>
                <Text className="text-gray-400 text-xs">6 AM</Text>
                <Text className="text-gray-400 text-xs">12 PM</Text>
                <Text className="text-gray-400 text-xs">6 PM</Text>
                <Text className="text-gray-400 text-xs">11 PM</Text>
            </View>
        </View>
    );
}
