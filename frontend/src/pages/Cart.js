import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container cart-container">
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--secondary)', marginBottom: '30px' }}>
            Add some products to get started!
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-container">
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Cart Items */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img
                src={item.images[0]?.url || 'https://via.placeholder.com/100'}
                alt={item.name}
                className="cart-item-image"
              />
              
              <div className="cart-item-details">
                <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>{item.name}</h3>
                <p style={{ color: 'var(--secondary)', marginBottom: '10px' }}>
                  ${item.price} each
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px' }}>
                    <button
                      className="btn"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      style={{ padding: '5px 10px' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                      {item.quantity}
                    </span>
                    <button
                      className="btn"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      style={{ padding: '5px 10px' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      removeFromCart(item._id);
                      toast.info('Item removed from cart');
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal:</span>
            <span style={{ fontWeight: '600' }}>${getCartTotal().toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping:</span>
            <span style={{ fontWeight: '600' }}>$10.00</span>
          </div>

          <div className="summary-row">
            <span>Tax (10%):</span>
            <span style={{ fontWeight: '600' }}>${(getCartTotal() * 0.1).toFixed(2)}</span>
          </div>

          <div className="summary-row summary-total">
            <span>Total:</span>
            <span style={{ color: 'var(--primary)' }}>
              ${(getCartTotal() + 10 + getCartTotal() * 0.1).toFixed(2)}
            </span>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '16px', marginTop: '20px' }}
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>

          <button
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;