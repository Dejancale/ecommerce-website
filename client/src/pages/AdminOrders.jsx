import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config.js';
import './AdminDashboard.css';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { isAdmin, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrder(response.data.order);
      setOrderItems(response.data.items);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `http://localhost:3000/api/admin/orders/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: newStatus } : order
      ));
      
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  // Order Details View
  if (orderId && selectedOrder) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <button onClick={() => navigate('/admin/orders')} className="btn-back">
            ← Back to Orders
          </button>

          <div className="order-details-page">
            <div className="order-header">
              <h1>Order #{selectedOrder.id}</h1>
              <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
            </div>

            <div className="order-details-grid">
              <div className="details-card">
                <h3>Customer Information</h3>
                <div className="detail-row">
                  <span>Name:</span>
                  <span>{selectedOrder.customer_name}</span>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <span>{selectedOrder.customer_email}</span>
                </div>
                <div className="detail-row">
                  <span>Phone:</span>
                  <span>{selectedOrder.customer_phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span>Address:</span>
                  <span>{selectedOrder.customer_address}</span>
                </div>
              </div>

              <div className="details-card">
                <h3>Order Information</h3>
                <div className="detail-row">
                  <span>Order Date:</span>
                  <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Payment Method:</span>
                  <span>{selectedOrder.payment_method}</span>
                </div>
                <div className="detail-row">
                  <span>Total Amount:</span>
                  <span className="order-total">${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
                {selectedOrder.user_email && (
                  <div className="detail-row">
                    <span>User Account:</span>
                    <span>{selectedOrder.user_email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="details-card">
              <h3>Order Items</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="details-card">
              <h3>Update Order Status</h3>
              <div className="status-buttons">
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    className={`btn-status ${selectedOrder.status === status ? 'active' : ''}`}
                    onClick={() => updateOrderStatus(selectedOrder.id, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Orders List View
  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Manage Orders</h1>
          <button onClick={() => navigate('/admin')} className="btn-admin">
            ← Back to Dashboard
          </button>
        </div>

        <div className="filters-bar">
          <input
            type="text"
            placeholder="Search by name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="orders-count">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.customer_email}</td>
                  <td>{order.customer_phone || 'N/A'}</td>
                  <td>${order.total_amount.toFixed(2)}</td>
                  <td>{order.payment_method}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="btn-view"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
