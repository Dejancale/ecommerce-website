import { useState } from 'react';
import './ProductModal.css';
import { useCart } from '../context/CartContext';
import { showToast } from './Toast';

const ProductModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    showToast(`Added ${quantity} ${product.name} to cart!`, 'success');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-grid">
          <div className="modal-image">
            <img src={product.image} alt={product.name} />
            {product.badge && (
              <span className={`modal-badge ${product.badge.toLowerCase()}`}>
                {product.badge}
              </span>
            )}
          </div>
          
          <div className="modal-details">
            <h2>{product.name}</h2>
            
            <div className="modal-rating">
              {'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}
              <span className="modal-reviews">({product.reviews} reviews)</span>
            </div>
            
            <div className="modal-price">
              {product.oldPrice && (
                <span className="modal-old-price">${product.oldPrice.toFixed(2)}</span>
              )}
              <span className="modal-current-price">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="modal-discount">
                  Save {Math.round((1 - product.price / product.oldPrice) * 100)}%
                </span>
              )}
            </div>
            
            <div className="modal-stock">
              {product.inStock ? (
                <span className="in-stock">✓ In Stock ({product.stockCount || 'Available'})</span>
              ) : (
                <span className="out-stock">✕ Out of Stock</span>
              )}
            </div>
            
            <div className="modal-description">
              <h3>Description</h3>
              <p>{product.description || 'High quality product with excellent features and great value for money.'}</p>
            </div>
            
            <div className="modal-category">
              <span className="category-badge">{product.category}</span>
            </div>
            
            {product.inStock && (
              <div className="modal-quantity">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))}>+</button>
                </div>
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                className="btn-add-large"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? '🛒 Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
