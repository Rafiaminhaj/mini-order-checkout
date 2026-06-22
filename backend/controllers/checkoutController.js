const PRODUCTS = require('../config/products');

// Validation Helper
function validateMobileNumber(mobile) {
  const mobileRegex = /^[0-9]{10}$/;
  return typeof mobile === 'string' && mobileRegex.test(mobile);
}

// Unique Order ID Generator
function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randStr = '';
  for (let i = 0; i < 6; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${randStr}`;
}

/**
 * @desc Accept items + mobile, calculate totals, return Order ID and breakdown
 */
exports.checkout = (req, res) => {
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

  // Calculate taxes (5% GST for premium retail look)
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
};

/**
 * @desc Simulates processing a payment with a 1-second delay
 */
exports.pay = (req, res) => {
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
};

// Health Check Controller
exports.health = (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
};
