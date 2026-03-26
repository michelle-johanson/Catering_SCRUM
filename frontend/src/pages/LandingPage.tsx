import { Navigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../api/loginService';
import '../styles/prelanding.css';

function LandingPage() {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="prelanding-container">

      {/* Navbar */}
      <div className="landing-navbar">
        <div className="nav-left">
          Catering Management
        </div>

        <div className="nav-right">
          <Link to="/login" className="btn btn-outline-light me-2">
            Login
          </Link>
          <Link to="/register" className="btn btn-light">
            Register
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero text-center">
        <div className="hero-content text-white">
          <h1 className="display-3 fw-bold">
            Effortless Catering for Every Occasion
          </h1>
          <p className="mt-3 mb-4">
            Plan, customize, and manage your events — all in one place.
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div className="container text-center py-5">
        <h2 className="fw-bold mb-5">What We Offer</h2>

        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="offer-card p-4">
              <h4>Weddings</h4>
              <p>Elegant catering for your special day.</p>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="offer-card p-4">
              <h4>Corporate Events</h4>
              <p>Professional catering for business occasions.</p>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="offer-card p-4">
              <h4>Private Parties</h4>
              <p>Custom menus for unforgettable gatherings.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default LandingPage;
