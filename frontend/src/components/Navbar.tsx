// TODO: Navbar — auth-aware navigation, used in App.tsx replacing the inline nav
//
// Requirements:
// - Read isAuthenticated() on each render to decide which links to show
// - LOGGED OUT state (navbar.css styling):
//     Brand "Catering Management" → /
//     Link: "Login" → /login
//     (Do NOT show Register or any protected page links)
// - LOGGED IN state:
//     Brand → /dashboard
//     Links: Dashboard (/dashboard), Events (/events), Tasks (/tasks),
//             Menus (/menus), Analytics (/analytics)
//     Logout button (btn btn-sm btn-outline-danger or similar):
//       onClick → logoutUser() then navigate('/')
// - Bootstrap responsive collapse (hamburger) preserved
// - Active link highlighting: use NavLink with className prop for active state
//
// Imports needed:
// import { Link, NavLink, useNavigate } from 'react-router-dom';
// import { isAuthenticated, logoutUser } from '../api/loginService';

function Navbar() {
  return <nav>Navbar — TODO</nav>;
}

export default Navbar;
