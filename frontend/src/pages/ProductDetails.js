import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Star, ShoppingCart, Minus, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      setProduct(response.data.product);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      toast.error('Not enough stock available');
      return;
    }
    addToCart(product, quantity);
    toast.success('Added to cart!');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add a review');
      return;
    }

    try {
      await productAPI.addReview(id, reviewData);
      toast.success('Review added successfully!');
      fetchProduct();
      setReviewData({ rating: 5, comment: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review');
    }
  };

  if (loading) return <Loader />;
  if (!product) return <div className="container">Product not found</div>;

  return (
    <div className="container" style={{ paddingTop: '30px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        {/* Product Images */}
        <div>
          <img
            src={product.images[selectedImage]?.url || 'https://via.placeholder.com/500'}
            alt={product.name}
            style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`${product.name} ${index + 1}`}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: selectedImage === index ? '2px solid var(--primary)' : '2px solid transparent',
                }}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Star size={20} fill="#fbbf24" color="#fbbf24" />
              <span style={{ fontWeight: '600' }}>{product.rating}</span>
              <span style={{ color: 'var(--secondary)' }}>({product.numReviews} reviews)</span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '36px', fontWeight: '700', color: 'var(--primary)' }}>
              ${product.price}
            </span>
            {product.comparePrice && (
              <span style={{ fontSize: '24px', color: 'var(--secondary)', textDecoration: 'line-through', marginLeft: '10px' }}>
                ${product.comparePrice}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontWeight: '600' }}>Category: </span>
            <span className="btn btn-secondary" style={{ padding: '5px 15px', fontSize: '14px' }}>
              {product.category}
            </span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontWeight: '600' }}>Stock: </span>
            <span style={{ color: product.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </span>
          </div>

          <p style={{ color: 'var(--secondary)', lineHeight: '1.6', marginBottom: '30px' }}>
            {product.description}
          </p>

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px' }}>
              <button
                className="btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '5px 10px' }}
              >
                <Minus size={16} />
              </button>
              <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>{quantity}</span>
              <button
                className="btn"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                style={{ padding: '5px 10px' }}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: '12px 40px', fontSize: '16px' }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
          </div>

          {/* Vendor Info */}
          <div className="card" style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '10px' }}>Sold by</h3>
            <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary)' }}>
              {product.vendor.shopName || product.vendor.name}
            </p>
            {product.vendor.vendorRating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <span>{product.vendor.vendorRating} Vendor Rating</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Customer Reviews</h2>

        {/* Add Review Form */}
        {isAuthenticated && (
          <div className="card" style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Write a Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label>Rating</label>
                <select
                  className="form-control"
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({ ...reviewData, rating: e.target.value })}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Terrible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div>
            {reviews.map((review) => (
              <div key={review._id} className="card" style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <strong>{review.user.name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < review.rating ? '#fbbf24' : 'none'}
                          color="#fbbf24"
                        />
                      ))}
                    </div>
                  </div>
                  <span style={{ color: 'var(--secondary)', fontSize: '14px' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ color: 'var(--secondary)' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--secondary)' }}>No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;