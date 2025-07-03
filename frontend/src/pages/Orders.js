import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Modal,
  Offcanvas,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

const statusSteps = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

const statusColors = {
  Pending: '#ef4444',
  Shipped: '#3b82f6',
  Delivered: '#22c55e',
  Cancelled: '#6b7280',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [previewDesign, setPreviewDesign] = useState('');
  const [productImage, setProductImage] = useState('');
  const [totalSpent, setTotalSpent] = useState(0);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user?._id) {
      alert('⚠️ Please login to view orders.');
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`/api/orders/user/${user._id}`);
        setOrders(res.data);

        let total = 0;
        res.data.forEach(order => {
          const price = order.product?.price || 0;
          const qty = order.quantity || 1;
          total += price * qty;
        });
        setTotalSpent(total);

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          storedUser.totalOrders = res.data.length;
          storedUser.totalSpent = total;
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
      } catch (err) {
        console.error('❌ Error fetching orders:', err);
      }
    };

    fetchOrders();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
      setShowSuccessAlert(true);
      window.history.replaceState({}, document.title, '/orders');
    }
  }, [user, navigate]);

  const openPreviewModal = (designUrl, productImg) => {
    setPreviewDesign(designUrl);
    setProductImage(productImg);
    setShowPreview(true);
  };

  const getStatusIndex = status =>
    statusSteps.findIndex(s => s.toLowerCase() === status.toLowerCase());

  const renderTimeline = (status) => {
    const isCancelled = status.toLowerCase() === 'cancelled';
    const currentIndex = getStatusIndex(status);
    const maxStep = statusSteps.length - 1;

    return (
      <div className="timeline-container">
        <div className="d-flex justify-content-between text-center mb-1">
          {statusSteps.map((step, idx) => {
            const isActive = idx <= currentIndex && !isCancelled;
            const color = statusColors[step] || '#94a3b8';

            return (
              <div
                key={step}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: isCancelled
                      ? step === 'Cancelled'
                        ? statusColors['Cancelled']
                        : '#cbd5e1'
                      : isActive
                      ? color
                      : '#cbd5e1',
                    border: '2px solid',
                    borderColor: isCancelled
                      ? step === 'Cancelled'
                        ? statusColors['Cancelled']
                        : '#94a3b8'
                      : isActive
                      ? color
                      : '#94a3b8',
                    marginBottom: 4,
                  }}
                />
                <small
                  style={{
                    color: isCancelled
                      ? step === 'Cancelled'
                        ? statusColors['Cancelled']
                        : '#64748b'
                      : isActive
                      ? color
                      : '#64748b',
                    textTransform: 'capitalize',
                    fontSize: '0.75rem',
                  }}
                >
                  {step}
                </small>
              </div>
            );
          })}
        </div>

        <div
          style={{
            height: 6,
            backgroundColor: '#cbd5e1',
            borderRadius: 3,
            position: 'relative',
          }}
        >
          {!isCancelled && (
            <div
              style={{
                width: `${(currentIndex / maxStep) * 100}%`,
                height: '100%',
                backgroundColor: statusColors[status] || '#22c55e',
                borderRadius: 3,
                transition: 'width 0.3s ease-in-out',
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Container className="py-4">
      <Button variant="outline-dark" onClick={() => setShowMenu(true)}>
        ☰ My Menu
      </Button>

      <h2 className="fw-bold mb-4 text-center">📦 My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-center">You have no orders yet.</p>
      ) : (
        <>
          <Row>
            {orders.map(order => (
              <Col key={order._id} xs={6} md={3} className="mb-4">
                <Card className="shadow-sm h-100 border-0">
                  <Card.Img variant="top" src={order.product?.image} className="card-img-top" />
                  <Card.Body>
                    <Card.Title className="card-title">{order.product?.name}</Card.Title>
                    <Card.Text className="card-text">
                      <strong>Size:</strong> {order.size || 'N/A'}
                    </Card.Text>
                    <Card.Text className="card-text">
                      <strong>Delivery:</strong> {order.method || 'N/A'}
                    </Card.Text>
                    <Card.Text className="card-text">
                      <strong>Design:</strong>{' '}
                      {order.designUrl ? (
                        <Button
                          variant="link"
                          className="btn-link"
                          onClick={() => openPreviewModal(order.designUrl, order.product?.image)}
                        >
                          View
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </Card.Text>
                    <Card.Text className="card-text">
                      <strong>Address:</strong> {order.address || 'N/A'}
                    </Card.Text>
                    <Card.Text className="card-text">
                      <strong>Cost:</strong> ₹{(order.product?.price || 0) * (order.quantity || 1)}
                    </Card.Text>
                    <Card.Text><strong>Status:</strong></Card.Text>
                    {renderTimeline(order.status)}
                    <Card.Text className="card-text">
                      <strong>Ordered On:</strong>{' '}
                      {new Date(order.date).toLocaleString()}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <h5 className="total-spent mt-4">Total Spent: ₹{totalSpent}</h5>
          <h5 className="total-spent text-end">Total Orders: {orders.length}</h5>
        </>
      )}

      {/* ✅ Success Alert Modal */}
      <Modal show={showSuccessAlert} onHide={() => setShowSuccessAlert(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🎉 Order Placed Successfully!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Thank you for your purchase. Your order has been successfully placed and is being processed.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowSuccessAlert(false)}>
            Awesome!
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 🖼 Design Preview Modal */}
     <Modal show={showPreview} onHide={() => setShowPreview(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>🖼 Mockup Preview</Modal.Title>
  </Modal.Header>

  <Modal.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
    <div className="mockup-container">
      {productImage && (
        <img
          src={productImage}
          alt="T-shirt"
          className="mockup-product"
        />
      )}
      {previewDesign && (
        <img
          src={previewDesign}
          alt="Uploaded Design"
          className="mockup-design"
        />
      )}
    </div>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowPreview(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>


      {/* ☰ My Menu Offcanvas */}
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
            style={{ padding: '12px 20px', fontSize: '16px', borderRadius: '10px' }}
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
            style={{ padding: '12px 20px', fontSize: '16px', borderRadius: '10px' }}
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
            style={{ padding: '12px 20px', fontSize: '16px', borderRadius: '10px' }}
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

export default Orders;
