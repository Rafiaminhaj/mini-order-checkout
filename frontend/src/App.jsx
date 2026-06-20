import { useState, useEffect } from 'react';
import { checkout, pay } from './api';

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
  const [hoveredRect, setHoveredRect] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.classList.add('cursor-active');
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    const handleMouseLeave = () => {
      document.documentElement.classList.remove('cursor-active');
      document.documentElement.style.setProperty('--mouse-x', `-1000px`);
      document.documentElement.style.setProperty('--mouse-y', `-1000px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      
      const interactiveEl = target.closest('a, button, input, select, textarea, [role="button"], .product-card, .btn-counter, .category-tab, .btn-secondary, .btn-primary, .btn-back, .btn-add-to-cart, .stat-card, .cart-item-row');
      
      if (interactiveEl) {
        const rect = interactiveEl.getBoundingClientRect();
        const style = window.getComputedStyle(interactiveEl);
        
        let type = 'pointer';
        let padding = 5; // default padding around buttons for floating look
        
        if (interactiveEl.tagName === 'INPUT' || interactiveEl.tagName === 'TEXTAREA') {
          type = 'text';
          padding = 3;
        } else if (interactiveEl.classList.contains('product-card')) {
          type = 'card';
          padding = 8; // larger frame for product cards
        } else if (interactiveEl.classList.contains('stat-card') || interactiveEl.classList.contains('cart-item-row')) {
          type = 'card';
          padding = 6;
        } else if (interactiveEl.classList.contains('btn-mini-counter') || interactiveEl.classList.contains('btn-counter')) {
          padding = 3;
        }

        // Parallel curvature calculation (outer radius = inner radius + padding offset)
        let outerRadius = '12px';
        if (style.borderRadius && (style.borderRadius.includes('%') || style.borderRadius === '50%')) {
          outerRadius = '50%';
        } else {
          const rawRadius = parseInt(style.borderRadius, 10) || 0;
          outerRadius = rawRadius > 0 ? `${rawRadius + padding}px` : '12px';
        }

        setHoveredRect({
          left: rect.left - padding,
          top: rect.top - padding,
          width: rect.width + (padding * 2),
          height: rect.height + (padding * 2),
          borderRadius: outerRadius,
          type: type
        });
      } else {
        setHoveredRect(null);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);


  // Screen state: 'order' | 'checkout' | 'confirmation'
  const [screen, setScreen] = useState('order');
  
  // Cart state: mapping product ID to quantity
  const [cart, setCart] = useState({});
  
  // Checkout & customer details
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [checkoutResult, setCheckoutResult] = useState(null);
  
  // No UI filter states needed for 5 static items
  
  // UI states
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

  // Step 1: Proceed from Cart to Checkout Page
  const proceedToCheckout = () => {
    if (getCartItemCount() === 0) return;
    setApiError(null);
    setScreen('checkout');
  };

  // Real-time mobile validation
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // keep numbers only
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

  // Step 2: Handle Checkout + Pay (Combines both backend APIs)
  const processCheckoutAndPayment = async (e) => {
    e.preventDefault();
    
    // Validate mobile number
    if (mobileNumber.length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    setLoading(true);
    setApiError(null);

    try {
      // Create request payload from cart state
      const cartItemsPayload = Object.entries(cart).map(([id, qty]) => ({
        id: parseInt(id, 10),
        quantity: qty
      }));

      // 1. Call Backend Checkout API to validate & calculate totals
      const checkoutResponse = await checkout(cartItemsPayload, mobileNumber);
      
      // 2. Call Backend Payment API to process simulated payment
      await pay(checkoutResponse.orderId);
      
      // Success! Update checkout result and navigate
      setCheckoutResult(checkoutResponse);
      setScreen('confirmation');
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset the entire flow to start a new order
  const resetOrder = () => {
    setCart({});
    setMobileNumber('');
    setMobileError('');
    setCheckoutResult(null);
    setApiError(null);
    setScreen('order');
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  // Mask mobile number for confirmation display
  const maskMobile = (mobile) => {
    if (!mobile) return '';
    return `${mobile.substring(0, 2)}XXXXXX${mobile.substring(8)}`;
  };

  // Extra Skill Feature: Generate and download text receipt file
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

  // No filtering logic needed for 5 static items

  return (
    <div className="app-container">
      {/* Custom Snapping Follower Ring */}
      <div 
        className={`custom-cursor-ring ${hoveredRect ? `cursor-magnetic-hover hover-type-${hoveredRect.type}` : ''}`}
        style={hoveredRect ? {
          left: `${hoveredRect.left}px`,
          top: `${hoveredRect.top}px`,
          width: `${hoveredRect.width}px`,
          height: `${hoveredRect.height}px`,
          borderRadius: hoveredRect.borderRadius,
          transform: 'translate(0, 0)'
        } : {}}
      ></div>

      {/* Interactive Mouse Glow Spotlight */}
      <div className="mouse-glow"></div>
      {/* Background Floating Glass Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

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

      {/* Screen 1: Order Page */}
      {screen === 'order' && (
        <div className="dashboard-grid">
          {/* Products Column */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="products-section-title" style={{ margin: 0 }}>
                <span>🌾</span> Fresh Items Catalog
              </h2>
            </div>

            <div className="products-grid">
              {PRODUCTS.map((prod) => {
                const qty = cart[prod.id] || 0;
                return (
                  <div key={prod.id} className="product-card">
                    <div>
                      <div className="product-img-container">
                        <img src={prod.image} alt={prod.name} className="product-img" />
                        <span className="product-category-tag">{prod.category}</span>
                        {prod.badge && (
                          <span className={`product-promo-badge ${prod.badgeColor || ''}`}>{prod.badge}</span>
                        )}
                      </div>
                      <h3 style={{ marginTop: '0.85rem' }}>{prod.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', minHeight: '34px' }}>
                        {prod.desc}
                      </p>
                    </div>
                    <div className="card-actions">
                      <div className="product-price">{formatCurrency(prod.price)}</div>
                      {qty === 0 ? (
                        <button className="btn-add-to-cart" onClick={() => updateQuantity(prod.id, 1)}>
                          Add to Cart
                        </button>
                      ) : (
                        <div className="counter-container">
                          <button className="btn-counter" onClick={() => updateQuantity(prod.id, -1)}>-</button>
                          <span className="counter-value">{qty}</span>
                          <button className="btn-counter" onClick={() => updateQuantity(prod.id, 1)}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Sidebar Column */}
          <div className="glass-panel cart-panel">
            <div className="cart-header">
              <h2><span>🛍️</span> Your Cart</h2>
              {getCartItemCount() > 0 && (
                <span className="cart-items-count">{getCartItemCount()} items</span>
              )}
            </div>

            <div className="cart-items-list">
              {getCartItemCount() === 0 ? (
                <div className="empty-cart-state">
                  <div className="empty-cart-icon">🛒</div>
                  <p>Your cart is empty</p>
                  <p style={{ fontSize: '0.85rem' }}>Select items from the catalog</p>
                </div>
              ) : (
                PRODUCTS.filter(p => cart[p.id] > 0).map((prod) => {
                  const qty = cart[prod.id];
                  return (
                    <div key={prod.id} className="cart-item-row">
                      <img src={prod.image} alt={prod.name} className="cart-item-img-thumb" />
                      
                      <div className="cart-item-details">
                        <div className="cart-item-name">{prod.name}</div>
                        <div className="cart-item-controls-row">
                          <div className="cart-mini-controls">
                            <button className="btn-mini-counter" onClick={() => updateQuantity(prod.id, -1)}>-</button>
                            <span className="cart-mini-qty">{qty}</span>
                            <button className="btn-mini-counter" onClick={() => updateQuantity(prod.id, 1)}>+</button>
                          </div>
                          <div className="cart-item-pricing-label">
                            {formatCurrency(prod.price)} each
                          </div>
                        </div>
                      </div>
                      
                      <div className="cart-item-right-col">
                        <button className="btn-cart-delete" onClick={() => updateQuantity(prod.id, -qty)} title="Remove item">
                          ×
                        </button>
                        <div className="cart-item-total">{formatCurrency(prod.price * qty)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {getCartItemCount() > 0 && (
              <>
                {/* Free Organic Gift Box Tracker */}
                <div className="gift-tracker">
                  <div className="tracker-header">
                    {getRunningSubtotal() >= 400 ? (
                      <span className="tracker-unlocked">🎉 You've unlocked a <strong>Free Organic Gift Box!</strong> 🎁</span>
                    ) : (
                      <span>🎁 Add <strong>{formatCurrency(400 - getRunningSubtotal())}</strong> more for a Free Gift!</span>
                    )}
                  </div>
                  <div className="tracker-bar-bg">
                    <div 
                      className={`tracker-bar-fill ${getRunningSubtotal() >= 400 ? 'unlocked' : ''}`}
                      style={{ width: `${Math.min((getRunningSubtotal() / 400) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="cart-summary-block">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(getRunningSubtotal())}</span>
                  </div>
                  <div className="summary-row">
                    <span>Est. GST (5%)</span>
                    <span>{formatCurrency(getRunningSubtotal() * 0.05)}</span>
                  </div>
                  {getRunningSubtotal() >= 400 && (
                    <div className="summary-row gift-reward-row">
                      <span>Eco-Gift Box Reward</span>
                      <span className="free-badge">FREE</span>
                    </div>
                  )}
                  <div className="summary-row total-row">
                    <span>Total</span>
                    <span>{formatCurrency(getRunningSubtotal() * 1.05)}</span>
                  </div>
                  <button className="btn-primary btn-checkout-glow" onClick={proceedToCheckout}>
                    Proceed to Checkout <span>➡️</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Screen 2: Checkout Page */}
      {screen === 'checkout' && (
        <div className="checkout-container">
          <div className="checkout-header">
            <button className="btn-back" onClick={() => setScreen('order')}>⬅</button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Confirm & Pay</h2>
          </div>

          <div className="glass-panel checkout-card">
            {apiError && (
              <div className="alert-box">
                <span>⚠️</span> {apiError}
              </div>
            )}

            <div className="order-summary-box">
              <h3 className="order-summary-title">Order Breakdown</h3>
              {PRODUCTS.filter(p => cart[p.id] > 0).map((prod) => {
                const qty = cart[prod.id];
                return (
                  <div key={prod.id} className="order-summary-item">
                    <span>{prod.name} (x{qty})</span>
                    <span>{formatCurrency(prod.price * qty)}</span>
                  </div>
                );
              })}
              <div className="order-summary-item" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(getRunningSubtotal())}</span>
              </div>
              <div className="order-summary-item" style={{ fontSize: '0.85rem' }}>
                <span>Taxes (GST 5%)</span>
                <span>{formatCurrency(getRunningSubtotal() * 0.05)}</span>
              </div>
              <div className="order-summary-item" style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginTop: '0.75rem', fontWeight: 800, fontSize: '1.2rem', color: '#38bdf8' }}>
                <span>Total Amount</span>
                <span>{formatCurrency(getRunningSubtotal() * 1.05)}</span>
              </div>
            </div>

            <form onSubmit={processCheckoutAndPayment}>
              <div className="form-group">
                <label className="form-label">Customer Mobile Number</label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    className={`form-input ${mobileError ? 'invalid' : mobileNumber.length === 10 ? 'valid' : ''}`}
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    disabled={loading}
                    required
                  />
                </div>
                
                {mobileError ? (
                  <div className="validation-hint error-text">
                    <span>❌ {mobileError}</span>
                    <span>{mobileNumber.length}/10</span>
                  </div>
                ) : mobileNumber.length === 10 ? (
                  <div className="validation-hint success-text">
                    <span>✓ Ready to process payment</span>
                    <span>10/10</span>
                  </div>
                ) : (
                  <div className="validation-hint">
                    <span>Enter exactly 10 digits</span>
                    <span>{mobileNumber.length}/10</span>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || mobileNumber.length !== 10}
                style={{ padding: '1.1rem', fontSize: '1.1rem' }}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>🔒 Pay Now</span>
                    <span>{formatCurrency(getRunningSubtotal() * 1.05)}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Screen 3: Confirmation Page */}
      {screen === 'confirmation' && checkoutResult && (
        <div className="confirm-container">
          <div className="glass-panel confirm-card">
            {/* Exit Close Button on Top Right */}
            <button className="btn-confirm-close" onClick={resetOrder} title="Back to Shop">×</button>
            
            <div className="success-badge">✓</div>
            <h1>Payment Successful!</h1>
            <p className="confirm-subtitle">Your order has been placed successfully.</p>

            <div className="receipt-box scrollable-receipt">
              <div className="receipt-header">
                <div>
                  <div className="receipt-id">{checkoutResult.orderId}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Receipt Invoice</div>
                </div>
                <div className="receipt-date">
                  {new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="receipt-items-container">
                {checkoutResult.items.map((item) => (
                  <div key={item.id} className="receipt-item-row">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="receipt-calculations">
                <div className="receipt-item-row" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(checkoutResult.subtotal)}</span>
                </div>
                <div className="receipt-item-row" style={{ fontSize: '0.85rem' }}>
                  <span>GST (5%)</span>
                  <span>{formatCurrency(checkoutResult.tax)}</span>
                </div>

                <div className="receipt-total-row">
                  <span>Paid Amount</span>
                  <span>{formatCurrency(checkoutResult.total)}</span>
                </div>
              </div>
            </div>

            <div className="sms-banner">
              <span>💬</span> Receipt details sent via SMS to {maskMobile(checkoutResult.mobileNumber)}
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-primary btn-primary-pulse" onClick={resetOrder}>
                <span>🛒</span> Done & Back to Shopping
              </button>
              
              <button className="btn-secondary" onClick={downloadTextReceipt}>
                <span>📥</span> Download Invoice Receipt
              </button>
            </div>
          </div>
        </div>
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
