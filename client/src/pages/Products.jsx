import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceFilter, setPriceFilter] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      if (priceFilter === '0-50') {
        filtered = filtered.filter(p => p.price < 50);
      } else if (priceFilter === '50-100') {
        filtered = filtered.filter(p => p.price >= 50 && p.price < 100);
      } else if (priceFilter === '100-200') {
        filtered = filtered.filter(p => p.price >= 100 && p.price < 200);
      } else if (priceFilter === '200+') {
        filtered = filtered.filter(p => p.price >= 200);
      }
    }

    // Stock filter
    if (inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }

    // Sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.reviews - a.reviews);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategories, priceFilter, inStockOnly, sortBy]);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceFilter('all');
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="products-page">
      <section className="products-header">
        <div className="container">
          <h1>Our Products</h1>
          <p>Browse our complete collection</p>
        </div>
      </section>

      <section className="products-section">
        <div className="container">
          <div className="products-layout">
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
              <h3>Filters</h3>

              {/* Search */}
              <div className="filter-group">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <h4>Categories</h4>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('electronics')}
                    onChange={() => handleCategoryChange('electronics')}
                  />
                  Electronics
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('accessories')}
                    onChange={() => handleCategoryChange('accessories')}
                  />
                  Accessories
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('clothing')}
                    onChange={() => handleCategoryChange('clothing')}
                  />
                  Clothing
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('home')}
                    onChange={() => handleCategoryChange('home')}
                  />
                  Home & Living
                </label>
              </div>

              {/* Price Filter */}
              <div className="filter-group">
                <h4>Price Range</h4>
                <label>
                  <input
                    type="radio"
                    name="price"
                    checked={priceFilter === 'all'}
                    onChange={() => setPriceFilter('all')}
                  />
                  All Prices
                </label>
                <label>
                  <input
                    type="radio"
                    name="price"
                    checked={priceFilter === '0-50'}
                    onChange={() => setPriceFilter('0-50')}
                  />
                  Under $50
                </label>
                <label>
                  <input
                    type="radio"
                    name="price"
                    checked={priceFilter === '50-100'}
                    onChange={() => setPriceFilter('50-100')}
                  />
                  $50 - $100
                </label>
                <label>
                  <input
                    type="radio"
                    name="price"
                    checked={priceFilter === '100-200'}
                    onChange={() => setPriceFilter('100-200')}
                  />
                  $100 - $200
                </label>
                <label>
                  <input
                    type="radio"
                    name="price"
                    checked={priceFilter === '200+'}
                    onChange={() => setPriceFilter('200+')}
                  />
                  Over $200
                </label>
              </div>

              {/* Availability Filter */}
              <div className="filter-group">
                <h4>Availability</h4>
                <label>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  In Stock Only
                </label>
              </div>

              <button className="btn btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            </aside>

            {/* Products Grid */}
            <div className="products-main">
              <div className="products-toolbar">
                <p className="results-count">
                  <span>{filteredProducts.length}</span> Products Found
                </p>
                <div className="sort-options">
                  <label htmlFor="sortSelect">Sort by:</label>
                  <select
                    id="sortSelect"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="no-products">
                  <p>No products found matching your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
