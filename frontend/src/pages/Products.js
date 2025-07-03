// ✅ Updated Products.jsx to match ProductCard flow
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Row, Col, Card, Button, Modal, Form, Offcanvas
} from 'react-bootstrap';
import { FunnelFill } from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import './Products.css';
import CustomModal from '../components/CustomModal';

const stripePromise = loadStripe('pk_test_51RflLWRnB0shCfGSAQM4e9kS3pDD8w4DqSMyRrea4jOtuVkho5UuDOukJM2NecCgLRZ48u17z09ArGrD5BFsJYTg00uSbHwuE3');

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [size, setSize] = useState('');
  const [method, setMethod] = useState('Home Delivery');
  const [designFile, setDesignFile] = useState(null);
  const [designPreview, setDesignPreview] = useState(null);
  const [address, setAddress] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [modalInfo, setModalInfo] = useState({ show: false, title: '', body: '', onOk: null, onCancel: null });

  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  useEffect(() => {
    axios.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error('❌ Error fetching products:', err));
  }, []);

  useEffect(() => {
    const pending = JSON.parse(localStorage.getItem('pendingAction'));
    if (user && pending) {
      const found = products.find(p => p._id === pending.productId);
      if (!found) return;

      if (pending.type === 'addToCart') handleAddToCart(found);
      else if (pending.type === 'buyNow') {
        setSelectedProduct(found);
        setShowModal(true);
        setSize('');
        setMethod('Home Delivery');
        setDesignFile(null);
        setDesignPreview(null);
        setAddress(user?.address || '');
      }
      localStorage.removeItem('pendingAction');
    }
  }, [user, products]);

  const promptLogin = (actionType, productId) => {
    localStorage.setItem('pendingAction', JSON.stringify({ type: actionType, productId }));
    setModalInfo({
      show: true,
      title: 'Login Required',
      body: 'Please login to continue.',
      onOk: () => navigate('/login'),
      onCancel: () => navigate(location.pathname),
    });
  };

  const handleAddToCart = (product) => {
    if (!userId) return promptLogin('addToCart', product._id);

    setModalInfo({
      show: true,
      title: 'Add to Cart',
      body: 'Do you want to add this item to your cart?',
      onOk: async () => {
        try {
          const res = await axios.post('/api/cart/add', { userId, productId: product._id });
          if (res.data.message === 'Already in cart') {
            setModalInfo({ show: true, title: 'Already in Cart', body: 'This product is already in your cart.', onOk: () => navigate('/cart') });
          } else {
            setModalInfo({ show: true, title: 'Success', body: '✅ Added to cart!', onOk: () => navigate('/cart') });
          }
        } catch (err) {
          setModalInfo({ show: true, title: 'Error', body: '❌ Failed to add to cart.', onOk: () => {} });
        }
      },
      onCancel: () => {}
    });
  };

  const openBuyModal = (product) => {
    if (!userId) return promptLogin('buyNow', product._id);

    setModalInfo({
      show: true,
      title: 'Buy Now',
      body: 'Do you want to customize and place your order?',
      onOk: () => {
        setSelectedProduct(product);
        setShowModal(true);
        setSize('');
        setMethod('Home Delivery');
        setDesignFile(null);
        setDesignPreview(null);
        setAddress(user?.address || '');
      },
      onCancel: () => {}
    });
  };

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    if (!size || !designFile || !method || !address) {
      return setModalInfo({ show: true, title: 'Missing Fields', body: 'Fill all fields.', onOk: () => {} });
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('productId', selectedProduct._id);
    formData.append('size', size);
    formData.append('method', method);
    formData.append('design', designFile);
    formData.append('address', address);

    if (method === 'Card Payment') {
      try {
        const res = await axios.post('/api/orders/create-stripe-session', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: res.data.sessionId });
      } catch (err) {
        setModalInfo({ show: true, title: 'Stripe Error', body: '❌ Failed to proceed.', onOk: () => {} });
      }
      return;
    }

    try {
      await axios.post('/api/orders/custom', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setModalInfo({
        show: true,
        title: 'Order Placed',
        body: '✅ Your order has been placed!',
        onOk: () => {
          setShowModal(false);
          navigate('/orders');
        },
      });
    } catch (err) {
      setModalInfo({ show: true, title: 'Order Failed', body: '❌ Could not place the order.', onOk: () => {} });
    }
  };

  const filteredProducts = [...products].sort((a, b) => {
    if (sortOption === 'az') return a.name.localeCompare(b.name);
    if (sortOption === 'za') return b.name.localeCompare(a.name);
    if (sortOption === 'lowHigh') return a.price - b.price;
    if (sortOption === 'highLow') return b.price - a.price;
    if (sortOption === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  return (
    <Container className="py-4">
      <h2 className="text-center fw-bold mb-4">🛍 All Products</h2>
      <Row className="mb-4 justify-content-between align-items-center">
        <Col xs="auto">
          <Button variant="outline-dark" onClick={() => setShowFilters(true)} className="filter-button">
            <FunnelFill className="me-2" /> Filters
          </Button>
        </Col>
        <Col xs="auto">
          <Form.Select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="filter-button">
            <option value="">Sort By</option>
            <option value="az">A - Z</option>
            <option value="za">Z - A</option>
            <option value="newest">Newest</option>
            <option value="lowHigh">Price: Low to High</option>
            <option value="highLow">Price: High to Low</option>
          </Form.Select>
        </Col>
      </Row>

      <Row>
        {filteredProducts.map((product) => (
          <Col key={product._id} xs={6} sm={6} md={4} lg={3} className="mb-4">
            <Card className="h-100 product-card border-0 shadow-sm">
              <Card.Img variant="top" src={product.image} className="product-img" />
              <Card.Body className="d-flex flex-column justify-content-between p-3">
                <div>
                  <Card.Title className="fw-semibold" style={{ color: '#393E46', fontSize: '1.1rem' }}>{product.name}</Card.Title>
                  <Card.Text className="fw-bold" style={{ color: '#d90429' }}>₹{product.price}</Card.Text>
                  <Card.Text style={{ fontSize: '0.9rem', color: '#6c757d' }}>{product.description}</Card.Text>
                </div>
                <div className="d-flex gap-2 mt-3 flex-wrap justify-content-between">
                  <Button onClick={() => handleAddToCart(product)} className="product-button-outline">
                    <i className="fas fa-cart-plus me-2" /> Add
                  </Button>
                  <Button onClick={() => openBuyModal(product)} className="product-button-buy">
                    <i className="fas fa-bolt me-2" /> Buy
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>🛒 Customize & Buy</Modal.Title></Modal.Header>
        <Form onSubmit={handleBuySubmit} encType="multipart/form-data">
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Size</Form.Label>
              <Form.Select value={size} onChange={(e) => setSize(e.target.value)} required>
                <option value="">Select Size</option>
                <option>S</option><option>M</option><option>L</option><option>XL</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Upload Design</Form.Label>
              <Form.Control type="file" accept="image/*" required onChange={(e) => {
                const file = e.target.files[0];
                setDesignFile(file);
                if (file) setDesignPreview(URL.createObjectURL(file));
              }} />
            </Form.Group>
            <div className="mb-3 text-center">
  <p className="mb-1 fw-semibold">Mockup Preview</p>
  <div className="mockup-container">
    <img src={selectedProduct?.image} alt="Product" className="mockup-product" />
    {designPreview && (
      <img src={designPreview} alt="Design" className="mockup-design" />
    )}
  </div>
</div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Shipping Address</Form.Label>
              <Form.Control as="textarea" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Delivery Method</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check type="radio" label="Cash on Delivery" name="method" value="Home Delivery" checked={method === 'Home Delivery'} onChange={(e) => setMethod(e.target.value)} />
                <Form.Check type="radio" label="Stripe Payment" name="method" value="Card Payment" checked={method === 'Card Payment'} onChange={(e) => setMethod(e.target.value)} />
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" style={{ backgroundColor: '#d90429', border: 'none' }}>Submit Order</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <CustomModal
        show={modalInfo.show}
        title={modalInfo.title}
        body={modalInfo.body}
        onConfirm={() => {
          setModalInfo({ ...modalInfo, show: false });
          modalInfo.onOk?.();
        }}
        onCancel={() => {
          setModalInfo({ ...modalInfo, show: false });
          modalInfo.onCancel?.();
        }}
      />
    </Container>
  );
};

export default Products;
