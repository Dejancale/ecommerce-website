import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const hasLoadedData = useRef(false);

  useEffect(() => {
    // Prevent double-loading in React Strict Mode
    if (hasLoadedData.current) {
      return;
    }

    // Get order data from localStorage
    const storedData = localStorage.getItem('lastOrder');
    
    if (storedData) {
      const data = JSON.parse(storedData);
      setOrderData(data);
      hasLoadedData.current = true;
      // Clear it after reading
      localStorage.removeItem('lastOrder');
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!orderData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-card">
          <div className="success-icon">
            <div className="checkmark-circle">
              <svg className="checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle-path" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          </div>

          <h1>Order Placed Successfully! 🎉</h1>
          <p className="confirmation-subtitle">
            Thank you for your purchase! Your order has been received and is being processed.
          </p>

          <div className="order-details-box">
            <h2>Order Details</h2>
            <div className="order-info-grid">
              <div className="order-info-item">
                <span className="label">Order ID:</span>
                <span className="value">#{orderData.orderId}</span>
              </div>
              <div className="order-info-item">
                <span className="label">Total Amount:</span>
                <span className="value total-amount">${orderData.total.toFixed(2)}</span>
              </div>
              <div className="order-info-item">
                <span className="label">Payment Method:</span>
                <span className="value">{orderData.paymentMethod === 'cash' ? '💵 Cash on Delivery' : orderData.paymentMethod}</span>
              </div>
              <div className="order-info-item">
                <span className="label">Customer:</span>
                <span className="value">{orderData.customerName}</span>
              </div>
              <div className="order-info-item">
                <span className="label">Email:</span>
                <span className="value">{orderData.customerEmail}</span>
              </div>
              {orderData.customerPhone && (
                <div className="order-info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{orderData.customerPhone}</span>
                </div>
              )}
              <div className="order-info-item full-width">
                <span className="label">Delivery Address:</span>
                <span className="value">{orderData.customerAddress}</span>
              </div>
            </div>
          </div>

          <div className="order-items-box">
            <h3>Items Ordered ({orderData.items.length})</h3>
            <div className="confirmation-items">
              {orderData.items.map((item, index) => (
                <div key={index} className="confirmation-item">
                  <div className="item-name">{item.product_name}</div>
                  <div className="item-quantity">Qty: {item.quantity}</div>
                  <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="confirmation-message">
            <p>📧 A confirmation email has been sent to <strong>{orderData.customerEmail}</strong></p>
            <p>📦 You can track your order status from your account page.</p>
          </div>

          <div className="confirmation-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/account')}
            >
              View My Orders
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
