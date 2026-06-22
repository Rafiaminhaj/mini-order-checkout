import { useEffect, useState } from 'react';

export default function GlowBackground() {
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
          padding = 8;
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

  return (
    <>
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
    </>
  );
}
