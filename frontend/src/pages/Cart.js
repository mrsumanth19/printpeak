import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Row, Col, Card, Button, Modal, Form,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import './Products.css'; // for shared card styling
import './Cart.css'; // optional extra styles
import CustomModal from '../components/CustomModal';
import { Offcanvas } from 'react-bootstrap';


const stripePromise = loadStripe('pk_test_51RflLWRnB0shCfGSAQM4e9kS3pDD8w4DqSMyRrea4jOtuVkho5UuDOukJM2NecCgLRZ48u17z09ArGrD5BFsJYTg00uSbHwuE3');

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [size, setSize] = useState('');
  const [method, setMethod] = useState('Home Delivery');
  const [designFile, setDesignFile] = useState(null);
  const [designPreview, setDesignPreview] = useState(null);
  const [address, setAddress] = useState('');
  const [modalInfo, setModalInfo] = useState({ show: false, title: '', body: '', onOk: null });

  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  const fetchCart = async () => {
    try {
      const res = await axios.get(`/api/cart/${userId}`);
      const items = res.data;
      const total = items.reduce((sum, item) => sum + (item.product?.price || 0), 0);

      setCartItems(items);
      setTotalAmount(total);
      localStorage.setItem('cartCount', items.length.toString());
      localStorage.setItem('cartTotalAmount', total.toString());
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
    }
  };

  const handleRemove = (productId) => {
    setModalInfo({
      show: true,
      title: 'Remove Item',
      body: 'Are you sure you want to remove this item from your cart?',
      onOk: async () => {
        try {
          await axios.delete(`/api/cart/item/${productId}/${userId}`);
          fetchCart();
        } catch (err) {
          console.error('❌ Error removing item:', err);
        }
      }
    });
  };
