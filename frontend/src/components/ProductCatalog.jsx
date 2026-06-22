import React from 'react';

export default function ProductCatalog({ products, cart, onUpdateQuantity, formatCurrency }) {
  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="products-section-title" style={{ margin: 0 }}>
          <span>🌾</span> Fresh Items Catalog
        </h2>
      </div>

      <div className="products-grid">
        {products.map((prod) => {
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
                  <button className="btn-add-to-cart" onClick={() => onUpdateQuantity(prod.id, 1)}>
                    Add to Cart
                  </button>
                ) : (
                  <div className="counter-container">
                    <button className="btn-counter" onClick={() => onUpdateQuantity(prod.id, -1)}>-</button>
                    <span className="counter-value">{qty}</span>
                    <button className="btn-counter" onClick={() => onUpdateQuantity(prod.id, 1)}>+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
