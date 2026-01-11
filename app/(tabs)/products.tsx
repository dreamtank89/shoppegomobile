import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

export default function Products() {
    const { user } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [newCost, setNewCost] = useState('');
    const [loading, setLoading] = useState(true);

    // Hardcoded storeId for now, ideally fetch from user profile
    const storeId = "CURRENT_STORE_ID"; // TODO: Implement store context

    useEffect(() => {
        if (!user) return;

        // Placeholder logic for listing products
        // In real app, listen to stores/{storeId}/products
        // const q = query(collection(db, 'stores', storeId, 'products'));
        // const unsub = onSnapshot(q, (snap) => {
        //   const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        //   setProducts(list);
        //   setLoading(false);
        // });
        // return unsub;
        setLoading(false);
    }, [user]);

    const handleUpdateCost = async () => {
        if (!selectedProduct || !newCost) return;

        try {
            const cost = parseFloat(newCost);
            if (isNaN(cost)) throw new Error("Invalid cost");

            // await updateDoc(doc(db, 'stores', storeId, 'products', selectedProduct.id), {
            //   costPrice: cost
            // });

            Alert.alert("Success", "Cost updated!");
            setSelectedProduct(null);
            setNewCost('');
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="p-4 bg-white border-b border-gray-100 flex-row justify-between items-center"
            onPress={() => { setSelectedProduct(item); setNewCost(item.costPrice?.toString() || ''); }}
        >
            <View>
                <Text className="font-bold text-text_main">{item.name}</Text>
                <Text className="text-text_muted text-sm">{item.sku}</Text>
            </View>
            <View className="items-end">
                <Text className="text-primary font-bold">${item.currentSellingPrice}</Text>
                <Text className="text-xs text-text_muted">Cost: ${item.costPrice || 0}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="p-4 bg-white border-b border-gray-200">
                <Text className="text-2xl font-bold text-text_main">Products</Text>
            </View>

            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <View className="p-8 items-center">
                        <Text className="text-text_muted">No products found via webhook yet.</Text>
                    </View>
                }
            />

            <Modal visible={!!selectedProduct} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white p-6 rounded-t-2xl">
                        <Text className="text-xl font-bold mb-4">Edit Cost Price</Text>
                        <Text className="mb-2 text-text_muted">{selectedProduct?.name}</Text>

                        <TextInput
                            className="w-full p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 text-text_main"
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={newCost}
                            onChangeText={setNewCost}
                        />

                        <TouchableOpacity
                            className="w-full p-4 bg-primary rounded-lg items-center mb-2"
                            onPress={handleUpdateCost}
                        >
                            <Text className="text-white font-bold">Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full p-4 items-center"
                            onPress={() => setSelectedProduct(null)}
                        >
                            <Text className="text-text_muted">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
