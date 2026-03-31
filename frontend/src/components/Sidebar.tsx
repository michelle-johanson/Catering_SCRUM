import { NavLink, useNavigate } from 'react-router-dom';
import { isAuthenticated, logoutUser, getAuthUsername } from '../api/loginService';

interface SidebarProps {
  isMobileNavOpen?: boolean;
  onCloseMobileNav?: () => void;
}

function Sidebar({ isMobileNavOpen, onCloseMobileNav }: SidebarProps) {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const username = getAuthUsername();

  const handleLogout = () => {
    logoutUser();
    if (onCloseMobileNav) onCloseMobileNav();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar-link${isActive ? ' active' : ''}`;

  if (!loggedIn) return null;

  return (
    <aside className={`sidebar${isMobileNavOpen ? ' open' : ''}`}>
      <div className="sidebar-brand">
        <span>Catering</span>
        <span className="sidebar-brand-accent">Management</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink className={navLinkClass} to="/dashboard" onClick={onCloseMobileNav}>Dashboard</NavLink>
        <NavLink className={navLinkClass} to="/events" onClick={onCloseMobileNav}>Events</NavLink>
        <NavLink className={navLinkClass} to="/tasks" onClick={onCloseMobileNav}>Tasks</NavLink>
        <NavLink className={navLinkClass} to="/menus" onClick={onCloseMobileNav}>Menus</NavLink>
        <NavLink className={navLinkClass} to="/analytics" onClick={onCloseMobileNav}>Analytics</NavLink>
        <NavLink className={navLinkClass} to="/staff" onClick={onCloseMobileNav}>Staff</NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink className={navLinkClass} to="/profile" onClick={onCloseMobileNav}>
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
