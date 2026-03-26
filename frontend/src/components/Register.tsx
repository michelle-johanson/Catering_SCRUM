import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeAuthSession, withAuthHeaders } from '../api/loginService';

type RegisterMode = 'create' | 'join';

interface RegisterResponse {
  id?: number;
  token?: string;
  username?: string;
  companyId?: number;
  companyName?: string;
}

function Register() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<RegisterMode>('create');

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    companyName: '',
    joinCode: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleModeChange = (newMode: RegisterMode) => {
    setMode(newMode);
    setError(null);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL ?? '/api';
      const body =
        mode === 'create'
          ? { username: form.username, email: form.email, password: form.password, companyName: form.companyName }
          : { username: form.username, email: form.email, password: form.password, joinCode: form.joinCode };

      const response = await fetch(`${apiBase}/Auth/register`, {
        method: 'POST',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const typed = data as { message?: string; errors?: Record<string, string[]> } | null;

        let message = typed?.message ?? null;

        // ASP.NET model validation returns { errors: { Field: ["msg"] } }
        if (!message && typed?.errors) {
          message = Object.values(typed.errors).flat().join(' ');
        }

        if (!message) {
          message = `Registration failed (HTTP ${response.status}). Check that the backend is running and the database is up to date.`;
        }

        setError(message);
        setIsSubmitting(false);
        return;
      }

      const data = (await response.json().catch(() => null)) as RegisterResponse | null;
      storeAuthSession({
        token: data?.token,
        username: data?.username ?? form.username,
        userId: data?.id,
        companyId: data?.companyId,
        companyName: data?.companyName,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
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
          <p>Set up your catering company or join an existing one</p>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={`auth-toggle-btn${mode === 'create' ? ' active' : ''}`}
            onClick={() => handleModeChange('create')}
          >
            New Company
          </button>
          <button
            type="button"
            className={`auth-toggle-btn${mode === 'join' ? ' active' : ''}`}
            onClick={() => handleModeChange('join')}
          >
            Join with Code
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">{error}</div>
          )}

          {mode === 'create' ? (
            <div>
              <label htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Your catering company name"
                required
              />
            </div>
          ) : (
            <div>
              <label htmlFor="joinCode">Join Code</label>
              <input
                id="joinCode"
                name="joinCode"
                value={form.joinCode}
                onChange={handleChange}
                placeholder="8-character code from your admin"
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>
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
            {isSubmitting
              ? 'Creating account…'
              : mode === 'create'
              ? 'Create Company & Register'
              : 'Join & Register'}
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
