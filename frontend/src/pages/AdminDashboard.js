import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import Loader from '../components/Loader';
import { Users, Package, ShoppingBag, DollarSign, Check, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, productsRes, ordersRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers(),
        adminAPI.getProducts(),
        adminAPI.getOrders(),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (userId) => {
    try {
      await adminAPI.approveVendor(userId);
      toast.success('Vendor approved successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve vendor');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        toast.success('User deleted successfully!');
        fetchDashboardData();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(productId);
        toast.success('Product deleted successfully!');
        fetchDashboardData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p style={{ color: 'var(--secondary)' }}>Manage your entire marketplace</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-label">Total Customers</p>
                <p className="stat-value">{stats?.totalCustomers || 0}</p>
              </div>
              <Users size={40} color="var(--primary)" />
            </div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-label">Total Vendors</p>
                <p className="stat-value">{stats?.totalVendors || 0}</p>
              </div>
              <Package size={40} color="var(--warning)" />
            </div>
          </div>

<div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="stat-label">Total Revenue</p>
            <p className="stat-value">${stats?.totalRevenue || 0}</p>
          </div>
          <DollarSign size={40} color="var(--primary)" />
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
        className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
        onClick={() => setActiveTab('users')}
        style={{ borderRadius: '6px 6px 0 0' }}
      >
        Users
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
        {/* Revenue Chart */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>Revenue Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id.month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Users */}
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>Recent Users</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentUsers?.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`btn btn-${user.role === 'admin' ? 'danger' : user.role === 'vendor' ? 'warning' : 'secondary'}`} style={{ padding: '5px 10px', fontSize: '12px' }}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {/* Users Tab */}
    {activeTab === 'users' && (
      <div>
        <h2 style={{ marginBottom: '20px' }}>All Users</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Shop Name</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`btn btn-${user.role === 'admin' ? 'danger' : user.role === 'vendor' ? 'warning' : 'secondary'}`} style={{ padding: '5px 10px', fontSize: '12px' }}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.shopName || '-'}</td>
                  <td>
                    {user.role === 'vendor' && (
                      <span className={`btn ${user.isApproved ? 'btn-success' : 'btn-warning'}`} style={{ padding: '5px 10px', fontSize: '12px' }}>
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {user.role === 'vendor' && !user.isApproved && (
                        <button
                          className="btn btn-success"
                          style={{ padding: '5px 10px' }}
                          onClick={() => handleApproveVendor(user._id)}
                        >
                          <Check size={16} /> Approve
                        </button>
                      )}
                      {user.role !== 'admin' && (
                        <button
                          className="btn btn-danger"
                          style={{ padding: '5px 10px' }}
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <X size={16} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Products Tab */}
    {activeTab === 'products' && (
      <div>
        <h2 style={{ marginBottom: '20px' }}>All Products</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Vendor</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Rating</th>
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
                  <td>{product.vendor?.shopName || product.vendor?.name}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td>{product.category}</td>
                  <td>⭐ {product.rating}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '5px 15px', fontSize: '12px' }}
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </button>
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
        <h2 style={{ marginBottom: '20px' }}>All Orders</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
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
                    <span className={`btn ${order.isPaid ? 'btn-success' : 'btn-danger'}`} style={{ padding: '5px 10px', fontSize: '12px' }}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    <span className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
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