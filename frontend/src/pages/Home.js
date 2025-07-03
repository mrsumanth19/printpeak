import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data.slice(0, 4));
      } catch (err) {
        console.error('❌ Error fetching products:', err);
      }
    };

    fetchTrendingProducts();
  }, []);

  const features = [
    { icon: 'fa-truck-fast', title: 'Fast Delivery', desc: 'Get your products quickly, no delays.' },
    { icon: 'fa-paint-brush', title: 'Custom Designs', desc: 'Upload your own artwork or logo easily.' },
    { icon: 'fa-gem', title: 'Premium Quality', desc: 'Soft, durable, high-grade materials.' },
    { icon: 'fa-box-open', title: 'Easy Returns', desc: 'Not happy? Get easy replacements.' },
  ];

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif', backgroundColor: '#fafafa', color: '#1e1e1e' }}>
      {/* Hero Section */}
      <section style={{ background: '#f3f4f6', padding: '6rem 0' }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-4 mb-md-0">
              <h1 className="fw-bold display-4 mb-3">
                You <span style={{ color: '#1e1e1e' }}>Dream It</span>,<br />
                <span style={{ color: '#d90429' }}>We Print It</span>
              </h1>
              <p className="lead text-muted">
                Custom clothes printing made easy. Upload your designs, choose your style, and get them printed in premium quality.
              </p>
              <Link to="/products">
                <Button
                  size="lg"
                  className="fw-semibold mt-4"
                  style={{
                    backgroundColor: '#1e1e1e',
                    color: '#ffffff',
                    borderRadius: '10px',
                    border: 'none',
                    padding: '12px 28px',
                  }}
                >
                  Explore Now
                </Button>
              </Link>
            </Col>
            <Col md={6} className="text-center">
              <img
                src="https://www.appnova.com/wp-content/uploads/2024/10/An-Essential-Guide-to-Fashion-eCommerce-Top-Trends-Winning-Strategies-and-More1-1220x1220.jpg"
                alt="Fashion"
                className="img-fluid"
                style={{
                  maxWidth: '70%',
                  maxHeight: '400px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  objectFit: 'cover',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Trending Products */}
      <section className="py-5" style={{ backgroundColor: '#ffffff' }}>
        <Container>
          <h2 className="text-center fw-bold mb-5">Trending Now</h2>
          <Row className="g-4">
            {products.length === 0 ? (
              <p className="text-center w-100 text-muted">No trending products available.</p>
            ) : (
              products.map((product) => (
                <Col key={product._id} lg={3} md={4} sm={6} xs={12}>
                  <ProductCard
                    title={product.name}
                    price={`₹${product.price}`}
                    image={product.image}
                    description={product.description}
                    productId={product._id}
                  />
                </Col>
              ))
            )}
          </Row>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="py-5" style={{ backgroundColor: '#f9f9f9' }}>
        <Container>
          <h2 className="text-center fw-bold mb-4">Why Choose BagPack?</h2>
          <Row className="text-center">
            {features.map((item, idx) => (
              <Col key={idx} md={3} sm={6} xs={12} className="mb-4">
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '30px',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
                    height: '100%',
                  }}
                >
                  <i className={`fa ${item.icon} fa-2x mb-3`} style={{ color: '#1e1e1e' }}></i>
                  <h5 className="fw-bold">{item.title}</h5>
                  <p className="text-muted small">{item.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-5 text-center" style={{ backgroundColor: '#ffffff' }}>
        <Container>
          <h3 className="fw-bold mb-3">Start Creating Your Style Today</h3>
          <p className="text-muted mb-4">Upload your design and let us bring your vision to life.</p>
          <Link to="/products">
            <Button
              size="lg"
              style={{
                backgroundColor: '#d90429',
                color: '#fff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
              }}
            >
              Shop Now
            </Button>
          </Link>
        </Container>
      </section>
    </div>
  );
};

export default Home;
