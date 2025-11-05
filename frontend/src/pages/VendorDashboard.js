import React, { useEffect, useState } from 'react';
import { vendorAPI } from '../services/api';
import Loader from '../components/Loader';
import { Package, DollarSign, ShoppingBag, AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const VendorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
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

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await vendorAPI.deleteProduct(id);
        toast.success('Product deleted successfully!');
        fetchDashboardData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
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
                          <button className="btn btn-secondary" style={{ padding: '5px 10px' }}>
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '5px 10px' }}
                            onClick={() => handleDeleteProduct(product._id)}
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
                        <button className="btn btn-primary" style={{ padding: '5px 15px', fontSize: '12px' }}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;