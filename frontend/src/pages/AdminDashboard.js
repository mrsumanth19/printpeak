import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import CustomModal from '../components/CustomModal'; // Adjust the path if needed

import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Image,
  Badge,
  Offcanvas,
  Modal,
  Spinner
} from 'react-bootstrap';

const colors = {
  background: '#F7F7F7',
  cardBg: '#EEEEEE',
  textDark: '#393E46',
  textMuted: '#929AAB',
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('profile'); // Default to profile section
  const [product, setProduct] = useState({ name: '', price: '', description: '', image: null, _id: null });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const token = localStorage.getItem('token');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
const [successMessage, setSuccessMessage] = useState('');


  // Profile state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Stats state
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalCarts, setTotalCarts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalAdminOrders, setTotalAdminOrders] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState(null);

  // Fetch all data on component mount
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

    const fetchAllData = async () => {
      try {
        // Fetch user stats
        const ordersRes = await axios.get(`/api/orders/user/${parsedUser._id}`);
        const orders = ordersRes.data || [];
        setTotalOrders(orders.length);
        const spent = orders.reduce((sum, order) => sum + (order.product?.price || 0), 0);
        setTotalSpent(spent);

        const cartRes = await axios.get(`/api/cart/user/${parsedUser._id}`);
        setTotalCarts(cartRes.data?.length || 0);

        // Fetch admin data
        const productsRes = await axios.get('/api/products');
        setProducts(productsRes.data);
        setTotalProducts(productsRes.data.length);

        const usersRes = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersRes.data);
        setTotalUsers(usersRes.data.length);

        const adminOrdersRes = await axios.get('/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(adminOrdersRes.data);
        setTotalAdminOrders(adminOrdersRes.data.length);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

  const membershipDate = user
    ? new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const showConfirmation = (message, callback) => {
    setModalMessage(message);
    setOnConfirm(() => callback);
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  // Product Functions
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
      setTotalProducts(res.data.length);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    }
  };

  const handleProductChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setProduct({ ...product, image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

 const handleProductSubmit = async (e) => {
  e.preventDefault();
  setUploading(true);

  const formData = new FormData();
  formData.append('name', product.name);
  formData.append('price', product.price);
  formData.append('description', product.description);
  if (product.image) formData.append('image', product.image);

  try {
    if (product._id) {
      await axios.put(`/api/products/${product._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMessage('✅ Product updated successfully!');
    } else {
      if (!product.image) {
        setSuccessMessage('⚠️ Please upload a product image!');
        return;
      }
      await axios.post('/api/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMessage('✅ Product added successfully!');
    }
    resetProductForm();
    fetchProducts();
  } catch (error) {
    setSuccessMessage(`❌ ${error.response?.data?.message || 'Failed to save product'}`);
  } finally {
    setShowSuccessModal(true);
    setUploading(false);
  }
};


  const resetProductForm = () => {
    setProduct({ name: '', price: '', description: '', image: null, _id: null });
    setPreview(null);
  };

  const handleEditProduct = (prod) => {
    setProduct({ 
      name: prod.name, 
      price: prod.price, 
      description: prod.description, 
      image: null, 
      _id: prod._id 
    });
    setPreview(prod.image);
  };

  const handleDeleteProduct = async (id) => {
  try {
    await axios.delete(`/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
    setSuccessMessage('🗑️ Product deleted successfully!');
  } catch (error) {
    setSuccessMessage('❌ Failed to delete product.');
  } finally {
    setShowSuccessModal(true);
  }
};


  const handleDeleteAllProducts = () => {
  showConfirmation('Are you sure you want to delete ALL products?', async () => {
    try {
      await axios.delete('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
      setSuccessMessage('🗑️ All products deleted successfully!');
    } catch (error) {
      setSuccessMessage('❌ Failed to delete all products.');
    } finally {
      setShowSuccessModal(true);
    }
  });
};

  // User Functions
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setTotalUsers(res.data.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    }
  };

  const handleDeleteUser = async (id) => {
  try {
    await axios.delete(`/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
    setSuccessMessage('🗑️ User deleted successfully!');
  } catch (error) {
    setSuccessMessage('❌ Failed to delete user.');
  } finally {
    setShowSuccessModal(true);
  }
};


 const handleDeleteAllUsers = () => {
  showConfirmation('Are you sure you want to delete ALL users?', async () => {
    try {
      await axios.delete('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      setSuccessMessage('🗑️ All users deleted successfully!');
    } catch (error) {
      setSuccessMessage('❌ Failed to delete all users.');
    } finally {
      setShowSuccessModal(true);
    }
  });
};


  // Order Functions
  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
      setTotalAdminOrders(res.data.length);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    }
  };

  const handleOrderStatusChange = async (id, status) => {
    try {
      await axios.put(
        `/api/admin/orders/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

 const handleDeleteOrder = async (id) => {
  try {
    await axios.delete(`/api/admin/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchOrders();
    setSuccessMessage('🗑️ Order deleted successfully!');
  } catch (error) {
    setSuccessMessage('❌ Failed to delete order.');
  } finally {
    setShowSuccessModal(true);
  }
};


  const handleDeleteAllOrders = () => {
  showConfirmation('Are you sure you want to delete ALL orders?', async () => {
    try {
      await axios.delete('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
      setSuccessMessage('🗑️ All orders deleted successfully!');
    } catch (error) {
      setSuccessMessage('❌ Failed to delete all orders.');
    } finally {
      setShowSuccessModal(true);
    }
  });
};

  // Profile functions
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
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    setShowEditModal(false);
    setProfileImage(null);
    setPreviewImage(data.user.profileImage || null);
    setSuccessMessage('✅ Profile updated successfully!');
  } catch (err) {
    console.error('Profile update failed:', err);
    setSuccessMessage('❌ Failed to update profile.');
  } finally {
    setShowSuccessModal(true);
  }
};


  const handleChangePassword = async () => {
    try {
      const { data } = await axios.put(`/api/auth/change-password/${user._id}`, {
        oldPassword,
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordMessage(data.message);
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMessage(err.response?.data?.message || 'Error changing password');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
     case 'products':
  return (
    <>
      {/* Styled Product Form */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto 2rem auto',
          boxShadow: '0 0 15px rgba(0,0,0,0.1)',
        }}
      >
        <h4 className="text-danger fw-bold text-center mb-3">
          {product._id ? 'Update Product' : 'Add New Product'}
        </h4>

        <Form onSubmit={handleProductSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#393E46' }}>Product Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter product name"
              value={product.name}
              onChange={handleProductChange}
              required
              className="border-0"
              style={{ backgroundColor: '#f8f9fa' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#393E46' }}>Price (₹)</Form.Label>
            <Form.Control
              type="number"
              name="price"
              placeholder="Enter price"
              value={product.price}
              onChange={handleProductChange}
              required
              className="border-0"
              style={{ backgroundColor: '#f8f9fa' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#393E46' }}>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              rows={3}
              placeholder="Write a detailed description"
              value={product.description}
              onChange={handleProductChange}
              required
              className="border-0"
              style={{ backgroundColor: '#f8f9fa' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#393E46' }}>Upload Image</Form.Label>
            <Form.Control
              type="file"
              name="image"
              accept="image/*"
              onChange={handleProductChange}
              className="border-0"
            />
          </Form.Group>

          {preview && (
            <div className="mb-3 text-center">
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: '200px', borderRadius: '10px' }}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-100 fw-bold"
            style={{ backgroundColor: '#d90429', border: 'none' }}
            disabled={uploading}
          >
            {uploading ? 'Saving...' : product._id ? 'Update Product' : 'Add Product'}
          </Button>
        </Form>
      </div>

      <div className="d-flex justify-content-end mb-3">
        <Button variant="danger" onClick={handleDeleteAllProducts} style={{ border: 'none' }}>
          Delete All Products
        </Button>
      </div>

      <h5 style={{ color: colors.textDark, marginBottom: '1rem' }}>
        All Products ({totalProducts})
      </h5>

      <Row xs={2} md={4} className="g-4">
        {products.map((prod) => (
          <Col key={prod._id}>
            <Card
              className="h-100"
              style={{ backgroundColor: '#ffffff', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <Card.Img
                variant="top"
                src={prod.image}
                alt={prod.name}
                style={{ width: '100%', height: '250px', objectFit: 'cover', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}
              />
              <Card.Body>
                <Card.Title>{prod.name}</Card.Title>
                <Card.Text>{prod.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>₹{prod.price}</strong>
                  <div>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditProduct(prod)}
                      style={{ border: 'none' }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteProduct(prod._id)}
                      style={{ border: 'none' }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );

     case 'users':
  return (
    <>
     

      <div className="d-flex justify-content-end mb-3">
        <Button
          variant="danger"
          onClick={handleDeleteAllUsers}
          style={{ border: 'none' }}
        >
          Delete All Users
        </Button>
      </div>

      <Row xs={2} md={4} className="g-4">
        {users.map((user) => (
          <Col key={user._id}>
            <Card
              className="d-flex flex-column h-100 shadow-sm"
              style={{
                backgroundColor: '#ffffff', // Changed from colors.cardBg to white
                borderRadius: '12px',
                border: 'none',
              }}
            >
              <Card.Body className="text-center d-flex flex-column align-items-center">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    roundedCircle
                    style={{
                      width: '90px',
                      height: '90px',
                      objectFit: 'cover',
                      marginBottom: '1rem',
                      border: '2px solid #ccc',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '90px',
                      height: '90px',
                      backgroundColor: '#eee',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      color: '#999',
                      marginBottom: '1rem',
                    }}
                  >
                    ?
                  </div>
                )}

                <Card.Title className="mb-2">{user.name}</Card.Title>

                <div className="mb-1 text-muted" style={{ fontSize: '0.95rem' }}>
                  <strong>Email:</strong> {user.email}
                </div>

                <div className="mb-1" style={{ fontSize: '0.95rem' }}>
                  <strong>Admin:</strong>{' '}
                  <span className={`badge ${user.isAdmin ? 'bg-success' : 'bg-secondary'}`}>
                    {user.isAdmin ? 'Yes' : 'No'}
                  </span>
                </div>

                {user.address && (
                  <div className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                    <strong>Address:</strong> {user.address}
                  </div>
                )}
              </Card.Body>

              <Card.Footer
                className="text-center mt-auto"
                style={{ backgroundColor: 'transparent', border: 'none' }}
              >
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteUser(user._id)}
                  disabled={user.isAdmin}
                  style={{
                    border: 'none',
                    width: '80%',
                    fontWeight: 500,
                    padding: '6px 12px',
                  }}
                >
                  Delete User
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );


      case 'orders':
        return (
          <>
        
            <div className="d-flex justify-content-end mb-3">
              <Button variant="danger" onClick={handleDeleteAllOrders} style={{ border: 'none' }}>
                Delete All Orders
              </Button>
            </div>

            <Row xs={2} md={4} className="g-4">
              {orders.map((order) => (
                <Col key={order._id}>
                  <Card style={{ backgroundColor: colors.cardBg, border: 'none' }}>
                    <div style={{ height: '250px', position: 'relative', backgroundColor: '#fff' }}>
                      <img
                        src={order.product?.image}
                        alt="Product"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      {order.designUrl && (
                        <img
                          src={order.designUrl}
                          alt="Design"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '80px',
                            height: '80px',
                            transform: 'translate(-50%, -50%)',
                            objectFit: 'contain'
                          }}
                        />
                      )}
                    </div>
                    <Card.Body>
                      <Card.Title>{order.product?.name}</Card.Title>
                      <Card.Text>
                        <strong>User:</strong> {order.user?.name || 'Guest'}
                      </Card.Text>
                      <Card.Text>
                        <strong>Status:</strong>{' '}
                        <Badge bg={
                          order.status === 'Pending' ? 'warning' :
                          order.status === 'Shipped' ? 'info' :
                          order.status === 'Delivered' ? 'success' : 'secondary'
                        }>
                          {order.status}
                        </Badge>
                      </Card.Text>
                      <Card.Text>
                        <strong>Date:</strong> {new Date(order.date).toLocaleString()}
                      </Card.Text>
                      <Card.Text>
                        <strong>Size:</strong> {order.size || 'N/A'}
                      </Card.Text>
                      <Card.Text>
                        <strong>Quantity:</strong> {order.quantity}
                      </Card.Text>
                      <Card.Text>
                        <strong>Method:</strong> {order.method || 'N/A'}
                      </Card.Text>
                      {order.address && (
                        <Card.Text>
                          <strong>Shipping Address:</strong> {order.address}
                        </Card.Text>
                      )}
                    </Card.Body>
                    <Card.Footer style={{ backgroundColor: 'transparent', border: 'none' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <Form.Select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                          style={{ border: 'none', width: '70%' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </Form.Select>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteOrder(order._id)}
                          style={{ border: 'none' }}
                        >
                          Delete
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        );

     case 'profile':
  return (
    <Row>
      <Col md={6} lg={5} className="mx-auto mb-5">
        <Card
          className="profile-card"
          style={{
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            borderRadius: '16px',
            padding: '30px',
            backgroundColor: '#fff',
          }}
        >
         
          {/* Profile Image */}
          <Row className="mb-3 align-items-center">
            <Col xs={5}><strong>Profile Image:</strong></Col>
            <Col>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: '#eee',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    color: '#999',
                  }}
                >
                  ?
                </div>
              )}
            </Col>
          </Row>

          {/* Info */}
          <Row className="mb-2"><Col xs={5}><strong>Full Name:</strong></Col><Col>{user?.name}</Col></Row>
          <Row className="mb-2"><Col xs={5}><strong>Email:</strong></Col><Col>{user?.email}</Col></Row>
          <Row className="mb-2"><Col xs={5}><strong>Address:</strong></Col><Col>{user?.address || 'N/A'}</Col></Row>
          <Row className="mb-2"><Col xs={5}><strong>Member Since:</strong></Col><Col>{membershipDate}</Col></Row>
          <Row className="mb-4">
            <Col xs={5}><strong>Admin:</strong></Col>
            <Col>
              {user?.isAdmin ? (
                <span className="badge bg-success">Yes</span>
              ) : (
                <span className="badge bg-secondary">No</span>
              )}
            </Col>
          </Row>

          {/* Admin Stats */}
          <h5 className="text-danger mb-3">📊 Admin Stats</h5>
          <Row className="mb-2"><Col xs={5}><strong>Total Users:</strong></Col><Col>{totalUsers}</Col></Row>
          <Row className="mb-2"><Col xs={5}><strong>Total Products:</strong></Col><Col>{totalProducts}</Col></Row>
          <Row><Col xs={5}><strong>Total Orders:</strong></Col><Col>{totalAdminOrders}</Col></Row>

          <div className="text-end mt-4">
            <Button
              variant="outline-danger"
              className="me-2"
              style={{
                padding: '10px 20px',
                fontWeight: 500,
                borderRadius: '10px',
              }}
              onClick={() => setShowEditModal(true)}
            >
              ✏️ Edit Profile
            </Button>
            <Button
              variant="outline-dark"
              style={{
                padding: '10px 20px',
                fontWeight: 500,
                borderRadius: '10px',
              }}
              onClick={() => setShowPasswordModal(true)}
            >
              🔐 Change Password
            </Button>
          </div>
        </Card>
      </Col>
    </Row>
  );


      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <h4>⚠️ Please login to access the admin dashboard.</h4>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading admin dashboard...</p>
      </Container>
    );
  }

  return (
    <Container fluid style={{ backgroundColor: colors.background, minHeight: '100vh', padding: '2rem' }}>
  <Row className="align-items-center mb-4">
    <Col xs={12} md={3} className="text-md-start text-center mb-3 mb-md-0">
      <Button
        onClick={() => setShowMenu(true)}
        className="fw-semibold"
        style={{
          backgroundColor: '#d90429',
          border: 'none',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        ☰ Admin Menu
      </Button>
    </Col>

    <Col xs={12} md={6} className="text-center">
      <h2
        className="fw-bold"
        style={{
          color: '#d90429',
          fontFamily: 'Outfit, sans-serif',
          margin: 0,
        }}
      >
        {activeSection === 'profile' && '👤 Admin Profile'}
        {activeSection === 'users' && `👥 Users (${totalUsers})`}
        {activeSection === 'products' && `🛒 Products (${totalProducts})`}
        {activeSection === 'orders' && `📦 Orders (${totalAdminOrders})`}
      </h2>
    </Col>

    <Col xs={12} md={3} /> {/* Empty right column for spacing */}
  </Row>

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
      ☰ Admin Menu
    </Offcanvas.Title>
  </Offcanvas.Header>

  <Offcanvas.Body>
    <Button
      variant={activeSection === 'profile' ? 'danger' : 'outline-danger'}
      className="w-100 mb-3 text-start"
      style={{
        padding: '12px 20px',
        fontSize: '16px',
        borderRadius: '10px',
        fontWeight: '500',
      }}
      onClick={() => {
        setActiveSection('profile');
        setShowMenu(false);
      }}
    >
      👤 Profile
    </Button>

    <Button
      variant={activeSection === 'users' ? 'danger' : 'outline-danger'}
      className="w-100 mb-3 text-start"
      style={{
        padding: '12px 20px',
        fontSize: '16px',
        borderRadius: '10px',
        fontWeight: '500',
      }}
      onClick={() => {
        setActiveSection('users');
        setShowMenu(false);
      }}
    >
      👥 Users ({totalUsers})
    </Button>

    <Button
      variant={activeSection === 'products' ? 'danger' : 'outline-danger'}
      className="w-100 mb-3 text-start"
      style={{
        padding: '12px 20px',
        fontSize: '16px',
        borderRadius: '10px',
        fontWeight: '500',
      }}
      onClick={() => {
        setActiveSection('products');
        setShowMenu(false);
      }}
    >
      🛒 Products ({totalProducts})
    </Button>

    <Button
      variant={activeSection === 'orders' ? 'danger' : 'outline-danger'}
      className="w-100 text-start"
      style={{
        padding: '12px 20px',
        fontSize: '16px',
        borderRadius: '10px',
        fontWeight: '500',
      }}
      onClick={() => {
        setActiveSection('orders');
        setShowMenu(false);
      }}
    >
      📦 Orders ({totalAdminOrders})
    </Button>
  </Offcanvas.Body>
</Offcanvas>

      {renderSection()}

      {/* Profile Edit Modal */}
   <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered backdrop="static">
  <Modal.Header closeButton className="border-0">
    <Modal.Title className="w-100 text-center fw-bold" style={{ color: '#d90429', fontFamily: 'Outfit, sans-serif' }}>
      ✏️ Edit Profile
    </Modal.Title>
  </Modal.Header>

  <Modal.Body className="px-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>Full Name</Form.Label>
        <Form.Control
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className="border-0 shadow-sm"
          placeholder="Enter your full name"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>Email</Form.Label>
        <Form.Control
          type="email"
          value={editedEmail}
          onChange={(e) => setEditedEmail(e.target.value)}
          className="border-0 shadow-sm"
          placeholder="Enter email address"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>Address</Form.Label>
        <Form.Control
          type="text"
          value={editedAddress}
          onChange={(e) => setEditedAddress(e.target.value)}
          className="border-0 shadow-sm"
          placeholder="Enter address"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>Profile Image</Form.Label>
        <Form.Control type="file" onChange={handleImageChange} className="border-0" />
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

  <Modal.Footer className="d-flex justify-content-center gap-3 border-0 pb-4">
    <Button
      variant="outline-secondary"
      onClick={() => setShowEditModal(false)}
      style={{
        fontFamily: 'Outfit, sans-serif',
        padding: '6px 20px',
        borderRadius: '8px',
        fontWeight: '500',
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleSaveProfile}
      style={{
        fontFamily: 'Outfit, sans-serif',
        backgroundColor: '#d90429',
        border: 'none',
        padding: '6px 20px',
        borderRadius: '8px',
        fontWeight: '500',
      }}
    >
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>


      {/* Password Change Modal */}
    <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered backdrop="static">
  <Modal.Header closeButton className="border-0">
    <Modal.Title className="w-100 text-center fw-bold" style={{ color: '#d90429', fontFamily: 'Outfit, sans-serif' }}>
      🔐 Change Password
    </Modal.Title>
  </Modal.Header>

  <Modal.Body className="px-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>Old Password</Form.Label>
        <Form.Control
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="border-0 shadow-sm"
          placeholder="Enter your current password"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label style={{ color: '#393E46' }}>New Password</Form.Label>
        <Form.Control
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border-0 shadow-sm"
          placeholder="Enter your new password"
        />
      </Form.Group>

      {passwordMessage && (
        <p className="text-danger fw-bold mt-2">{passwordMessage}</p>
      )}
    </Form>
  </Modal.Body>

  <Modal.Footer className="d-flex justify-content-center gap-3 border-0 pb-4">
    <Button
      variant="outline-secondary"
      onClick={() => setShowPasswordModal(false)}
      style={{
        fontFamily: 'Outfit, sans-serif',
        padding: '6px 20px',
        borderRadius: '8px',
        fontWeight: '500',
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleChangePassword}
      style={{
        fontFamily: 'Outfit, sans-serif',
        backgroundColor: '#d90429',
        border: 'none',
        padding: '6px 20px',
        borderRadius: '8px',
        fontWeight: '500',
      }}
    >
      Update
    </Button>
  </Modal.Footer>
</Modal>


      {/* Confirmation Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(0,0,0,0.25)',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              border: 'none'
            }}
          >
            <h5 style={{ marginBottom: '1rem' }}>{modalMessage}</h5>
            <div className="d-flex justify-content-around">
              <Button variant="danger" onClick={handleConfirm} style={{ border: 'none' }}>
                OK
              </Button>
              <Button variant="secondary" onClick={handleCancel} style={{ border: 'none' }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      <CustomModal
  show={showSuccessModal}
  title="Notification"
  body={successMessage}
  onCancel={() => setShowSuccessModal(false)}
  onConfirm={() => setShowSuccessModal(false)}
  confirmText="OK"
  cancelText="Close"
/>

    </Container>
  );
};

export default AdminDashboard;