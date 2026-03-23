import './App.css';
import { Link, Route, Routes } from 'react-router-dom';

// Shared components
import ProtectedRoute from './components/ProtectedRoute';
// TODO: Replace inline <nav> below with <Navbar /> once Navbar.tsx is implemented
// import Navbar from './components/Navbar';

// Auth pages (stay in components/ — not layout-level pages)
import Login from './components/Login';
import Register from './components/Register';

// TODO: Delete EventList once EventsPage is fully implemented
import EventList from './components/EventList';

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
// TODO: import EventsPage from './pages/EventsPage'; — uncomment when EventsPage is implemented and EventList is removed
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TasksPage from './pages/TasksPage';
import MenuPage from './pages/MenuPage';
import MenuEditorPage from './pages/MenuEditorPage';

function App() {
  return (
    <>
      {/* TODO: Replace this inline nav with <Navbar /> once Navbar.tsx is implemented.
          Navbar should be auth-aware:
          - Logged out: Brand + "Login" link only
          - Logged in: Brand + all page links + Logout button
      */}
      <nav className="navbar navbar-expand-lg navbar-light px-3 fixed-top w-100">
        <Link className="navbar-brand" to="/">Catering Management</Link>
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
          <div className="navbar-nav ms-auto">
            {/* TODO: Remove these static links once Navbar component is wired up */}
            <Link className="nav-link" to="/events">Events</Link>
            <Link className="nav-link" to="/register">Register</Link>
            <Link className="nav-link" to="/login">Login</Link>
          </div>
        </div>
      </nav>

      <main className="container page-wrapper" style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-8))' }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<HomePage />} />

            {/* Events — TODO: swap EventList for EventsPage once EventsPage is implemented */}
            <Route path="/events" element={<EventList />} />
            <Route path="/events/new" element={<CreateEventPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/:id/edit" element={<EditEventPage />} />

            {/* Analytics */}
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* Tasks */}
            <Route path="/tasks" element={<TasksPage />} />

            {/* Menus */}
            <Route path="/menus" element={<MenuPage />} />
            <Route path="/menus/:id/edit" element={<MenuEditorPage />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
