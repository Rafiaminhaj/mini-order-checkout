import React from 'react';

export default function CheckoutForm({
  cart,
  products,
  mobileNumber,
  mobileError,
  apiError,
  loading,
  onMobileChange,
  onSubmit,
  onBack,
  getRunningSubtotal,
  formatCurrency
}) {
  const subtotal = getRunningSubtotal();
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="btn-back" onClick={onBack}>⬅</button>
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
          {products.filter(p => cart[p.id] > 0).map((prod) => {
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
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="order-summary-item" style={{ fontSize: '0.85rem' }}>
            <span>Taxes (GST 5%)</span>
            <span>{formatCurrency(gst)}</span>
          </div>
          <div className="order-summary-item" style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginTop: '0.75rem', fontWeight: 800, fontSize: '1.2rem', color: '#38bdf8' }}>
            <span>Total Amount</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Customer Mobile Number</label>
            <div className="input-wrapper">
              <span className="input-icon">📱</span>
              <input
                type="tel"
                placeholder="Enter 10-digit number"
                className={`form-input ${mobileError ? 'invalid' : mobileNumber.length === 10 ? 'valid' : ''}`}
                value={mobileNumber}
                onChange={onMobileChange}
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
                <span>{formatCurrency(total)}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
