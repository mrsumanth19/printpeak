// src/pages/Register.jsx
import React, { useState } from 'react';
import {
  Form,
  Button,
  Container,
  Alert,
} from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import CustomModal from '../components/CustomModal'; // ✅ Import CustomModal
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const isLengthValid = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const passwordsMatch = password === confirm;
  const isFormValid = isLengthValid && hasUppercase && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setErr('Please meet all password requirements.');
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setShowSuccessModal(true); // ✅ Show success modal instead of redirecting immediately
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      setErr(msg);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate('/dashboard');
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
            Create your account
          </h2>
          <p className="text-center text-muted mb-4">
            Join us for an exclusive shopping experience
          </p>

          {err && <Alert variant="danger">{err}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Name */}
            <Form.Group controlId="name" className="mb-3">
              <Form.Label style={{ color: '#393E46' }}>Full Name</Form.Label>
              <div className="custom-input-group">
                <span className="input-icon">
                  <FaUser />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-0"
                />
              </div>
            </Form.Group>

            {/* Email */}
            <Form.Group controlId="email" className="mb-3">
              <Form.Label style={{ color: '#393E46' }}>Email Address</Form.Label>
              <div className="custom-input-group">
                <span className="input-icon">
                  <FaEnvelope />
                </span>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-0"
                />
              </div>
            </Form.Group>

            {/* Password */}
            <Form.Group controlId="password" className="mb-3">
              <Form.Label style={{ color: '#393E46' }}>Password</Form.Label>
              <div className="custom-input-group">
                <span className="input-icon">
                  <FaLock />
                </span>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-0"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="mt-2" style={{ fontSize: '0.875rem' }}>
                <div className={isLengthValid ? 'text-success' : 'text-danger'}>
                  • At least 6 characters
                </div>
                <div className={hasUppercase ? 'text-success' : 'text-danger'}>
                  • Contains an uppercase letter
                </div>
              </div>
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group controlId="confirmPassword" className="mb-4">
              <Form.Label style={{ color: '#393E46' }}>Confirm Password</Form.Label>
              <div className="custom-input-group">
                <span className="input-icon">
                  <FaLock />
                </span>
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="border-0"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {confirm.length > 0 && (
                <div
                  className="mt-2"
                  style={{
                    fontSize: '0.875rem',
                    color: passwordsMatch ? 'green' : 'red',
                  }}
                >
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </Form.Group>

            <Button
              type="submit"
              className="w-100 fw-bold mb-3"
              style={{ backgroundColor: '#d90429', border: 'none' }}
              disabled={!isFormValid}
            >
              Create account
            </Button>

            <div className="text-center">
              Already have an account?{' '}
              <Link
                to="/login"
                className="fw-semibold text-decoration-none"
                style={{ color: '#d90429' }}
              >
                Sign in
              </Link>
            </div>
          </Form>
        </div>
      </Container>

      {/* ✅ Custom Success Modal */}
      <CustomModal
        show={showSuccessModal}
        title="✅ Registration Successful"
        body="Welcome! Your account has been created successfully."
        onCancel={() => setShowSuccessModal(false)} // stays on the same page
        onConfirm={handleSuccessConfirm}
        confirmText="OK"
        cancelText="Stay"
      />
    </>
  );
};

export default Register;
