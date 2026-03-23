import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeAuthSession, withAuthHeaders } from '../api/loginService';

interface RegisterResponse {
  id?: number;
  token?: string;
  username?: string;
}

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL ?? '/api';
      const response = await fetch(`${apiBase}/Auth/register`, {
        method: 'POST',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = (data as { message?: string } | null)?.message ?? 'Registration failed.';
        setError(message);
        setIsSubmitting(false);
        return;
      }

      const data = (await response.json().catch(() => null)) as RegisterResponse | null;
      storeAuthSession({
        token: data?.token,
        username: data?.username ?? form.username,
        userId: data?.id,
      });
      navigate(data?.token ? '/' : '/login');
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      const message =
        raw === 'Failed to fetch'
          ? 'Cannot connect to the backend server. Make sure the backend is running (default: http://localhost:5015).'
          : raw;
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create an account</h1>
          <p>Join the Catering Service team</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">{error}</div>
          )}

          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
