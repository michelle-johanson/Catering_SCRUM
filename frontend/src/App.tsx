import { useState } from 'react';
import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';

// Shared components
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { isAuthenticated } from './api/loginService';

// Auth pages (stay in components/ — not layout-level pages)
import Login from './components/Login';
import Register from './components/Register';

import EventsPage from './pages/EventsPage';

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/EventDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TasksPage from './pages/TasksPage';
import MenuPage from './pages/MenuPage';
import MenuDetailPage from './pages/MenuDetailPage';
import ProfilePage from './pages/ProfilePage';
import StaffPage from './pages/StaffPage';

function App() {
  useLocation(); // re-render App on navigation so isAuthenticated() stays current
  const loggedIn = isAuthenticated();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className={loggedIn ? 'app-layout' : ''}>
      <Sidebar 
        isMobileNavOpen={isMobileNavOpen} 
        onCloseMobileNav={() => setIsMobileNavOpen(false)} 
      />

      <div className={loggedIn ? 'main-wrapper' : ''}>
        {loggedIn && <Header toggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)} />}
        <main className={loggedIn ? 'page-content' : ''}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<HomePage />} />

              {/* Events */}
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />

              {/* Analytics */}
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* Tasks */}
              <Route path="/tasks" element={<TasksPage />} />

              {/* Menus */}
              <Route path="/menus" element={<MenuPage />} />
              <Route path="/menus/:id/edit" element={<MenuDetailPage />} />

              {/* Staff */}
              <Route path="/staff" element={<StaffPage />} />

              {/* Profile */}
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
