const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.shoppegoWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const { storeId, orderData } = req.body;

        // 1. Verify Store Exists & Authenticate
        if (!storeId || !orderData) return res.status(400).send("Missing payload");

        const storeRef = db.collection('stores').doc(storeId);
        const storeDoc = await storeRef.get();

        if (!storeDoc.exists) return res.status(404).send("Store not found");

        // TODO: Verify Signature using webhookSecret
        // const signature = req.headers['x-shoppego-signature'];
        // if (signature !== storeDoc.data().webhookSecret) ...

        // 2. Product Sync & Cost Retrieval
        let totalCost = 0;
        const batch = db.batch();

        for (const item of orderData.items) {
            const productRef = storeRef.collection('products').doc(item.productId);
            const productSnap = await productRef.get();
            let costPrice = 0;

            if (!productSnap.exists) {
                // New product discovered via webhook
                batch.set(productRef, {
                    name: item.name,
                    sku: item.sku,
                    costPrice: 0, // User must edit this later
                    currentSellingPrice: item.price,
                    totalSold: admin.firestore.FieldValue.increment(item.quantity)
                });
            } else {
                const pData = productSnap.data();
                costPrice = pData.costPrice || 0;
                batch.update(productRef, {
                    currentSellingPrice: item.price,
                    totalSold: admin.firestore.FieldValue.increment(item.quantity)
                });
            }

            totalCost += (costPrice * item.quantity);
        }

        // 3. Save Order
        const orderRef = storeRef.collection('orders').doc(orderData.id);
        batch.set(orderRef, {
            ...orderData,
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            estimatedCost: totalCost,
            estimatedProfit: orderData.total - totalCost,
            status: orderData.status || 'paid'
        });

        // 4. Update Daily Aggregates
        const today = new Date().toISOString().split('T')[0];
        const statsRef = storeRef.collection('aggregates').doc(today);

        batch.set(statsRef, {
            totalRevenue: admin.firestore.FieldValue.increment(orderData.total),
            totalOrders: admin.firestore.FieldValue.increment(1),
            totalProfit: admin.firestore.FieldValue.increment(orderData.total - totalCost)
        }, { merge: true });

        await batch.commit();

        // 5. Send Notification
        const ownerId = storeDoc.data().ownerId;
        const userDoc = await db.collection('users').doc(ownerId).get();
        const fcmToken = userDoc.data()?.fcmToken;

        if (fcmToken) {
            await admin.messaging().send({
                token: fcmToken,
                notification: {
                    title: "New Order Received! 💰",
                    body: `Order #${orderData.id} for ${storeDoc.data().currency} ${orderData.total}`
                },
                data: { screen: "OrderDetail", orderId: orderData.id }
            });
        }

        res.status(200).send("Webhook Processed");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Error");
    }
});

exports.recalculateProfit = functions.firestore
    .document('stores/{storeId}/products/{productId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const previousData = change.before.data();

        // Check if cost price changed
        if (newData.costPrice === previousData.costPrice) return null;

        const oldCost = previousData.costPrice || 0;
        const newCost = newData.costPrice || 0;
        const totalSold = newData.totalSold || 0;

        // Calculate total profit difference
        // Profit = Revenue - Cost.
        // If Cost decreases, Profit increases.
        // Diff = (OldCost - NewCost) * TotalSold
        const profitAdjustment = (oldCost - newCost) * totalSold; // If cost drops (Old > New), Profit Adjustment is POSITIVE. Correct.

        console.log(`Recalculating profit for ${context.params.productId}: Adjustment ${profitAdjustment}`);

        // Update Today's stats just to show impact, or a global counter.
        // For simplicity in this scope, we log it. 
        // Real implementation would update a 'totalLifetimeProfit' or similar.

        return null;
    });
