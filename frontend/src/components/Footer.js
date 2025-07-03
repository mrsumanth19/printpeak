import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer
      className="mt-auto pt-5 pb-3"
      style={{
        backgroundColor: '#F7F7F7',
        fontFamily: 'Outfit, sans-serif',
        borderTop: '1px solid #ddd',
      }}
    >
      <Container>
        <Row className="text-center text-md-start">
          {/* Company */}
          <Col md={4} sm={12} className="mb-4">
            <h5 className="fw-bold" style={{ color: '#393E46' }}>
              Print<span style={{ color: '#d90429' }}>Peak</span>
            </h5>
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              Your one-stop shop for custom printed apparel. Dream it.Wear it.
            </p>
          </Col>

          {/* Help */}
          <Col md={4} sm={6} className="mb-4">
            <h6 className="fw-bold" style={{ color: '#393E46' }}>Help</h6>
            <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
              <li><a href="/faq" style={{ textDecoration: 'none', color: '#6c757d' }}>FAQs</a></li>
              <li><a href="/contact" style={{ textDecoration: 'none', color: '#6c757d' }}>Contact Us</a></li>
              <li><a href="/shipping" style={{ textDecoration: 'none', color: '#6c757d' }}>Shipping & Returns</a></li>
              <li><a href="/terms" style={{ textDecoration: 'none', color: '#6c757d' }}>Terms & Conditions</a></li>
            </ul>
          </Col>

          {/* Social */}
          <Col md={4} sm={6} className="mb-4">
            <h6 className="fw-bold" style={{ color: '#393E46' }}>Follow Us</h6>
            <div className="d-flex justify-content-center justify-content-md-start gap-3 mt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <i className="fab fa-instagram fa-lg" style={{ color: '#d90429' }}></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <i className="fab fa-facebook fa-lg" style={{ color: '#3b5998' }}></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <i className="fab fa-twitter fa-lg" style={{ color: '#1da1f2' }}></i>
              </a>
              <a href="mailto:support@printpeak.com">
                <i className="fas fa-envelope fa-lg" style={{ color: '#393E46' }}></i>
              </a>
            </div>
          </Col>
        </Row>

        {/* Bottom Line */}
        <hr />
        <div className="text-center mt-3" style={{ color: '#6c757d', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} <span className="fw-bold" style={{ color: '#d90429' }}>PrintPeak</span>. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
