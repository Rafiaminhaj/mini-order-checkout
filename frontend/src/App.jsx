import { useState, useEffect } from 'react';
import { checkout, pay } from './api';
import GlowBackground from './components/GlowBackground';
import ProductCatalog from './components/ProductCatalog';
import CartSidebar from './components/CartSidebar';
import CheckoutForm from './components/CheckoutForm';
import ConfirmationScreen from './components/ConfirmationScreen';

// Hardcoded product catalog (matched with Backend server)
const PRODUCTS = [
  { 
    id: 1, 
    name: 'Organic Fresh Milk (1L)', 
    price: 60.00, 
    category: 'Dairy', 
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80', 
    desc: 'Freshly sourced organic cow milk',
    badge: 'Fresh',
    badgeColor: 'green'
  },
  { 
    id: 2, 
    name: 'Whole Wheat Bread (400g)', 
    price: 45.00, 
    category: 'Bakery', 
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', 
    desc: 'High-fiber freshly baked wheat loaf',
    badge: 'Organic',
    badgeColor: 'green'
  },
  { 
    id: 3, 
    name: 'Salted Creamery Butter (100g)', 
    price: 55.00, 
    category: 'Dairy', 
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80', 
    desc: 'Rich, smooth traditional butter',
    badge: 'Popular'
  },
  { 
    id: 4, 
    name: 'Farm Fresh Eggs (Pack of 6)', 
    price: 50.00, 
    category: 'Dairy', 
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=400&q=80', 
    desc: 'Nutritious farm-sourced eggs',
    badge: 'New',
    badgeColor: 'yellow'
  },
  { 
    id: 5, 
    name: 'Cheddar Cheese Block (200g)', 
    price: 120.00, 
    category: 'Dairy', 
    image: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=400&q=80', 
    desc: 'Aged premium cheddar cheese block',
    badge: 'Aged'
  }
];

function App() {
  const [screen, setScreen] = useState('order');
  const [cart, setCart] = useState({});
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Cart operations
  const updateQuantity = (productId, amount) => {
    setCart((prevCart) => {
      const currentQty = prevCart[productId] || 0;
      const newQty = currentQty + amount;
      
      const newCart = { ...prevCart };
      if (newQty <= 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = newQty;
      }
      return newCart;
    });
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getRunningSubtotal = () => {
    return PRODUCTS.reduce((sum, product) => {
      const qty = cart[product.id] || 0;
      return sum + (product.price * qty);
    }, 0);
  };

  // Mobile verification handlers
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobileNumber(value);
      if (value.length === 0) {
        setMobileError('');
      } else if (value.length < 10) {
        setMobileError('Mobile number must be exactly 10 digits.');
      } else {
        setMobileError('');
      }
    }
  };

  // Submit flow
  const processCheckoutAndPayment = async (e) => {
    e.preventDefault();
    if (mobileNumber.length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setApiError(null);

    try {
      const cartItemsPayload = Object.entries(cart).map(([id, qty]) => ({
        id: parseInt(id, 10),
        quantity: qty
      }));

      const checkoutResponse = await checkout(cartItemsPayload, mobileNumber);
      await pay(checkoutResponse.orderId);
      setCheckoutResult(checkoutResponse);
      setScreen('confirmation');
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetOrder = () => {
    setCart({});
    setMobileNumber('');
    setMobileError('');
    setCheckoutResult(null);
    setApiError(null);
    setScreen('order');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  const maskMobile = (mobile) => {
    if (!mobile) return '';
    return `${mobile.substring(0, 2)}XXXXXX${mobile.substring(8)}`;
  };

  const downloadTextReceipt = () => {
    if (!checkoutResult) return;
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let receiptText = `=====================================\n`;
    receiptText += `          MINI RETAIL OUTLET         \n`;
    receiptText += `            RECEIPT INVOICE          \n`;
    receiptText += `=====================================\n`;
    receiptText += `Order ID:   ${checkoutResult.orderId}\n`;
    receiptText += `Date:       ${dateStr}\n`;
    receiptText += `Customer:   +91 ${checkoutResult.mobileNumber}\n`;
    receiptText += `-------------------------------------\n`;
    
    checkoutResult.items.forEach(item => {
      const itemString = `${item.name} (x${item.quantity})`;
      receiptText += `${itemString.padEnd(26)} : ${formatCurrency(item.total)}\n`;
    });
    
    receiptText += `-------------------------------------\n`;
    receiptText += `Subtotal   : ${formatCurrency(checkoutResult.subtotal)}\n`;
    receiptText += `GST (5%)   : ${formatCurrency(checkoutResult.tax)}\n`;
    receiptText += `Total Paid : ${formatCurrency(checkoutResult.total)}\n`;
    receiptText += `=====================================\n`;
    receiptText += `  Thank you for shopping with us!   \n`;
    receiptText += `=====================================\n`;

    const element = document.createElement("a");
    const file = new Blob([receiptText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Receipt_${checkoutResult.orderId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="app-container">
      {/* Decorative Glow spotlights & custom snapping cursor follower */}
      <GlowBackground />

      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">🛒</div>
          <div>
            <h1 className="logo-text">Mini Retail</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Superfast Checkout</p>
          </div>
        </div>
      </header>

      {/* Screens Router */}
      {screen === 'order' && (
        <div className="dashboard-grid">
          <ProductCatalog 
            products={PRODUCTS}
            cart={cart}
            onUpdateQuantity={updateQuantity}
            formatCurrency={formatCurrency}
          />
          <CartSidebar 
            products={PRODUCTS}
            cart={cart}
            onUpdateQuantity={updateQuantity}
            getCartItemCount={getCartItemCount}
            getRunningSubtotal={getRunningSubtotal}
            onProceed={() => setScreen('checkout')}
            formatCurrency={formatCurrency}
          />
        </div>
      )}

      {screen === 'checkout' && (
        <CheckoutForm 
          cart={cart}
          products={PRODUCTS}
          mobileNumber={mobileNumber}
          mobileError={mobileError}
          apiError={apiError}
          loading={loading}
          onMobileChange={handleMobileChange}
          onSubmit={processCheckoutAndPayment}
          onBack={() => setScreen('order')}
          getRunningSubtotal={getRunningSubtotal}
          formatCurrency={formatCurrency}
        />
      )}

      {screen === 'confirmation' && checkoutResult && (
        <ConfirmationScreen 
          checkoutResult={checkoutResult}
          onReset={resetOrder}
          maskMobile={maskMobile}
          formatCurrency={formatCurrency}
          onDownloadReceipt={downloadTextReceipt}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 Mini Retail Outlets Inc. All rights reserved.</p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', opacity: 0.7 }}>
          Decoupled API Architecture Demo. Frontend: React | Backend: Node.js Express.
        </p>
      </footer>
    </div>
  );
}

export default App;
