import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        // Get first 4 products as featured
        setFeaturedProducts(response.data.products.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to ShopHub</h1>
          <p>Discover amazing products at unbeatable prices</p>
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/products" className="btn btn-secondary">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="trust-signals">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>On orders over $50</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🔒</div>
              <h3>Secure Payment</h3>
              <p>100% secure transactions</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">↩️</div>
              <h3>Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">💬</div>
              <h3>24/7 Support</h3>
              <p>Dedicated customer service</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2>About ShopHub</h2>
          <div className="about-content">
            <p>
              Welcome to ShopHub, your number one source for all things amazing. 
              We're dedicated to giving you the very best products, with a focus on 
              quality, customer service, and uniqueness.
            </p>
            <p>
              Founded in 2024, ShopHub has come a long way from its beginnings. 
              When we first started out, our passion for eco-friendly and affordable 
              products drove us to start our own business.
            </p>
            <p>
              We hope you enjoy our products as much as we enjoy offering them to you. 
              If you have any questions or comments, please don't hesitate to contact us.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2>What Our Customers Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="rating">★★★★★</div>
              <p>"Amazing products and fast shipping! I'm very satisfied with my purchase."</p>
              <p className="customer-name">- Sarah Johnson</p>
            </div>
            <div className="testimonial-card">
              <div className="rating">★★★★★</div>
              <p>"Great quality and excellent customer service. Highly recommended!"</p>
              <p className="customer-name">- Mike Davis</p>
            </div>
            <div className="testimonial-card">
              <div className="rating">★★★★★</div>
              <p>"Best online shopping experience I've had. Will definitely shop here again!"</p>
              <p className="customer-name">- Emily Chen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Contact Us</h3>
              <p>Have a question or feedback? We'd love to hear from you!</p>
              <div className="contact-details">
                <p>📧 Email: support@shophub.com</p>
                <p>📞 Phone: +1 (555) 123-4567</p>
                <p>📍 Address: 123 Shop Street, Commerce City, ST 12345</p>
              </div>
              <div className="social-links">
                <a href="#" className="social-icon">Facebook</a>
                <a href="#" className="social-icon">Twitter</a>
                <a href="#" className="social-icon">Instagram</a>
              </div>
            </div>

            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input type="text" id="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Your Email</label>
                <input type="email" id="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea id="message" rows="5" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 ShopHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
