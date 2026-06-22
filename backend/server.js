const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Load modular API routes
app.use('/api', apiRoutes);

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
              <span class="url">/api/health</span>
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

// Start the server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 Retail Checkout Server is running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`=============================================`);
});
