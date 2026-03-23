import './App.css';
import { Route, Routes } from 'react-router-dom';

// Shared components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

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
import EventFormPage from './pages/EventFormPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TasksPage from './pages/TasksPage';
import MenuPage from './pages/MenuPage';
import MenuEditorPage from './pages/MenuEditorPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <>
      <Navbar />

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
            <Route path="/events/new" element={<EventFormPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/:id/edit" element={<EventFormPage />} />

            {/* Analytics */}
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* Tasks */}
            <Route path="/tasks" element={<TasksPage />} />

            {/* Menus */}
            <Route path="/menus" element={<MenuPage />} />
            <Route path="/menus/:id/edit" element={<MenuEditorPage />} />

            {/* Profile */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
