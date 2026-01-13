import {onRequest} from "firebase-functions/v2/https";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";

admin.initializeApp();
const db = getFirestore("shoppego");

// --- Interfaces ---

interface WebhookPayload {
  action: string;
  checkout: {
    id: number;
    domain: string;
    total: string;
    completed_at: string;
    created_at: string;
    currency: string;
    items: {
      product: {
        name: string;
        sku: string;
      };
      name: string; // Variant name e.g. "S / Red"
      price: number;
      quantity: number;
    }[];
    customer?: {
      email?: string;
      first_name?: string;
      last_name?: string;
    };
    [key: string]: any;
  };
}

interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  customer?: {
    email?: string;
    name?: string;
  };
  createdAt: any;
}

interface RequestQuery {
  storeId?: string;
}

// --- Cloud Functions ---

export const shoppegoWebhook = onRequest(async (req, res) => {
  try {
    const body = req.body as WebhookPayload;
    const query = req.query as unknown as RequestQuery;

    let storeId = query.storeId;

    // 1. Identify Store
    if (!storeId) {
      // Try to find store by domain from payload
      const domain = body.checkout?.domain;
      if (domain) {
        const storeQuery = await db.collection("stores")
          .where("domain", "==", domain)
          .limit(1)
          .get();

        if (!storeQuery.empty) {
          storeId = storeQuery.docs[0].id;
        } else {
          console.warn(`Store not found for domain: ${domain}`);
          res.status(404).send(`Store not found for domain: ${domain}`);
          return;
        }
      } else {
        console.warn("Missing storeId in query and domain in payload");
        res.status(400).send("Missing store identification");
        return;
      }
    }

    const storeRef = db.collection("stores").doc(storeId!);
    const storeDoc = await storeRef.get();

    if (!storeDoc.exists) {
      console.warn(`Store ID ${storeId} not found`);
      res.status(404).send("Store not found");
      return;
    }

    // 2. Map Payload to OrderData
    if (!body.checkout) {
      res.status(400).send("Missing checkout data");
      return;
    }

    const checkout = body.checkout;
    const orderItems: OrderItem[] = checkout.items.map((item) => ({
      // Use SKU as ID, fallback to random if missing
      productId: item.product.sku ||
        `sku-${Math.random().toString(36).substr(2, 9)}`,
      name: item.name || item.product.name,
      sku: item.product.sku,
      price: item.price,
      quantity: item.quantity,
    }));

    const orderData: OrderData = {
      id: String(checkout.id),
      total: parseFloat(checkout.total),
      status: "paid", // Webhook action is checkout.completed
      items: orderItems,
      customer: {
        email: checkout.customer?.email,
        name: [
          checkout.customer?.first_name,
          checkout.customer?.last_name,
        ].filter(Boolean).join(" "),
      },
      createdAt: admin.firestore.Timestamp.now(),
    };

    // 3. Product Sync & Cost Retrieval
    let totalCost = 0;
    const batch = db.batch();

    for (const item of orderData.items) {
      const productRef = storeRef.collection("products").doc(item.productId);
      const productSnap = await productRef.get();
      let costPrice = 0;

      if (!productSnap.exists) {
        // New product discovered via webhook
        batch.set(productRef, {
          name: item.name,
          sku: item.sku,
          costPrice: 0, // User must edit this later
          currentSellingPrice: item.price,
          totalSold: admin.firestore.FieldValue.increment(item.quantity),
        }, {merge: true});
      } else {
        const pData = productSnap.data();
        costPrice = pData?.costPrice || 0;
        batch.update(productRef, {
          currentSellingPrice: item.price,
          totalSold: admin.firestore.FieldValue.increment(item.quantity),
        });
      }

      totalCost += (costPrice * item.quantity);
    }

    // 4. Save Order
    const orderRef = storeRef.collection("orders").doc(orderData.id);
    batch.set(orderRef, {
      ...orderData,
      estimatedCost: totalCost,
      estimatedProfit: orderData.total - totalCost,
    }, {merge: true});

    // 5. Update Daily Aggregates
    const today = new Date().toISOString().split("T")[0];
    const statsRef = storeRef.collection("aggregates").doc(today);

    batch.set(statsRef, {
      totalRevenue: admin.firestore.FieldValue.increment(orderData.total),
      totalOrders: admin.firestore.FieldValue.increment(1),
      totalProfit: admin.firestore.FieldValue.increment(
        orderData.total - totalCost
      ),
    }, {merge: true});

    await batch.commit();

    // 6. Send Notification
    const ownerId = storeDoc.data()?.ownerId;
    if (ownerId) {
      const userDoc = await db.collection("users").doc(ownerId).get();
      const fcmToken = userDoc.data()?.fcmToken;
      // This might differ from payload currency
      const currency = storeDoc.data()?.currency || "$";

      if (fcmToken) {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: "New Order Received! 💰",
            body: `Order #${orderData.id} for ${currency} ${orderData.total}`,
          },
          data: {screen: "OrderDetail", orderId: orderData.id},
        });
      }
    }

    res.status(200).send("Webhook Processed");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Error");
  }
});

export const recalculateProfit = onDocumentUpdated(
  {
    document: "stores/{storeId}/products/{productId}",
    database: "shoppego",
  },
  async (event) => {
    const newData = event.data?.after.data();
    const previousData = event.data?.before.data();

    if (!newData || !previousData) return null;

    // Check if cost price changed
    if (newData.costPrice === previousData.costPrice) return null;

    const oldCost = previousData.costPrice || 0;
    const newCost = newData.costPrice || 0;
    const totalSold = newData.totalSold || 0;

    // Calculate total profit difference
    const profitAdjustment = (oldCost - newCost) * totalSold;

    console.log(
      `Recalculating profit for ${event.params.productId}: ` +
      `Adjustment ${profitAdjustment}`
    );

    return null;
  }
);
