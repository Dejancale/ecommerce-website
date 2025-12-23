import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config.js';
import './AdminDashboard.css';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { isAdmin, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    oldPrice: '',
    description: '',
    image: '',
    stockCount: '',
    badge: ''
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [isAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      oldPrice: '',
      description: '',
      image: '',
      stockCount: '',
      badge: ''
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      oldPrice: product.oldPrice || '',
      description: product.description || '',
      image: product.image || '',
      stockCount: product.stockCount || 0,
      badge: product.badge || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update existing product
        await axios.put(
          `${API_BASE_URL}/api/admin/products/${editingProduct.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Product updated successfully!');
      } else {
        // Create new product
        await axios.post(
          `${API_BASE_URL}/api/admin/products`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Product created successfully!');
      }
      
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading products...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Manage Products</h1>
          <div className="admin-nav-buttons">
            <button onClick={() => navigate('/admin')} className="btn-admin">
              ← Back to Dashboard
            </button>
            <button onClick={openCreateModal} className="btn-primary">
              + Add New Product
            </button>
          </div>
        </div>

        <div className="products-grid-admin">
          {products.map((product) => (
            <div key={product.id} className="product-card-admin">
              <div className="product-image-admin">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
              </div>
              <div className="product-info-admin">
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-price">${product.price}</p>
                <p className="product-stock">
                  Stock: {product.stockCount} {product.inStock ? '✅' : '❌'}
                </p>
                {product.badge && (
                  <span className="product-badge-admin">{product.badge}</span>
                )}
              </div>
              <div className="product-actions-admin">
                <button onClick={() => openEditModal(product)} className="btn-edit">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(product.id)} className="btn-delete">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>

              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Home">Home</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Badge</label>
                    <select
                      name="badge"
                      value={formData.badge}
                      onChange={handleInputChange}
                    >
                      <option value="">No Badge</option>
                      <option value="Hot">Hot</option>
                      <option value="New">New</option>
                      <option value="Sale">Sale</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Old Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="oldPrice"
                      value={formData.oldPrice}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Count *</label>
                    <input
                      type="number"
                      name="stockCount"
                      value={formData.stockCount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
