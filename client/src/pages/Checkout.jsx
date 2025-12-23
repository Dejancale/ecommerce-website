import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import axios from 'axios';
import API_BASE_URL from '../config.js';
import { showToast } from '../components/Toast';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, shipping, total, clearCart } = useCart();
  const { user, isAuthenticated, token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    notes: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData({
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        notes: '',
        paymentMethod: 'cash',
      });
    }
  }, [isAuthenticated, user]);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate stock availability before submitting
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}/api/products');
      const products = productsResponse.data;
      
      const stockErrors = [];
      cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
          if (item.quantity > product.stockCount) {
            stockErrors.push(`${item.name}: Only ${product.stockCount} available (you have ${item.quantity} in cart)`);
          }
          if (product.stockCount === 0) {
            stockErrors.push(`${item.name} is out of stock`);
          }
        }
      });

      if (stockErrors.length > 0) {
        showToast(stockErrors.join(', '), 'error');
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error('Error checking stock:', error);
      showToast('Failed to validate stock. Please try again.', 'error');
      setIsSubmitting(false);
      return;
    }

    const orderData = {
      customer_name: formData.fullName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      customer_address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
      payment_method: formData.paymentMethod,
      items: cart.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      let response;
      
      // If user is logged in, use authenticated endpoint
      if (isAuthenticated && token) {
        response = await axios.post(`${API_BASE_URL}/api/orders', orderData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Guest checkout
        response = await createOrder(orderData);
      }
      
      if (response.data.success) {
        // Store order data in localStorage temporarily
        const orderConfirmationData = {
          orderId: response.data.order_id,
          total: response.data.total,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
          paymentMethod: formData.paymentMethod,
          items: orderData.items
        };
        localStorage.setItem('lastOrder', JSON.stringify(orderConfirmationData));
        // Navigate FIRST, then clear cart after navigation starts
        navigate('/order-confirmation');
        // Clear cart after a brief delay to ensure navigation completes
        setTimeout(() => {
          clearCart();
        }, 100);
      } else {
        showToast(response.data.error || 'Failed to place order', 'error');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to place order. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-section">
      <div className="container">
        <h1>Checkout</h1>
        <div className="checkout-layout">
          <div className="checkout-form-container">
            <h2>Billing Information</h2>
            <form onSubmit={handleSubmit} id="checkoutForm">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <h3>Shipping Address</h3>

              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Order Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="4"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions for your order?"
                ></textarea>
              </div>

              <h3>Payment Method</h3>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                  />
                  <div className="payment-option-content">
                    <strong>💵 Cash on Delivery</strong>
                    <p>Pay when you receive your order</p>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    disabled
                  />
                  <div className="payment-option-content">
                    <strong>💳 Credit/Debit Card</strong>
                    <p>Coming Soon</p>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={handleChange}
                    disabled
                  />
                  <div className="payment-option-content">
                    <strong>PayPal</strong>
                    <p>Coming Soon</p>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="checkout-items">
              {cart.map((item, index) => (
                <div key={index} className="checkout-item">
                  <img src={item.image} alt={item.name} />
                  <div className="checkout-item-details">
                    <h4>{item.name}</h4>
                    <p>
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="checkout-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
