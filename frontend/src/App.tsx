import './App.css';
import { Link, Route, Routes } from 'react-router-dom';
import EventList from './components/EventList';
import Register from './components/Register';
import Login from './components/Login';

function App() {
  return (
    <main style={{ padding: '20px' }}>
      <header style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <h1 style={{ marginRight: 'auto' }}>My Catering App Test</h1>
        <nav style={{ display: 'flex', gap: '10px' }}>
          <Link to="/">Events</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<EventList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </main>
  );
}

export default App;
