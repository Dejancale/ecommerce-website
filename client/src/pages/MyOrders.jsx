import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './MyOrders.css';

const MyOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/auth/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setOrders(response.data.orders || []);
        } catch (err) {
            setError('Failed to load orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const viewOrderDetails = async (orderId) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSelectedOrder(response.data.order);
            setOrderItems(response.data.items || []);
        } catch (err) {
            console.error('Failed to load order details:', err);
        }
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setOrderItems([]);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#fbbf24',
            processing: '#3b82f6',
            shipped: '#8b5cf6',
            delivered: '#10b981',
            cancelled: '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳',
            processing: '📦',
            shipped: '🚚',
            delivered: '✅',
            cancelled: '❌'
        };
        return icons[status] || '📋';
    };

    if (loading) {
        return (
            <div className="my-orders-container">
                <div className="loading">Loading your orders...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-orders-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="my-orders-container">
            <div className="my-orders-header">
                <h1>My Orders</h1>
                <p>Track and view your order history</p>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <div className="no-orders-icon">📦</div>
                    <h2>No Orders Yet</h2>
                    <p>You haven't placed any orders yet.</p>
                    <Link to="/products" className="btn-shop-now">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="orders-grid">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <div>
                                    <h3>Order #{order.id}</h3>
                                    <p className="order-date">
                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <span 
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                >
                                    {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>

                            <div className="order-details">
                                <div className="detail-item">
                                    <span className="label">Total Amount:</span>
                                    <span className="value">${order.total_amount.toFixed(2)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Payment:</span>
                                    <span className="value">{order.payment_method}</span>
                                </div>
                            </div>

                            <button 
                                className="btn-view-details"
                                onClick={() => viewOrderDetails(order.id)}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>&times;</button>
                        
                        <h2>Order #{selectedOrder.id}</h2>
                        
                        <div className="modal-section">
                            <h3>Status</h3>
                            <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                            >
                                {getStatusIcon(selectedOrder.status)} {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                            </span>
                        </div>

                        <div className="modal-section">
                            <h3>Order Items</h3>
                            <div className="order-items-list">
                                {orderItems.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <div className="item-info">
                                            <strong>{item.product_name}</strong>
                                            <span>Quantity: {item.quantity}</span>
                                        </div>
                                        <div className="item-price">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-section">
                            <h3>Delivery Information</h3>
                            <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                            <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                            <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                            <p><strong>Address:</strong> {selectedOrder.customer_address}</p>
                        </div>

                        <div className="modal-section">
                            <h3>Payment</h3>
                            <p><strong>Method:</strong> {selectedOrder.payment_method}</p>
                            <p className="order-total"><strong>Total:</strong> ${selectedOrder.total_amount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
