import React from 'react';

export default function CartSidebar({ 
  products, 
  cart, 
  onUpdateQuantity, 
  getCartItemCount, 
  getRunningSubtotal, 
  onProceed, 
  formatCurrency 
}) {
  const subtotal = getRunningSubtotal();
  const itemCount = getCartItemCount();

  return (
    <div className="glass-panel cart-panel">
      <div className="cart-header">
        <h2><span>🛍️</span> Your Cart</h2>
        {itemCount > 0 && (
          <span className="cart-items-count">{itemCount} items</span>
        )}
      </div>

      <div className="cart-items-list">
        {itemCount === 0 ? (
          <div className="empty-cart-state">
            <div className="empty-cart-icon">🛒</div>
            <p>Your cart is empty</p>
            <p style={{ fontSize: '0.85rem' }}>Select items from the catalog</p>
          </div>
        ) : (
          products.filter(p => cart[p.id] > 0).map((prod) => {
            const qty = cart[prod.id];
            return (
              <div key={prod.id} className="cart-item-row">
                <img src={prod.image} alt={prod.name} className="cart-item-img-thumb" />
                
                <div className="cart-item-details">
                  <div className="cart-item-name">{prod.name}</div>
                  <div className="cart-item-controls-row">
                    <div className="cart-mini-controls">
                      <button className="btn-mini-counter" onClick={() => onUpdateQuantity(prod.id, -1)}>-</button>
                      <span className="cart-mini-qty">{qty}</span>
                      <button className="btn-mini-counter" onClick={() => onUpdateQuantity(prod.id, 1)}>+</button>
                    </div>
                    <div className="cart-item-pricing-label">
                      {formatCurrency(prod.price)} each
                    </div>
                  </div>
                </div>
                
                <div className="cart-item-right-col">
                  <button className="btn-cart-delete" onClick={() => onUpdateQuantity(prod.id, -qty)} title="Remove item">
                    ×
                  </button>
                  <div className="cart-item-total">{formatCurrency(prod.price * qty)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {itemCount > 0 && (
        <>
          {/* Free Organic Gift Box Tracker */}
          <div className="gift-tracker">
            <div className="tracker-header">
              {subtotal >= 400 ? (
                <span className="tracker-unlocked">🎉 You've unlocked a <strong>Free Organic Gift Box!</strong> 🎁</span>
              ) : (
                <span>🎁 Add <strong>{formatCurrency(400 - subtotal)}</strong> more for a Free Gift!</span>
              )}
            </div>
            <div className="tracker-bar-bg">
              <div 
                className={`tracker-bar-fill ${subtotal >= 400 ? 'unlocked' : ''}`}
                style={{ width: `${Math.min((subtotal / 400) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="cart-summary-block">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Est. GST (5%)</span>
              <span>{formatCurrency(subtotal * 0.05)}</span>
            </div>
            {subtotal >= 400 && (
              <div className="summary-row gift-reward-row">
                <span>Eco-Gift Box Reward</span>
                <span className="free-badge">FREE</span>
              </div>
            )}
            <div className="summary-row total-row">
              <span>Total</span>
              <span>{formatCurrency(subtotal * 1.05)}</span>
            </div>
            <button className="btn-primary btn-checkout-glow" onClick={onProceed}>
              Proceed to Checkout <span>➡️</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
