import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI } from '../services/api';
import Loader from '../components/Loader';
import { Package, DollarSign, ShoppingBag, AlertTriangle, Plus, Edit, Trash2, X, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    images: null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        vendorAPI.getDashboard(),
        vendorAPI.getProducts(),
        vendorAPI.getOrders(),
      ]);

      setStats(statsRes.data);
      setProducts(productsRes.data.products);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('stock', productForm.stock);

      if (productForm.images) {
        for (let i = 0; i < productForm.images.length; i++) {
          formData.append('images', productForm.images[i]);
        }
      }

      await vendorAPI.createProduct(formData);
      toast.success('Product created successfully!');
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', price: '', category: 'Electronics', stock: '', images: null });
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: null,
    });
    setShowEditProduct(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('stock', productForm.stock);

      if (productForm.images) {
        for (let i = 0; i < productForm.images.length; i++) {
          formData.append('images', productForm.images[i]);
        }
      }

      await vendorAPI.updateProduct(selectedProduct._id, formData);
      toast.success('Product updated successfully!');
      setShowEditProduct(false);
      setSelectedProduct(null);
      setProductForm({ name: '', description: '', price: '', category: 'Electronics', stock: '', images: null });
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteClick = (product) => {
    setDeleteTarget(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await vendorAPI.deleteProduct(deleteTarget._id);
      toast.success('Product deleted successfully!');
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleOrderDetailsClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await vendorAPI.updateOrderStatus(orderId, { status });
      toast.success('Order status updated!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Vendor Dashboard</h1>
          <p style={{ color: 'var(--secondary)' }}>Manage your products and orders</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-label">Total Products</p>
                <p className="stat-value">{stats?.totalProducts || 0}</p>
              </div>
              <Package size={40} color="var(--primary)" />
            </div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-label">Total Revenue</p>
                <p className="stat-value">${stats?.totalRevenue || 0}</p>
              </div>
              <DollarSign size={40} color="var(--success)" />
            </div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-label">Total Orders</p>
                <p className="stat-value">{stats?.totalOrders || 0}</p>
              </div>
              <ShoppingBag size={40} color="var(--warning)" />
            </div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-label">Low Stock Items</p>
                <p className="stat-value">{stats?.lowStockProducts?.length || 0}</p>
              </div>
              <AlertTriangle size={40} color="var(--danger)" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '2px solid var(--border)' }}>
          <button
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('overview')}
            style={{ borderRadius: '6px 6px 0 0' }}
          >
            Overview
          </button>
          <button
            className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('products')}
            style={{ borderRadius: '6px 6px 0 0' }}
          >
            Products
          </button>
          <button
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('orders')}
            style={{ borderRadius: '6px 6px 0 0' }}
          >
            Orders
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {stats?.lowStockProducts?.length > 0 && (
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>⚠️ Low Stock Alert</h3>
                {stats.lowStockProducts.map((product) => (
                  <div key={product._id} style={{ padding: '10px', marginBottom: '10px', backgroundColor: 'var(--light)', borderRadius: '6px' }}>
                    <strong>{product.name}</strong> - Only {product.stock} left in stock
                  </div>
                ))}
              </div>
            )}

            <div className="card">
              <h3 style={{ marginBottom: '15px' }}>Recent Orders</h3>
              {stats?.recentOrders?.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-8)}</td>
                          <td>{order.user?.name}</td>
                          <td>
                            <span className={`btn btn-${order.status === 'delivered' ? 'success' : 'warning'}`} style={{ padding: '5px 10px', fontSize: '12px' }}>
                              {order.status}
                            </span>
                          </td>
                          <td>${order.totalPrice}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--secondary)' }}>No recent orders</p>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>My Products</h2>
              <button className="btn btn-primary" onClick={() => setShowAddProduct(!showAddProduct)}>
                <Plus size={20} /> Add Product
              </button>
            </div>

            {showAddProduct && (
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>Add New Product</h3>
                <form onSubmit={handleProductSubmit}>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Price</label>
                      <input
                        type="number"
                        className="form-control"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      <option>Electronics</option>
                      <option>Fashion</option>
                      <option>Home & Garden</option>
                      <option>Sports</option>
                      <option>Books</option>
                      <option>Toys</option>
                      <option>Health</option>
                      <option>Automotive</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Product Images (Max 5)</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={(e) => setProductForm({ ...productForm, images: e.target.files })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary">Create Product</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddProduct(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product.images[0]?.url || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>${product.price}</td>
                      <td>
                        <span style={{ color: product.stock < 10 ? 'var(--danger)' : 'var(--success)' }}>
                          {product.stock}
                        </span>
                      </td>
                      <td>{product.category}</td>
                      <td>
                        <span className={`btn ${product.isActive ? 'btn-success' : 'btn-secondary'}`} style={{ padding: '5px 10px', fontSize: '12px' }}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '5px 10px' }}
                            onClick={() => handleEditClick(product)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '5px 10px' }}
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ marginBottom: '20px' }}>My Orders</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-8)}</td>
                      <td>{order.user?.name}</td>
                      <td>{order.orderItems.length}</td>
                      <td>${order.totalPrice}</td>
                      <td>
                        <select
                          className="form-control"
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '5px 15px', fontSize: '12px' }}
                          onClick={() => handleOrderDetailsClick(order)}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditProduct && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Edit Product</h3>
                <button 
                  className="btn" 
                  onClick={() => {
                    setShowEditProduct(false);
                    setSelectedProduct(null);
                  }}
                  style={{ padding: '5px 10px' }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home & Garden</option>
                    <option>Sports</option>
                    <option>Books</option>
                    <option>Toys</option>
                    <option>Health</option>
                    <option>Automotive</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Update Images (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*"
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.files })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary">Update Product</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowEditProduct(false);
                      setSelectedProduct(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
              <h3 style={{ marginBottom: '15px' }}>Confirm Delete</h3>
              <p style={{ marginBottom: '20px', color: 'var(--secondary)' }}>
                Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeleteTarget(null);
                  }}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <div className="card" style={{ width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Order Details - #{selectedOrder._id.slice(-8)}</h3>
                <button 
                  className="btn" 
                  onClick={() => {
                    setShowOrderDetails(false);
                    setSelectedOrder(null);
                  }}
                  style={{ padding: '5px 10px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.user?.name}</p>
                <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4>Shipping Address</h4>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                <p>{selectedOrder.shippingAddress.country}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4>Order Items</h4>
                {selectedOrder.orderItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '15px', padding: '10px', backgroundColor: 'var(--light)', borderRadius: '6px', marginBottom: '10px' }}>
                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600' }}>{item.name}</p>
                      <p style={{ color: 'var(--secondary)' }}>Quantity: {item.quantity}</p>
                    </div>
                    <p style={{ fontWeight: '700' }}>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '2px solid var(--border)', paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Items Price:</span>
                  <span>${selectedOrder.itemsPrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Shipping:</span>
                  <span>${selectedOrder.shippingPrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Tax:</span>
                  <span>${selectedOrder.taxPrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
                  <span>Total:</span>
                  <span>${selectedOrder.totalPrice}</span>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <p><strong>Payment Status:</strong> {selectedOrder.isPaid ? '✅ Paid' : '❌ Unpaid'}</p>
                <p><strong>Order Status:</strong> {selectedOrder.status}</p>
                <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;