 Shoppego API Documentation
This guide details the available API methods, authentication requirements, and response structures for connecting the app with Shoppego, gathered from [https://api.shoppego.my/docs#/](https://api.shoppego.my/docs#/).
## Base URL
*   **Production:** `https://api.shoppego.my`
*   **Staging:** `https://api.shoppegram.dev`
## Authentication
The API uses **OAuth 2.0**. All API requests must include a valid access token in the `Authorization` header.
**Header:**
`Authorization: Bearer <access_token>`
### OAuth 2.0 Flow
1.  **Authorization Request**
    *   **URL:** `https://admin.shoppego.my/oauth/authorize` (Staging: `https://my.shoppegram.dev/oauth/authorize`)
    *   **Parameters:** `client_id`, `scope`, `redirect_uri`, `state`, `shop`
2.  **Token Exchange**
    *   **URL:** `https://{subdomain}/admin/oauth/access_token`
    *   **Method:** `POST`
    *   **Example Body:**
        ```json
        {
          "client_id": "your_client_id",
          "client_secret": "your_client_secret",
          "code": "authorization_code_from_step_1",
          "redirect_uri": "same_redirect_uri_as_step_1",
          "shop": "shop_domain",
          "grant_type": "authorization_code"
        }
        ```
### HMAC Verification
For webhooks and callbacks, verify the `hmac` parameter using your `client_secret` as the key (HMAC-SHA256).
---
## ApplicationWebhook
Manage webhooks for the authenticated store.
-   **GET** `/webhooks`
    -   **Description**: Get a paginated list of application webhooks.
    -   **Response (200)**:
        ```json
        {
          "data": [
            {
              "id": 1,
              "name": "Order Created Notification",
              "url": "https://myapp.com/webhooks/orders",
              "event": "order.created",
              "paused_at": null,
              "created_at": "2024-01-15T10:30:00.000000Z",
              "updated_at": "2024-01-15T15:45:30.000000Z"
            }
          ],
          "count": "1",
          "prev_cursor": null,
          "next_cursor": null
        }
        ```
-   **POST** `/webhooks`
    -   **Description**: Store a new webhook.
    -   **Request Body**:
        ```json
        {
          "type": "string",
          "name": "string",
          "url": "string"
        }
        ```
    -   **Response (200)**: Single webhook object (same structure as item in GET list).
-   **GET** `/webhooks/{webhook}`
    -   **Description**: Get details for a single webhook by ID.
    -   **Response (200)**: Single webhook object.
-   **PUT** `/webhooks/{webhook}`
    -   **Description**: Toggle the paused state of a webhook by ID (pause or unpause).
    -   **Response (200)**: Single webhook object.
-   **DELETE** `/webhooks/{webhook}`
    -   **Description**: Delete a webhook by ID.
    -   **Response (200)**:
        ```json
        {
          "status": "success"
        }
        ```
## Inventory
Manage inventory items.
-   **GET** `/inventories`
    -   **Description**: Get a paginated list of inventories. Filterable by `ids`, `product_ids`, `variant_ids`, `location_ids`.
    -   **Response (200)**:
        ```json
        {
          "data": [
            {
              "id": 1,
              "store_id": 1,
              "location_id": 5,
              "product_id": 12,
              "variant_id": 34,
              "quantity": 150,
              "created_at": "2024-01-15T10:30:00.000000Z",
              "updated_at": "2024-01-15T14:45:30.000000Z"
            }
          ],
          "count": "1"
        }
        ```
-   **PUT** `/inventories/{inventory}`
    -   **Description**: Update inventory for a specific item.
    -   **Request Body**:
        ```json
        {
          "inventory_id": 1,
          "reason": "restock",
          "new_quantity": 100
        }
        ```
    -   **Response (200)**: Single inventory object.
## Location
Retrieve location information.
-   **GET** `/locations`
    -   **Description**: Get a list of locations for the authenticated store.
    -   **Response (200)**:
        ```json
        {
          "data": [
            {
              "id": 1,
              "name": "Main Warehouse",
              "address": "123 Commerce Street",
              "city": "Kuala Lumpur",
              "state": "Selangor",
              "country": "Malaysia",
              "zip": "50450",
              "phone": "+60123456789",
              "active": true,
              "is_default": true
            }
          ]
        }
        ```
## Order
Manage and retrieve orders.
-   **GET** `/orders`
    -   **Description**: Get a paginated list of orders.
    -   **Response (200)**:
        ```json
        {
          "data": [
            {
              "reference_number": "#1001",
              "status": "active",
              "payment_status": "paid",
              "fulfillment_status": "awaiting-processing",
              "customer": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@example.com"
              },
              "line_items": [
                {
                  "product_title": "Wireless Headphones",
                  "quantity": 2,
                  "price": "49.99"
                }
              ],
              "total_price": "99.98",
              "currency": "USD"
            }
          ]
        }
        ```
-   **GET** `/orders/{order}`
    -   **Description**: Get details for a single order by ID/reference.
    -   **Response (200)**: Full order resource object.
## Product
Manage products in the store.
-   **GET** `/products`
    -   **Description**: Get a paginated list of products.
    -   **Response (200)**:
        ```json
        {
          "data": [
            {
              "id": 1,
              "name": "Wireless Bluetooth Headphones",
              "slug": "wireless-bluetooth-headphones",
              "price": 89.99,
              "published": true,
              "variants": [],
              "images": ["https://example.com/image1.jpg"]
            }
          ]
        }
        ```
-   **POST** `/products`
    -   **Description**: Store a new product.
    -   **Request Body**:
        ```json
        {
          "name": "Product Name",
          "body": "Product Description",
          "requires_shipping": true,
          "manage_stock": true
        }
        ```
    -   **Response (200)**: Single product object.
-   **GET** `/products/{product}`
    -   **Description**: Get details for a single product by ID.
    -   **Response (200)**: Single product object.
-   **PUT** `/products/{product}`
    -   **Description**: Update a single product by ID.
    -   **Response (200)**: Single product object.
-   **DELETE** `/products/{product}`
    -   **Description**: Delete a single product by ID.
    -   **Response (200)**:
        ```json
        {
          "status": "success"
        }
        ```
## Store
Retrieve store configuration and details.
-   **GET** `/store`
    -   **Description**: Returns the authenticated user's store information.
    -   **Response (200)**:
        ```json
        {
          "id": 1,
          "name": "My Awesome Store",
          "email": "store@example.com",
          "domain": "mystore.com",
          "currency": {
            "code": "USD",
            "symbol": "$",
            "name": "US Dollar"
          },
          "timezone": "America/New_York",
          "plan": {
            "name": "Ultimate",
            "slug": "ultimate_monthly"
          }
        }
        ```