const handleClearCart = () => {
  setModalInfo({
    show: true,
    title: 'Clear Cart',
    body: 'Are you sure you want to remove all items from your cart?',
    onOk: async () => {
      try {
        await axios.delete(`/api/cart/clear/${userId}`);
        fetchCart(); // refresh UI
      } catch (err) {
        console.error('❌ Error clearing cart:', err);
      }
    },
  });
};

  const openBuyModal = (product) => {
    setModalInfo({
      show: true,
      title: 'Buy Now',
      body: 'Do you want to customize and buy this product now?',
      onOk: () => {
        setSelectedProduct(product);
        setShowModal(true);
        setSize('');
        setMethod('Home Delivery');
        setDesignFile(null);
        setDesignPreview(null);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setAddress(storedUser?.address || '');
      },
    });
  };

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    if (!size || !designFile || !method || !address) {
      setModalInfo({
        show: true,
        title: 'Missing Fields',
        body: 'Please fill all fields before submitting.',
        onOk: () => {},
      });
      return;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('productId', selectedProduct._id);
    formData.append('size', size);
    formData.append('method', method);
    formData.append('design', designFile);
    formData.append('address', address);

    try {
      if (method === 'Card Payment') {
        const res = await axios.post('/api/orders/create-stripe-session', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: res.data.sessionId });
        return;
      }

      await axios.post('/api/orders/custom', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await axios.delete(`/api/cart/item/${selectedProduct._id}/${userId}`);

      setModalInfo({
        show: true,
        title: 'Order Placed',
        body: '✅ Order placed successfully!',
        onOk: () => {
          setShowModal(false);
          fetchCart();
          navigate('/orders');
        }
      });
    } catch (err) {
      console.error('❌ Error placing order:', err);
      setModalInfo({
        show: true,
        title: 'Order Failed',
        body: '❌ Failed to place the order.',
        onOk: () => {},
      });
    }
  };

  useEffect(() => {
    if (!userId) {
      setModalInfo({
        show: true,
        title: 'Login Required',
        body: 'Please login to view your cart.',
        onOk: () => navigate('/login')
      });
    } else {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser?.address) setAddress(storedUser.address);
      fetchCart();
    }
  }, [userId]);

  return (
    <Container className="py-4">
     <div className="d-flex justify-content-between align-items-center mb-3">
  <Button variant="outline-dark" onClick={() => setShowMenu(true)}>
    ☰ My Menu
  </Button>

  <Button
    className="fw-semibold"
    onClick={handleClearCart}
    style={{
      backgroundColor: '#d90429',
      border: 'none',
      padding: '8px 18px',
      fontSize: '0.95rem',
      borderRadius: '6px',
      color: '#fff',
    }}
  >
    🗑️ Clear All
  </Button>
</div>


      <h2 className="text-center fw-bold mb-4">🛒 Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <>
          <Row>
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <Col key={item._id} sm={6} md={4} lg={3} className="mb-4">
                  <Card className="h-100 shadow-sm border-0 product-card">
                    <Card.Img
                      variant="top"
                      src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                      className="product-img"
                    />
                    <Card.Body className="d-flex flex-column justify-content-between p-3">
                      <div>
                        <Card.Title className="fw-semibold mb-1" style={{ color: '#393E46', fontSize: '1.1rem' }}>
                          {product.name}
                        </Card.Title>
                        <Card.Text className="fw-bold mb-1" style={{ color: '#d90429' }}>
                          ₹{product.price}
                        </Card.Text>
                        <Card.Text className="mb-2" style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                          {product.description}
                        </Card.Text>
                        {item.createdAt && (
                          <Card.Text className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                            <strong>Added on:</strong>{' '}
                            {new Date(item.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Card.Text>
                        )}
                      </div>

                      <div className="d-flex mt-3 justify-content-between align-items-center gap-2 flex-nowrap">
                        <Button
                          onClick={() => handleRemove(product._id)}
                          className="w-50"
                          style={{
                            backgroundColor: '#929AAB',
                            border: 'none',
                            padding: '0.45rem 1.2rem',
                            fontSize: '0.9rem',
                            borderRadius: '6px',
                          }}
                        >
                          <i className="fas fa-trash-alt me-2" />
                          Remove
                        </Button>
                        <Button
                          onClick={() => openBuyModal(product)}
                          className="w-50"
                          style={{
                            backgroundColor: '#d90429',
                            border: 'none',
                            padding: '0.45rem 1.2rem',
                            fontSize: '0.9rem',
                            borderRadius: '6px',
                          }}
                        >
                          <i className="fas fa-bolt me-2" />
                          Buy Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div className="mt-4 text-end">
            <h5 className="text-danger fw-bold">Total Items: {cartItems.length}</h5>
            <h5 className="text-danger fw-bold">Total Amount: ₹{totalAmount}</h5>
          </div>
        </>
      )}

      {/* Buy Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🛒 Customize & Buy</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBuySubmit} encType="multipart/form-data">
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Size</Form.Label>
              <Form.Select value={size} onChange={(e) => setSize(e.target.value)} required>
                <option value="">Select Size</option>
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Upload Design</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                required
                onChange={(e) => {
                  const file = e.target.files[0];
                  setDesignFile(file);
                  if (file) setDesignPreview(URL.createObjectURL(file));
                }}
              />
            </Form.Group>

            {selectedProduct && (
  <div className="mb-3 text-center">
    <p className="mb-1 fw-semibold">🖼️ Mockup Preview</p>
    <div className="mockup-container position-relative mx-auto">
      <img
        src={selectedProduct.image}
        alt="Product"
        className="mockup-product"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
        }}
      />
      {designPreview && (
        <img
          src={designPreview}
          alt="Design Overlay"
          className="mockup-design"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            objectFit: 'contain',
            opacity: 1,
            mixBlendMode: 'normal',
            backgroundColor: 'transparent',
            imageRendering: 'auto',
            zIndex: 2,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 0 4px rgba(0,0,0,0.2)',
          }}
        />
      )}
    </div>
  </div>
)}


            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Shipping Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Delivery Method</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  label="Cash on Delivery"
                  name="method"
                  value="Home Delivery"
                  checked={method === 'Home Delivery'}
                  onChange={(e) => setMethod(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  label="Stripe Payment"
                  name="method"
                  value="Card Payment"
                  checked={method === 'Card Payment'}
                  onChange={(e) => setMethod(e.target.value)}
                />
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" style={{ backgroundColor: '#d90429', border: 'none' }}>Submit Order</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Global Custom Modal */}
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
        }}
      />
      <Offcanvas
  show={showMenu}
  onHide={() => setShowMenu(false)}
  placement="start"
  style={{
    backgroundColor: '#fff',
    color: '#0d1b2a',
    fontFamily: 'Outfit, sans-serif',
  }}
>
  <Offcanvas.Header closeButton>
    <Offcanvas.Title style={{ fontWeight: 'bold', fontSize: '20px' }}>
      ☰ My Menu
    </Offcanvas.Title>
  </Offcanvas.Header>
  <Offcanvas.Body>
    <Button
      variant="outline-danger"
      className="w-100 mb-3 text-start"
      style={{
        padding: '12px 20px',
        fontSize: '16px',
        borderRadius: '10px',
      }}
      onClick={() => {
        navigate('/dashboard');
        setShowMenu(false);
      }}
    >
      👤 Profile
    </Button>

    <Button
      variant="outline-danger"
      className="w-100 mb-3 text-start"
      style={{
        padding: '12px 20px',
        fontSize: '16px',
        borderRadius: '10px',
      }}
      onClick={() => {
        navigate('/cart');
        setShowMenu(false);
      }}
    >
      🛒 Cart
    </Button>

    <Button
      variant="outline-danger"
      className="w-100 text-start"
      style={{
        padding: '12px 20px',
        fontSize: '16px',
        borderRadius: '10px',
      }}
      onClick={() => {
        navigate('/orders');
        setShowMenu(false);
      }}
    >
      📦 Orders
    </Button>
  </Offcanvas.Body>
</Offcanvas>

    </Container>
  );
};

export default Cart;
