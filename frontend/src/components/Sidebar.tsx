import { NavLink, useNavigate } from 'react-router-dom';
import { isAuthenticated, logoutUser, getAuthUsername } from '../api/loginService';

function Sidebar() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const username = getAuthUsername();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar-link${isActive ? ' active' : ''}`;

  if (!loggedIn) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span>Catering</span>
        <span className="sidebar-brand-accent">Management</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink className={navLinkClass} to="/dashboard">Dashboard</NavLink>
        <NavLink className={navLinkClass} to="/events">Events</NavLink>
        <NavLink className={navLinkClass} to="/tasks">Tasks</NavLink>
        <NavLink className={navLinkClass} to="/menus">Menus</NavLink>
        <NavLink className={navLinkClass} to="/analytics">Analytics</NavLink>
        <NavLink className={navLinkClass} to="/staff">Staff</NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink className={navLinkClass} to="/profile">
          <span className="sidebar-username">{username ?? 'Profile'}</span>
        </NavLink>
        <button className="sidebar-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
