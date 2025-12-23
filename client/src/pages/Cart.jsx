import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config.js';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, subtotal, shipping, total } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch current product stock
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(response.data);
      } catch (error) {
        console.error(`Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  const getProductStock = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.stockCount : 0;
  };

  const handleQuantityUpdate = (index, change, item) => {
    const currentStock = getProductStock(item.id);
    const newQuantity = item.quantity + change;
    
    if (change > 0 && newQuantity > currentStock) {
      alert(`Only ${currentStock} items available in stock`);
      return;
    }
    
    updateQuantity(index, change);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-section">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-section">
      <div className="container">
        <h1>Shopping Cart</h1>
        <div className="cart-layout">
          <div className="cart-items">
            <h2>Cart Items</h2>
            <div className="cart-items-container">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                    {products.length > 0 && (
                      <p className="cart-item-stock">
                        {getProductStock(item.id) > 0 
                          ? `${getProductStock(item.id)} available`
                          : 'Out of stock'}
                      </p>
                    )}
                  </div>
                  <div className="cart-item-quantity">
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityUpdate(index, -1, item)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityUpdate(index, 1, item)}
                      disabled={item.quantity >= getProductStock(item.id)}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-total">
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            {subtotal < 50 && (
              <p className="shipping-note">
                Add ${(50 - subtotal).toFixed(2)} more for free shipping!
              </p>
            )}
            <div className="summary-row total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-block">
              Proceed to Checkout
            </Link>
            <Link to="/products" className="btn btn-secondary btn-block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
