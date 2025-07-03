// ✅ ProductCard.jsx — Fully updated to handle pending login actions
import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import CustomModal from './CustomModal';
import './ProductCard.css';

const stripePromise = loadStripe('pk_test_51RflLWRnB0shCfGSAQM4e9kS3pDD8w4DqSMyRrea4jOtuVkho5UuDOukJM2NecCgLRZ48u17z09ArGrD5BFsJYTg00uSbHwuE3');

const ProductCard = ({ title, price, image, description, productId }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ show: false, title: '', body: '', onOk: null, onCancel: null });

  const [size, setSize] = useState('');
  const [method, setMethod] = useState('Home Delivery');
  const [designFile, setDesignFile] = useState(null);
  const [designPreview, setDesignPreview] = useState(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (user?.address) {
      setAddress(user.address);
    }

    // Auto open BuyNow if redirected after login
    const openBuyNow = JSON.parse(localStorage.getItem('openBuyNow'));
    if (openBuyNow && openBuyNow.productId === productId) {
      setShowBuyModal(true);
      localStorage.removeItem('openBuyNow');
    }
  }, [user, productId]);

  const handleAddToCart = () => {
    if (!userId) {
      localStorage.setItem('pendingAction', JSON.stringify({ type: 'addToCart', productId }));
      setModalInfo({
        show: true,
        title: 'Login Required',
        body: 'Please login to add this product to your cart.',
        onOk: () => navigate('/login'),
        onCancel: () => navigate('/'),
      });
      return;
    }

    setModalInfo({
      show: true,
      title: 'Confirm Add to Cart',
      body: 'Do you want to add this item to your cart?',
      onOk: async () => {
        try {
          const res = await axios.post('/api/cart/add', { userId, productId });

          if (res.data.message === 'Already in cart') {
            setModalInfo({
              show: true,
              title: 'Already in Cart',
              body: 'This product is already in your cart.',
              onOk: () => navigate('/cart'),
            });
          } else {
            setModalInfo({
              show: true,
              title: 'Added to Cart',
              body: '✅ Product added successfully.',
              onOk: () => navigate('/cart'),
            });
          }
        } catch (err) {
          console.error(err);
          setModalInfo({
            show: true,
            title: 'Error',
            body: '❌ Failed to add to cart.',
            onOk: () => {},
          });
        }
      },
      onCancel: () => {},
    });
  };

  const handleBuyNow = () => {
    if (!userId) {
      localStorage.setItem('pendingAction', JSON.stringify({ type: 'buyNow', productId }));
      setModalInfo({
        show: true,
        title: 'Login Required',
        body: 'Please login to place your order.',
        onOk: () => navigate('/login'),
        onCancel: () => navigate('/'),
      });
      return;
    }

    setModalInfo({
      show: true,
      title: 'Buy Now',
      body: 'Do you want to customize and buy this product?',
      onOk: () => {
        setShowBuyModal(true);
        setSize('');
        setMethod('Home Delivery');
        setDesignFile(null);
        setDesignPreview(null);
        setAddress(user?.address || '');
      },
      onCancel: () => {},
    });
  };

  const handleBuySubmit = async (e) => {
    e.preventDefault();

    if (!size || !designFile || !method || !address) {
      setModalInfo({
        show: true,
        title: 'Missing Fields',
        body: 'Please fill in all required fields.',
        onOk: () => {},
      });
      return;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('productId', productId);
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
        setModalInfo({
          show: true,
          title: 'Stripe Error',
          body: '❌ Failed to proceed to payment.',
          onOk: () => {},
        });
      }
      return;
    }

    try {
      await axios.post('/api/orders/custom', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setModalInfo({
        show: true,
        title: 'Success',
        body: '✅ Your order has been placed!',
        onOk: () => {
          setShowBuyModal(false);
          navigate('/orders');
        },
      });
    } catch (err) {
      setModalInfo({
        show: true,
        title: 'Order Failed',
        body: '❌ Could not place your order.',
        onOk: () => {},
      });
    }
  };

  return (
    <>
      <Card className="product-card h-100 border-0 shadow-sm">
        <Card.Img variant="top" src={image} alt={title} className="product-img" />
        <Card.Body className="d-flex flex-column justify-content-between p-3">
          <div>
            <Card.Title className="fw-semibold" style={{ fontSize: '1.05rem', color: '#393E46' }}>{title}</Card.Title>
            <Card.Text className="fw-bold" style={{ color: '#d90429' }}>{price}</Card.Text>
            {description && <Card.Text style={{ fontSize: '0.9rem', color: '#6c757d' }}>{description}</Card.Text>}
          </div>
          <div className="d-flex justify-content-between mt-3 flex-wrap gap-2">
            <Button className="product-button-outline" onClick={handleAddToCart}><i className="fas fa-cart-plus me-2" /> Add</Button>
            <Button className="product-button-buy" onClick={handleBuyNow}><i className="fas fa-bolt me-2" /> Buy</Button>
          </div>
        </Card.Body>
      </Card>

      {/* Buy Now Modal */}
      <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)} centered>
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
  <p className="mb-1 fw-semibold">🖼️ Mockup Preview</p>
  <div className="mockup-container position-relative mx-auto">
    <img
      src={image}
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
          width: '60px',
          height: '60px',
          transform: 'translate(-50%, -50%)',
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
            <Button variant="secondary" onClick={() => setShowBuyModal(false)}>Cancel</Button>
            <Button type="submit" style={{ backgroundColor: '#d90429', border: 'none' }}>Submit Order</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Alert Modal */}
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
    </>
  );
};

export default ProductCard;
