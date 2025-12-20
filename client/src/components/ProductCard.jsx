import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { showToast } from './Toast';
import ProductModal from './ProductModal';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.inStock) {
      addToCart(product);
      showToast(`${product.name} added to cart!`, 'success');
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      <div className="product-card" onClick={handleQuickView}>
        <div className="product-image">
          {product.badge && (
            <span className={`badge ${product.badge.toLowerCase()}`}>
              {product.badge}
            </span>
          )}
          {product.inStock ? (
            <span className="stock-badge in-stock">In Stock</span>
          ) : (
            <span className="stock-badge out-stock">Out of Stock</span>
          )}
          <img src={product.image} alt={product.name} />
          <div className="product-overlay">
            <button className="btn-quick-view" onClick={handleQuickView}>
              👁 Quick View
            </button>
          </div>
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <div className="rating">
            {'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)} ({product.reviews})
          </div>
          <p className="price">
            {product.oldPrice && (
              <span className="old-price">${product.oldPrice.toFixed(2)}</span>
            )}
            ${product.price.toFixed(2)}
          </p>
          <button 
            className="btn btn-add-cart" 
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? '🛒 Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
      
      {showModal && (
        <ProductModal 
          product={product} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
};

export default ProductCard;
