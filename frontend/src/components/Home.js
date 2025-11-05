import React, { useEffect, useState } from 'react';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { Search, TrendingUp } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchTopProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll({ page: 1 });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const response = await productAPI.getTop();
      setTopProducts(response.data);
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await productAPI.getAll({ keyword: searchTerm });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container">
      {/* Hero Section */}
      <div className="hero" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', color: 'var(--dark)' }}>
          Welcome to MultiVendor Marketplace
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--secondary)', marginBottom: '30px' }}>
          Discover amazing products from verified vendors
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search for products..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Search size={20} />
            </button>
          </div>
        </form>
      </div>

      {/* Top Rated Products */}
      {topProducts.length > 0 && (
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp color="var(--primary)" />
            Top Rated Products
          </h2>
          <div className="grid grid-4">
            {topProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* All Products */}
      <section>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>All Products</h2>
        {products.length > 0 ? (
          <div className="grid grid-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '18px', color: 'var(--secondary)' }}>
              No products found. Try a different search term.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;