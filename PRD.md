Product Requirements Document (PRD): Shoppego Sales DashboardProject NameShoppego Sales DashboardVersion1.0.0StatusDraftPlatformReact Native (Expo Router)BackendFirebase (Firestore, Cloud Functions, Auth, Messaging)Primary Data SourceShoppego.my Webhooks (One-way sync)1. Executive SummaryThe Shoppego Sales Dashboard is a mobile application designed for store owners to monitor their e-commerce performance in real-time. It acts as a companion app to the main Shoppego web platform. The app ingests order data via webhooks, allowing users to view sales analytics, track key metrics (AOV, Total Orders, etc.), and receive push notifications for new sales. Uniquely, it allows users to input "Cost of Goods Sold" (COGS) for their products to calculate net profit and margins—data not provided by the webhook.2. User Roles & Multi-TenancyStore Owner: The primary user. Can own multiple stores (Multi-tenancy).Store Context: The app must allow switching between different "Store" views if a user owns multiple shops. Data is siloed per store.3. Sitemap & Page Specifications3.1 App Navigation Structure (Tab Based)Based on the design provided, the app uses a bottom tab navigator.TabScreen NameFunctionalityHomeDashboard OverviewMain landing. Sales charts, key KPI cards.OrdersOrders ListList of all incoming webhook orders.StatsAnalyticsDeep dive into products, customers, and profit margins.ProductsCost Management(CRUD) List products to manage Cost Price.ProfileSettings/AccountStore switching, Notification toggles.3.2 Detailed Page Functionality & CRUD MappingA. Auth & OnboardingPages: Login, Register, "Add Store" (API Key setup).CRUD:Create: User Account (users collection).Create: Store profile (stores subcollection).B. Dashboard (Home)
UI Components:

Total Revenue: Large display with trend indicator (e.g., "+12%").

Interactive Sales Chart: A curved area chart displaying sales over time (12AM - 11PM).

Library: react-native-gifted-charts.

Interaction: User can drag/press along the line to see a tooltip with the specific time and revenue amount (e.g., "$8,240").

Visuals: Gradient fill (Primary color fading to transparent), smooth Bezier curve.

Filters: Time range toggle (Today, 7D, 30D).

Read: Aggregate sales data from stores/{storeId}/aggregates.C. Orders ListPages: Orders List, Order Detail View.Read: Query orders collection descending by createdAt.Filter: Status (Paid, Pending, Refunded).D. Analytics (Stats)Visuals:Pie Chart: Sales by Product.Map/List: Orders by Region (Address).Metric: Total Customers (Unique emails).Computation: Cloud Functions compute these aggregates to avoid expensive client-side queries.E. Product Cost Manager (Crucial Feature)Pages: Product List, Edit Product Cost Modal.Read: List unique products captured from orders.Update: User inputs cost_price for a specific SKU/Product ID.Logic: When cost_price is updated, a Cloud Function triggers to recalculate historical "Profit" stats for that store.4. Firestore Data StructureWe will use a Subcollection Architecture to handle multi-tenancy securely.Collection: usersuid (Document ID): User's Firebase Auth ID.email: StringdisplayName: StringfcmToken: String (For push notifications)Collection: storesstoreId (Document ID): Unique Store ID (generated).ownerId: Reference to users/{uid}.storeName: String (e.g., "Main Boutique").webhookSecret: String (Used to verify incoming webhook signature).currency: String (e.g., "MYR").Subcollection: stores/{storeId}/ordersorderId: String (from Shoppego).customer: Object { name, email, phone }.address: Object { city, state, country, zip }.items: Array [{ productId, sku, name, quantity, price, total }].totalAmount: Number.status: String (paid, pending).createdAt: Timestamp.Subcollection: stores/{storeId}/productsproductId (Document ID): Product ID from Shoppego.sku: String.name: String.currentSellingPrice: Number (Last known price from webhook).costPrice: Number (User Editable Field).totalSold: Number (Aggregated).Subcollection: stores/{storeId}/aggregatesdailyStats: Document ID YYYY-MM-DD.totalRevenue: Number.totalOrders: Number.totalProfit: Number (Revenue - (SoldQty * CostPrice)).productBreakdown: Map { productId: qty }.5. Firebase Cloud Functions & Webhook GuideThis section details how to handle the incoming data from Shoppego.my.5.1 Webhook Endpoint DesignEndpoint: https://your-region-project.cloudfunctions.net/api/webhookMethod: POST5.2 Logic Flow (The "Ingest" Function)Verification: Check the X-Shoppego-Signature header against the store's webhookSecret stored in Firestore to ensure the request is legitimate.Product Upsert: Iterate through the items in the order payload.Check if stores/{storeId}/products/{productId} exists.If No: Create it with costPrice: 0.If Yes: Update currentSellingPrice (do not overwrite costPrice).Save Order: Write the raw JSON to stores/{storeId}/orders/{orderId}.Aggregate Calculation (Atomic Increment):Target stores/{storeId}/aggregates/{todayDate}.totalRevenue: FieldValue.increment(order.total).totalOrders: FieldValue.increment(1).Notification Trigger: Send an FCM message to the Store Owner.5.3 Pseudocode for Cloud FunctionJavaScript// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.shoppegoWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const { storeId, orderData } = req.body; 
    
    // 1. Verify Store Exists & Authenticate
    const storeRef = db.collection('stores').doc(storeId);
    const storeDoc = await storeRef.get();
    
    if (!storeDoc.exists) return res.status(404).send("Store not found");

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
                currentSellingPrice: item.price
            });
        } else {
            const pData = productSnap.data();
            costPrice = pData.costPrice || 0;
        }
        
        totalCost += (costPrice * item.quantity);
    }

    // 3. Save Order
    const orderRef = storeRef.collection('orders').doc(orderData.id);
    batch.set(orderRef, {
        ...orderData,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        estimatedCost: totalCost,
        estimatedProfit: orderData.total - totalCost
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
    const fcmToken = userDoc.data().fcmToken;

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
6. Development PhasesPhase 1: FoundationSetup Expo project with Tailwind/NativeWind.Implement Authentication (Firebase Auth).Create "Add Store" feature to generate webhookSecret.Phase 2: Webhook & DataDeploy Firebase Cloud Functions.Test Webhook ingestion using Postman (simulating Shoppego).Verify Firestore population (Orders & Products).Phase 3: Dashboard UIImplement Home screen using the provided JSON Style Guide.Build the SVG Line Chart using strict react-native-svg paths (no libraries).Connect aggregates to the UI for fast loading.Phase 4: Product Costs & LogicBuild the Products screen.Implement the "Edit Cost" modal.Write a "Recalculate Profit" script (Cloud Function) that runs when a Cost Price is updated to fix historical data.Phase 5: NotificationsConfigure Expo Notifications.Link FCM tokens to User profiles on login.