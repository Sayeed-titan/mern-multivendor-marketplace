import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, orderAPI } from '../services/api';
import Loader from '../components/Loader';
import { User, MapPin, Phone, Mail, Package } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
      });
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <Loader />;

  return (
    <div className="container" style={{ paddingTop: '30px', paddingBottom: '50px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>My Account</h1>

      {/* Tabs */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '2px solid var(--border)' }}>
        <button
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('profile')}
          style={{ borderRadius: '6px 6px 0 0' }}
        >
          <User size={16} /> Profile
        </button>
        <button
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('orders')}
          style={{ borderRadius: '6px 6px 0 0' }}
        >
          <Package size={16} /> My Orders
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Profile Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <User size={16} style={{ marginRight: '5px' }} />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={16} style={{ marginRight: '5px' }} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Phone size={16} style={{ marginRight: '5px' }} />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>
              <MapPin size={20} style={{ marginRight: '5px' }} />
              Shipping Address
            </h3>

            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address.street"
                className="form-control"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="123 Main Street"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="address.city"
                  className="form-control"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="New York"
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="address.state"
                  className="form-control"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="NY"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  className="form-control"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  placeholder="10001"
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="address.country"
                  className="form-control"
                  value={formData.address.country}
                  onChange={handleChange}
                  placeholder="USA"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px 30px' }}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>Order History</h2>
          {orders.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-8)}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.orderItems.length} items</td>
                      <td>${order.totalPrice}</td>
                      <td>
                        <span className={`btn ${order.isPaid ? 'btn-success' : 'btn-danger'}`} style={{ padding: '5px 10px', fontSize: '12px' }}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <span className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px', textTransform: 'capitalize' }}>
                          {order.status}
                        </span>
                      </td>
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
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <Package size={48} color="var(--secondary)" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ marginBottom: '10px' }}>No Orders Yet</h3>
              <p style={{ color: 'var(--secondary)' }}>Start shopping to see your order history here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;