import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    toast.success('Added to cart!');
  };

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/products/${product._id}`)}
    >
      <img
        src={product.images[0]?.url || 'https://via.placeholder.com/300'}
        alt={product.name}
        className="product-image"
      />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">${product.price}</div>
        <div className="product-rating">
          <Star size={16} fill="#fbbf24" color="#fbbf24" />
          <span>
            {product.rating} ({product.numReviews})
          </span>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '10px' }}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={16} /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;