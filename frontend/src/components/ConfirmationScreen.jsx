import React from 'react';

export default function ConfirmationScreen({
  checkoutResult,
  onReset,
  maskMobile,
  formatCurrency,
  onDownloadReceipt
}) {
  return (
    <div className="confirm-container">
      <div className="glass-panel confirm-card">
        {/* Exit Close Button on Top Right */}
        <button className="btn-confirm-close" onClick={onReset} title="Back to Shop">×</button>
        
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
          <button className="btn-primary btn-primary-pulse" onClick={onReset}>
            <span>🛒</span> Done & Back to Shopping
          </button>
          
          <button className="btn-secondary" onClick={onDownloadReceipt}>
            <span>📥</span> Download Invoice Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
