import './App.css';
import { Link, Route, Routes } from 'react-router-dom';
import EventList from './components/EventList';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import CreateEventPage from './components/CreateEventPage';

function App() {
  return (
    <>
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
            <Link className="nav-link" to="/">Events</Link>
            <Link className="nav-link" to="/register">Register</Link>
            <Link className="nav-link" to="/login">Login</Link>
          </div>
        </div>
      </nav>

      <main className="container page-wrapper" style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-8))' }}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<EventList />} />
          </Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events/new" element={<CreateEventPage />} />
          <Route path="/events/edit/:id" element={<div>Edit Event Page</div>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
