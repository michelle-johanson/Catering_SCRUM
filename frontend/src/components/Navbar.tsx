import { NavLink, useNavigate } from 'react-router-dom';
import {
  isAuthenticated,
  logoutUser,
  getAuthUsername,
} from '../api/loginService';

function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const username = getAuthUsername();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-light px-3 fixed-top w-100">
      {/* Left side */}
      <div className="navbar-nav me-auto">
        {loggedIn && (
          <NavLink className={navLinkClass} to="/profile">
            {username ?? 'Profile'}
          </NavLink>
        )}
      </div>

      {/* Centered brand */}
      <NavLink
        className="navbar-brand navbar-brand-center"
        to={loggedIn ? '/dashboard' : '/'}
      >
        Catering Management
      </NavLink>

      {/* Right side */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navMenu"
        aria-controls="navMenu"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="navMenu">
        <div className="navbar-nav ms-auto align-items-center gap-1">
          {loggedIn ? (
            <>
              <NavLink className={navLinkClass} to="/dashboard">
                Dashboard
              </NavLink>
              <NavLink className={navLinkClass} to="/events">
                Events
              </NavLink>
              <NavLink className={navLinkClass} to="/tasks">
                Tasks
              </NavLink>
              <NavLink className={navLinkClass} to="/menus">
                Menus
              </NavLink>
              <NavLink className={navLinkClass} to="/analytics">
                Analytics
              </NavLink>
              <NavLink className={navLinkClass} to="/staff">
                Staff
              </NavLink>
              <button
                className="btn btn-sm nav-logout-btn ms-2"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink className={navLinkClass} to="/login">
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
