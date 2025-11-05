import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const itemsPrice = getCartTotal();
  const shippingPrice = 10;
  const taxPrice = itemsPrice * 0.1;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate address
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const { data } = await orderAPI.createPaymentIntent({ amount: totalPrice });

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.name,
            email: user.email,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Create order
      const orderItems = cartItems.map((item) => ({
        product: item._id,
        vendor: item.vendor._id || item.vendor,
        name: item.name,
        quantity: item.quantity,
        image: item.images[0]?.url,
        price: item.price,
      }));

      const orderData = {
        orderItems,
        shippingAddress,
        paymentMethod: 'stripe',
        itemsPrice: itemsPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
      };

      const orderResponse = await orderAPI.create(orderData);

      // Update order as paid
      await orderAPI.pay(orderResponse.data._id, {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date().toISOString(),
        email_address: user.email,
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${orderResponse.data._id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '30px', paddingBottom: '50px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit}>
            {/* Shipping Address */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '20px' }}>Shipping Address</h3>

              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="street"
                  className="form-control"
                  placeholder="123 Main St"
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="New York"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    placeholder="NY"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    className="form-control"
                    placeholder="10001"
                    value={shippingAddress.zipCode}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    className="form-control"
                    placeholder="USA"
                    value={shippingAddress.country}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Payment Information</h3>
              <div className="form-group">
                <label>Card Details</label>
                <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '15px', fontSize: '16px', marginTop: '20px' }}
                disabled={!stripe || loading}
              >
                {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
              </button>

              <p style={{ textAlign: 'center', color: 'var(--secondary)', fontSize: '14px', marginTop: '15px' }}>
                Test Card: 4242 4242 4242 4242 | Any future date | Any 3 digits
              </p>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>

            {cartItems.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: '10px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--border)' }}>
                <img
                  src={item.images[0]?.url}
                  alt={item.name}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', marginBottom: '5px' }}>{item.name}</p>
                  <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>
                    Qty: {item.quantity} × ${item.price}
                  </p>
                </div>
                <div>
                  <p style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '20px' }}>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${itemsPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>${shippingPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total:</span>
                <span style={{ color: 'var(--primary)' }}>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;