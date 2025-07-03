import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Spinner,
  Form,
  Modal,
  Offcanvas,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CustomModal from '../components/CustomModal';
import './Dashboard.css';


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalCarts, setTotalCarts] = useState(0);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successBody, setSuccessBody] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || storedUser === 'undefined') {
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setEditedName(parsedUser.name);
    setEditedEmail(parsedUser.email);
    setEditedAddress(parsedUser.address || '');
    setPreviewImage(parsedUser.profileImage || null);

    const fetchStats = async () => {
      try {
        const ordersRes = await axios.get(`/api/orders/user/${parsedUser._id}`);
        const orders = ordersRes.data || [];
        setTotalOrders(orders.length);
        const spent = orders.reduce((sum, order) => sum + (order.product?.price || 0), 0);
        setTotalSpent(spent);

        const cartRes = await axios.get(`/api/cart/user/${parsedUser._id}`);
        setTotalCarts(cartRes.data?.length || 0);

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const membershipDate = user
    ? new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editedName);
      formData.append('email', editedEmail);
      formData.append('address', editedAddress);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const { data } = await axios.put(`/api/auth/update/${user._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setShowEditModal(false);
      setProfileImage(null);
      setPreviewImage(data.user.profileImage || null);
      setSuccessTitle('✅ Profile Updated');
      setSuccessBody('Your profile information has been successfully updated.');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Profile update failed:', err);
      setSuccessTitle('❌ Update Failed');
      setSuccessBody('There was a problem updating your profile. Please try again.');
      setShowSuccessModal(true);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { data } = await axios.put(`/api/auth/change-password/${user._id}`, {
        oldPassword,
        newPassword,
      });
      setPasswordMessage(data.message);
      setOldPassword('');
      setNewPassword('');
      setShowPasswordModal(false);
      setSuccessTitle('✅ Password Changed');
      setSuccessBody('Your password has been successfully updated.');
      setShowSuccessModal(true);
    } catch (err) {
      setPasswordMessage(err.response?.data?.message || 'Error changing password');
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <h4>⚠️ Please login to access your dashboard.</h4>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <p className="mt-3">Loading dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <Row className="mb-4">
        <Col xs="auto">
          <Button variant="outline-dark" onClick={() => setShowMenu(true)}>
            ☰ My Menu
          </Button>
        </Col>
        <Col className="text-center">
          <h2 className="text-danger fw-bold">👤 My Profile</h2>
        </Col>
        <Col xs="auto" />
      </Row>

      <Row>
        <Col md={6} lg={5} className="mx-auto mb-5">
     <Card className="profile-card" style={{
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  border: '2px solid #e9ecef', // Thicker border for better visibility
  overflow: 'hidden',
  position: 'relative',
  maxWidth: '600px',
  margin: '0 auto'
}}>
  
  {/* Red accent bar at top - inside the border */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '6px',
    background: 'linear-gradient(90deg, #d90429, #ef233c)'
  }}></div>

  <Card.Body style={{ padding: '25px' }}>
    
    {/* Profile header with image */}
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        margin: '0 auto 15px',
        border: '3px solid #fff',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa'
      }}>
        {previewImage ? (
          <img 
            src={previewImage} 
            alt="Profile" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#adb5bd',
            fontSize: '32px'
          }}>
            <i className="bi bi-person"></i>
          </div>
        )}
      </div>
    </div>

    {/* Profile details */}
    <div style={{ marginBottom: '20px' }}>
      {[
        { label: 'Full Name', value: user.name },
        { label: 'Email', value: user.email },
        { label: 'Address', value: user.address || 'N/A' },
        { label: 'Member Since', value: membershipDate }
      ].map((item, index) => (
        <div key={index} style={{
          display: 'flex',
          padding: '10px 0',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          fontSize: '0.95rem'
        }}>
          <div style={{ 
            fontWeight: '600',
            color: '#393E46',
            minWidth: '110px'
          }}>{item.label}:</div>
          <div style={{ color: '#6c757d' }}>{item.value}</div>
        </div>
      ))}
    </div>

    {/* Stats section */}
    <div style={{
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '20px',
      border: '1px solid #e9ecef' // Added border to stats section too
    }}>
      <h5 style={{ 
        color: '#d90429',
        fontWeight: '600',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '1.1rem'
      }}>
        <i className="bi bi-graph-up"></i>
        <span>Account Stats</span>
      </h5>
      
      {[
        { label: 'Total Orders', value: totalOrders },
        { label: 'Cart Items', value: totalCarts },
        { label: 'Total Spent', value: `₹${totalSpent}` }
      ].map((item, index) => (
        <div key={index} style={{
          display: 'flex',
          padding: '6px 0',
          fontSize: '0.9rem'
        }}>
          <div style={{ 
            fontWeight: '500',
            color: '#393E46',
            minWidth: '110px'
          }}>{item.label}:</div>
          <div style={{ color: '#6c757d' }}>{item.value}</div>
        </div>
      ))}
    </div>

    {/* Action buttons */}
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '12px'
    }}>
      <Button 
        variant="outline-danger" 
        onClick={() => setShowEditModal(true)}
        style={{ 
          padding: '6px 16px',
          borderRadius: '6px',
          fontWeight: '500',
          fontSize: '0.9rem',
          border: '1px solid #d90429' // Added border to button
        }}
      >
        <i className="bi bi-pencil me-1"></i>
        Edit Profile
      </Button>
      <Button 
        variant="danger" 
        onClick={() => setShowPasswordModal(true)}
        style={{ 
          padding: '6px 16px',
          borderRadius: '6px',
          fontWeight: '500',
          fontSize: '0.9rem',
          border: '1px solid transparent' // Ensures consistent sizing
        }}
      >
        <i className="bi bi-lock me-1"></i>
        Change Password
      </Button>
    </div>
  </Card.Body>
</Card>
        </Col>
      </Row>

      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title className="w-100 text-center fw-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#212529' }}>
      🔐 Change Password
    </Modal.Title>
  </Modal.Header>
  <Modal.Body style={{ fontFamily: 'Outfit, sans-serif' }}>
    <Form>
      {/* Old Password */}
      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>Old Password</Form.Label>
        <div className="custom-input-group">
          <span className="input-icon"><i className="bi bi-lock"></i></span>
          <Form.Control
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="border-0"
            placeholder="Enter old password"
          />
        </div>
      </Form.Group>

      {/* New Password */}
      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>New Password</Form.Label>
        <div className="custom-input-group">
          <span className="input-icon"><i className="bi bi-lock-fill"></i></span>
          <Form.Control
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border-0"
            placeholder="Enter new password"
          />
        </div>
      </Form.Group>

      {passwordMessage && (
        <div className="text-center">
          <p className="text-danger fw-bold">{passwordMessage}</p>
        </div>
      )}
    </Form>
  </Modal.Body>
  <Modal.Footer className="justify-content-center border-0 pb-4">
    <Button variant="outline-secondary" onClick={() => setShowPasswordModal(false)} style={{ padding: '6px 20px' }}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleChangePassword} style={{ padding: '6px 20px' }}>
      Update
    </Button>
  </Modal.Footer>
</Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title className="w-100 text-center fw-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#212529' }}>
      ✏️ Edit Profile
    </Modal.Title>
  </Modal.Header>
  <Modal.Body style={{ fontFamily: 'Outfit, sans-serif' }}>
    <Form>
      {/* Full Name */}
      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>Full Name</Form.Label>
        <div className="custom-input-group">
          <span className="input-icon"><i className="bi bi-person"></i></span>
          <Form.Control
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="border-0"
            placeholder="Enter full name"
          />
        </div>
      </Form.Group>

      {/* Email */}
      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>Email Address</Form.Label>
        <div className="custom-input-group">
          <span className="input-icon"><i className="bi bi-envelope"></i></span>
          <Form.Control
            type="email"
            value={editedEmail}
            onChange={(e) => setEditedEmail(e.target.value)}
            className="border-0"
            placeholder="Enter email"
          />
        </div>
      </Form.Group>

      {/* Address */}
      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>Address</Form.Label>
        <div className="custom-input-group">
          <span className="input-icon"><i className="bi bi-geo-alt"></i></span>
          <Form.Control
            type="text"
            value={editedAddress}
            onChange={(e) => setEditedAddress(e.target.value)}
            className="border-0"
            placeholder="Enter address"
          />
        </div>
      </Form.Group>

      {/* Profile Image */}
      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>Profile Image</Form.Label>
        <Form.Control type="file" onChange={handleImageChange} />
        {previewImage && (
          <div className="text-center mt-3">
            <img
              src={previewImage}
              alt="Preview"
              className="rounded-circle"
              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
            />
          </div>
        )}
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer className="justify-content-center border-0 pb-4">
    <Button variant="outline-secondary" onClick={() => setShowEditModal(false)} style={{ padding: '6px 20px' }}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleSaveProfile} style={{ padding: '6px 20px' }}>
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>


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
      <CustomModal
        show={showSuccessModal}
        title={successTitle}
        body={successBody}
        onCancel={handleSuccessConfirm}
        onConfirm={handleSuccessConfirm}
        confirmText="OK"
        cancelText=""
      />
    </Container>

  );
};

export default Dashboard;