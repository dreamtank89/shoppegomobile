import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#635BFF',
            tabBarInactiveTintColor: '#9CA3AF',
            headerShown: false,
            tabBarStyle: {
                borderTopWidth: 1,
                borderTopColor: '#F3F4F6',
                elevation: 0,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
            }
        }}>
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color }) => <MaterialIcons name="list-alt" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color }) => <MaterialIcons name="bar-chart" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="products"
                options={{
                    title: 'Products',
                    tabBarIcon: ({ color }) => <MaterialIcons name="inventory" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />
                }}
            />
        </Tabs>
    );
}
