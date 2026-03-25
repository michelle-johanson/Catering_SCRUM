import { Navigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../api/loginService';

function LandingPage() {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center', maxWidth: '28rem' }}>
        <div className="auth-header">
          <h1>Catering Management</h1>
          <p>Streamline your catering operations — events, menus, and tasks in one place.</p>
        </div>
        <div className="d-flex flex-column gap-3 mt-4">
          <Link to="/login" className="btn btn-primary">
            Log In
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
