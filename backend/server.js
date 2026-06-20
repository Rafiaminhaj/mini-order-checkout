const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Hardcoded product database (Single Source of Truth)
const PRODUCTS = {
  1: { id: 1, name: 'Organic Fresh Milk (1L)', price: 60.00, category: 'Dairy' },
  2: { id: 2, name: 'Whole Wheat Bread (400g)', price: 45.00, category: 'Bakery' },
  3: { id: 3, name: 'Salted Creamery Butter (100g)', price: 55.00, category: 'Dairy' },
  4: { id: 4, name: 'Farm Fresh Eggs (Pack of 6)', price: 50.00, category: 'Dairy' },
  5: { id: 5, name: 'Cheddar Cheese Block (200g)', price: 120.00, category: 'Dairy' }
};

// Helper function to generate a unique Order ID
function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randStr = '';
  for (let i = 0; i < 6; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${randStr}`;
}

// Validation Helper
function validateMobileNumber(mobile) {
  const mobileRegex = /^[0-9]{10}$/;
  return typeof mobile === 'string' && mobileRegex.test(mobile);
}

// Serve a beautiful, interactive API Documentation home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mini Retail - REST API Documentation</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-gradient: radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 100%);
          --panel-bg: rgba(30, 41, 59, 0.45);
          --panel-border: rgba(255, 255, 255, 0.08);
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --accent-primary: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
          --accent-cyan: #06b6d4;
          --accent-green: #10b981;
          --code-bg: #0b0f19;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }
        body {
          background: var(--bg-gradient);
          color: var(--text-main);
          min-height: 100vh;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .container {
          max-width: 900px;
          width: 100%;
        }
        header {
          text-align: center;
          margin-bottom: 3rem;
          border-bottom: 1px solid var(--panel-border);
          padding-bottom: 2rem;
        }
        .logo {
          background: var(--accent-primary);
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        h1 {
          font-size: 2.25rem;
          font-weight: 800;
          background: linear-gradient(to right, #ffffff, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }
        .badge {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #818cf8;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .card {
          background: var(--panel-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--panel-border);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        h2 {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #fff;
        }
        .endpoint-block {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .method-badge {
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 800;
          margin-right: 0.5rem;
          display: inline-block;
        }
        .method-badge.post { background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); border: 1px solid rgba(6, 182, 212, 0.3); }
        .method-badge.get { background: rgba(16, 185, 129, 0.15); color: var(--accent-green); border: 1px solid rgba(16, 185, 129, 0.3); }
        .url { font-family: monospace; font-size: 1.1rem; color: #fff; font-weight: 600; }
        .desc { font-size: 0.95rem; color: var(--text-muted); margin: 0.75rem 0 1rem 0; line-height: 1.5; }
        pre {
          background: var(--code-bg);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #a7f3d0;
        }
        .architecture-note {
          line-height: 1.6;
          color: var(--text-muted);
          font-size: 1rem;
        }
        .architecture-note strong {
          color: #fff;
        }
        footer {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-top: 2rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="logo">🚀</div>
          <h1>Mini Retail REST API</h1>
          <span class="badge">Decoupled Architecture Demo</span>
        </header>

        <div class="card">
          <h2>📱 Mobile App Readiness Note</h2>
          <p class="architecture-note">
            This API is completely decoupled from the web frontend. It accepts and returns standard JSON payloads. 
            A mobile app built with <strong>React Native</strong>, <strong>Flutter</strong>, or native platforms can hit these exact endpoints, send identical request parameters, and render checkout flows immediately. 
            All calculation logic and validation constraints reside securely on this backend server.
          </p>
        </div>

        <div class="card">
          <h2>🔗 API Endpoints</h2>

          <!-- Endpoint 1 -->
          <div class="endpoint-block">
            <div>
              <span class="method-badge post">POST</span>
              <span class="url">/api/checkout</span>
            </div>
            <p class="desc">Accepts cart items and mobile number, runs server-side price lookup, calculates 5% GST tax, and returns a verified total amount alongside a generated Order ID.</p>
            <p style="font-weight: 600; font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--text-muted);">Request Payload:</p>
            <pre>{
  "mobileNumber": "9876543210",
  "items": [
    { "id": 1, "quantity": 2 },
    { "id": 3, "quantity": 1 }
  ]
}</pre>
          </div>

          <!-- Endpoint 2 -->
          <div class="endpoint-block">
            <div>
              <span class="method-badge post">POST</span>
              <span class="url">/api/pay</span>
            </div>
            <p class="desc">Accepts the generated Order ID, simulates gateway processing delay (1s), and returns a successful payment transaction status.</p>
            <p style="font-weight: 600; font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--text-muted);">Request Payload:</p>
            <pre>{
  "orderId": "ORD-X8K9PS"
}</pre>
          </div>

          <!-- Endpoint 3 -->
          <div class="endpoint-block">
            <div>
              <span class="method-badge get">GET</span>
              <span class="url">/health</span>
            </div>
            <p class="desc">Returns backend server uptime status and timestamp.</p>
          </div>
        </div>

        <footer>
          <p>© 2026 Mini Retail Outlets Inc. Powered by Express REST APIs.</p>
        </footer>
      </div>
    </body>
    </html>
  `);
});

/**
 * @route POST /api/checkout
 * @desc Accept items + mobile, calculate totals, return Order ID and breakdown
 */
app.post('/api/checkout', (req, res) => {
  const { items, mobileNumber } = req.body;

  // 1. Validate mobile number
  if (!mobileNumber || !validateMobileNumber(mobileNumber)) {
    return res.status(400).json({
      error: 'Invalid mobile number. Must be exactly 10 digits.'
    });
  }

  // 2. Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Cart is empty. Please select at least one item.'
    });
  }

  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const { id, quantity } = item;
    
    // Ensure quantity is valid
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        error: `Invalid quantity for item ID ${id}. Must be a positive number.`
      });
    }

    const product = PRODUCTS[id];
    if (!product) {
      return res.status(404).json({
        error: `Product with ID ${id} not found.`
      });
    }

    const itemTotal = product.price * qty;
    subtotal += itemTotal;

    processedItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      total: itemTotal
    });
  }

  // Calculate taxes (e.g., 5% GST for premium retail look)
  const gstRate = 0.05; 
  const gstAmount = parseFloat((subtotal * gstRate).toFixed(2));
  const finalTotal = parseFloat((subtotal + gstAmount).toFixed(2));

  const orderId = generateOrderId();

  res.status(200).json({
    orderId,
    mobileNumber,
    items: processedItems,
    subtotal,
    tax: gstAmount,
    total: finalTotal
  });
});

/**
 * @route POST /api/pay
 * @desc Simulates processing a payment with a 1-second delay
 */
app.post('/api/pay', (req, res) => {
  const { orderId } = req.body;

  if (!orderId || typeof orderId !== 'string' || !orderId.startsWith('ORD-')) {
    return res.status(400).json({
      error: 'Invalid Order ID format. Must begin with ORD-.'
    });
  }

  // Simulate network/processing latency (1 second)
  setTimeout(() => {
    res.status(200).json({
      status: 'success',
      message: `Payment successful for order ${orderId}. Receipt sent via SMS.`
    });
  }, 1000);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 Retail Checkout Server is running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`=============================================`);
});
