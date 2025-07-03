import React from 'react';
import { Navbar, Nav, Container, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const AppNavbar = () => {
  const navigate = useNavigate();

  // Get user from localStorage
  const user = (() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored || stored === 'undefined') return null;
      return JSON.parse(stored);
    } catch (err) {
      console.error('❌ Failed to parse user from localStorage:', err);
      return null;
    }
  })();

  // Check if user is admin
  const isAdmin = user && (user.role === 'admin' || user.isAdmin === true);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Navbar
      expand="lg"
      className="shadow-sm"
      style={{
        backgroundColor: '#F7F7F7',
        fontFamily: 'Outfit, sans-serif',
        borderBottom: '1px solid #EEEEEE',
      }}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="fw-bold fs-3"
          style={{ color: '#393E46' }}
        >
          <i className="fas fa-palette me-2 text-dark" />
          Print<span style={{ color: '#929AAB' }}>Peak</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">

            {/* Home */}
            <Nav.Link
              as={Link}
              to="/"
              style={{ color: '#393E46' }}
              className="mx-2"
            >
              <i className="fas fa-home me-2" />
              Home
            </Nav.Link>

            {/* Products */}
            <Nav.Link
              as={Link}
              to="/products"
              style={{ color: '#393E46' }}
              className="mx-2"
            >
              <i className="fas fa-tshirt me-2" />
              Products
            </Nav.Link>

            {/* Conditional Auth Links */}
            {!user ? (
              <>
                {/* Register */}
                <Nav.Link
                  as={Link}
                  to="/register"
                  style={{ color: '#393E46' }}
                  className="mx-2"
                >
                  <i className="fas fa-user-plus me-2" />
                  Register
                </Nav.Link>

                {/* Login */}
                <Nav.Link
                  as={Link}
                  to="/login"
                  style={{ color: '#393E46' }}
                  className="mx-2"
                >
                  <i className="fas fa-sign-in-alt me-2" />
                  Login
                </Nav.Link>
              </>
            ) : (
              <>
                {/* Profile (admin → /admin, user → /dashboard) */}
                <Nav.Link
                  as={Link}
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="mx-2 d-flex align-items-center"
                  style={{ color: '#393E46' }}
                >
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      roundedCircle
                      width={30}
                      height={30}
                      className="me-2"
                      alt="profile"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <i className="fas fa-user-circle me-2 fs-5" />
                  )}
                  {user.name}
                </Nav.Link>

                {/* Logout */}
                <Nav.Link
                  onClick={handleLogout}
                  className="mx-2"
                  style={{ color: '#d90429', cursor: 'pointer' }}
                >
                  <i className="fas fa-sign-out-alt me-2" />
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
