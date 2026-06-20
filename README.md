# Mini Order Checkout (Web)

A clean, modern, and highly responsive single-flow checkout system for retail outlets. The application features a stunning glassmorphic dark-mode dashboard for product selection, a validated checkout flow, and an invoice-style confirmation receipt screen.

The frontend is a React Single Page Application (SPA), and the backend is a Node.js Express REST API server.

---

## 🏗️ Architecture & Mobile App Readiness

### Decoupled API Design
This application is strictly decoupled: **the frontend and backend are completely separate projects** communicating entirely over CORS-enabled REST APIs. 

If this prototype is converted to a mobile application (e.g., using **React Native**, **Flutter**, or **Swift/Kotlin**), **the backend requires zero changes**. 

1. **Reusable APIs**: The endpoints `/api/checkout` and `/api/pay` expect and return standard JSON. The mobile app can construct the exact same request bodies and make HTTP requests to these endpoints.
2. **Server-Side Pricing**: Prices and calculations are managed by the backend server. The client only sends the product IDs and quantities. This ensures high security and prevents client-side price tampering—a critical requirement for production retail systems.
3. **Decoupled States**: The backend is stateless for this demo (in-memory validation) and generates unique order IDs (`ORD-XXXXXX`), matching a standard transactional architecture.

---

## 🛠️ Tech Stack & Decisions

### Frontend: React (Vite) & Vanilla CSS
- **React**: Ideal for component-driven UI and real-time state management (such as cart updates, running totals, and screen switching).
- **Vite**: Ultra-fast next-generation build tool and dev server.
- **Vanilla CSS (Custom design)**: Avoided bloated frameworks to design custom glassmorphic cards, responsive sidebars, custom inputs, keyframe shake-animations, and glow borders. This gives us 100% control over the visual presentation.

### Backend: Node.js & Express
- **Express**: Lightweight, robust, and industry-standard routing framework for Node.js.
- **CORS**: Configured middleware to allow communication across port environments.
- **Validations**: Real-time regex verification for inputs (e.g., 10-digit mobile numbers) and sanitization of item quantities.

---

## 🚀 Setup and Run Instructions

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Option A: Run Concurrently (Recommended & Super Easy)
You can launch both the frontend and backend together with a single terminal command from the root directory:

1. **Navigate to the root directory**:
   ```bash
   cd mini-order-checkout
   ```
2. **Install all dependencies (Root, Backend, and Frontend)**:
   ```bash
   npm run install-all
   ```
3. **Start both servers concurrently**:
   ```bash
   npm start
   ```
This automatically spins up:
- The backend API server on **`http://localhost:5000`**
- The React Vite client on **`http://localhost:5173`**

---

### Option B: Run Individually (Using Two Terminal Windows)

#### 1. Run the Backend API Server
```bash
cd mini-order-checkout/backend
npm install
npm start
```
Runs on **`http://localhost:5000`**.

#### 2. Run the Frontend Development Server
Open a new terminal window:
```bash
cd mini-order-checkout/frontend
npm install
npm run dev
```
Runs on **`http://localhost:5173`**.

---

## 🔗 REST API Endpoint Reference

### 1. Create Checkout Order
Validates cart items, verifies server-side prices, and generates an order summary.

- **URL**: `/api/checkout`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "mobileNumber": "9876543210",
    "items": [
      { "id": 1, "quantity": 2 },
      { "id": 3, "quantity": 1 }
    ]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "orderId": "ORD-P8K9WS",
    "mobileNumber": "9876543210",
    "items": [
      {
        "id": 1,
        "name": "Organic Fresh Milk (1L)",
        "price": 60,
        "quantity": 2,
        "total": 120
      },
      {
        "id": 3,
        "name": "Salted Creamery Butter (100g)",
        "price": 55,
        "quantity": 1,
        "total": 55
      }
    ],
    "subtotal": 175,
    "tax": 8.75,
    "total": 183.75
  }
  ```

### 2. Process Order Payment
Simulates payment gateway transaction validation (with 1-second network latency).

- **URL**: `/api/pay`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "orderId": "ORD-P8K9WS"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Payment successful for order ORD-P8K9WS. Receipt sent via SMS."
  }
  ```

---

## 💎 Extra Features Added for Visual Polish
1. **SMS Notification Toast**: Implemented a slide-down banner that alerts the user when the mock SMS is dispatched immediately on successful checkout.
2. **Interactive Invoice Download**: Added a "Download Invoice Receipt" button on the confirmation screen that generates a dynamically formatted receipt `.txt` file locally on the user's system.
3. **One-Command Setup**: Configured the root `package.json` to allow running both servers concurrently to simplify developer review.
