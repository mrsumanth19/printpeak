import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import CustomModal from '../components/CustomModal';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [actionSuccessModal, setActionSuccessModal] = useState({
    show: false,
    title: '',
    body: '',
    redirectTo: '',
  });

  const navigate = useNavigate();
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userId', data.user._id);

      const pending = JSON.parse(localStorage.getItem('pendingAction'));

      if (pending) {
        if (pending.type === 'addToCart') {
          setShowCartModal(true);
        } else if (pending.type === 'buyNow') {
          setShowBuyNowModal(true);
        }
      } else {
        setShowSuccessModal(true);
      }
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
    }
  };

  const handleCartOk = async () => {
    const pending = JSON.parse(localStorage.getItem('pendingAction'));
    try {
      await axios.post('/api/cart/add', {
        userId: JSON.parse(localStorage.getItem('user'))._id,
        productId: pending.productId,
      });
      localStorage.removeItem('pendingAction');
      setShowCartModal(false);
      setActionSuccessModal({
        show: true,
        title: '✅ Added to Cart',
        body: 'Product successfully added to your cart.',
        redirectTo: '/cart',
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add to cart');
    }
  };

  const handleBuyNowOk = () => {
    const pending = JSON.parse(localStorage.getItem('pendingAction'));
    localStorage.setItem('openBuyNow', JSON.stringify(pending));
    localStorage.removeItem('pendingAction');
    setShowBuyNowModal(false);
    setActionSuccessModal({
      show: true,
      title: '✅ Proceeding to Order',
      body: 'You will now be redirected to complete your order.',
      redirectTo: '/',
    });
  };

  const handleLoginSuccessOk = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <Container
        className="py-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 0 15px rgba(0,0,0,0.1)',
          }}
        >
          <h2 className="fw-bold text-center mb-2" style={{ color: '#d90429' }}>
            Welcome Back
          </h2>
          <p className="text-center text-muted mb-4">Login to continue your journey</p>

          {err && <Alert variant="danger">{err}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label style={{ color: '#393E46' }}>Email address</Form.Label>
              <div className="custom-input-group d-flex align-items-center border rounded px-2">
                <span className="me-2">
                  <FaEnvelope />
                </span>
                <Form.Control
                  type="email"
                  required
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-0 shadow-none"
                />
              </div>
            </Form.Group>

            <Form.Group controlId="password" className="mb-4">
              <Form.Label style={{ color: '#393E46' }}>Password</Form.Label>
              <div className="custom-input-group d-flex align-items-center border rounded px-2">
                <span className="me-2">
                  <FaLock />
                </span>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-0 shadow-none"
                />
                <button
                  type="button"
                  className="btn btn-sm border-0 bg-transparent ms-auto"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </Form.Group>

            <Button
              type="submit"
              disabled={!isFormValid}
              className="w-100 fw-bold mb-3"
              style={{
                backgroundColor: '#d90429',
                border: 'none',
                opacity: isFormValid ? 1 : 0.6,
              }}
            >
              Login
            </Button>

            <div className="text-center">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: '#d90429' }}>
                Register
              </Link>
            </div>
          </Form>
        </div>
      </Container>

      {/* 🔁 Modal for Add to Cart After Login */}
      <CustomModal
        show={showCartModal}
        title="✅ Login Successful"
        body="Do you want to add this product to your cart?"
        onCancel={() => {
          setShowCartModal(false);
          navigate('/dashboard');
        }}
        onConfirm={handleCartOk}
        confirmText="OK"
        cancelText="Cancel"
      />

      {/* 🔁 Modal for Buy Now After Login */}
      <CustomModal
        show={showBuyNowModal}
        title="✅ Login Successful"
        body="Do you want to proceed with your order?"
        onCancel={() => {
          setShowBuyNowModal(false);
          navigate('/dashboard');
        }}
        onConfirm={handleBuyNowOk}
        confirmText="OK"
        cancelText="Cancel"
      />

      {/* ✅ General Login Success */}
      <CustomModal
        show={showSuccessModal}
        title="✅ Login Successful"
        body="Welcome back! You’ve successfully logged in."
        onCancel={() => setShowSuccessModal(false)}
        onConfirm={handleLoginSuccessOk}
        confirmText="OK"
        cancelText="Cancel"
      />

      {/* 🎉 Final Success after Action */}
      <CustomModal
        show={actionSuccessModal.show}
        title={actionSuccessModal.title}
        body={actionSuccessModal.body}
        onConfirm={() => {
          setActionSuccessModal({ ...actionSuccessModal, show: false });
          navigate(actionSuccessModal.redirectTo);
        }}
        onCancel={() => {
          setActionSuccessModal({ ...actionSuccessModal, show: false });
          navigate('/dashboard');
        }}
        confirmText="OK"
        cancelText="Cancel"
      />
    </>
  );
};

export default Login;
