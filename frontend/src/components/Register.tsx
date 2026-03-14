import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:5015';
    try {
      const response = await fetch(`${apiBase}/api/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      navigate('/login');
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
    <div style={{ padding: '20px', maxWidth: 400, margin: '0 auto' }}>
      <h2>Register</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}
      >
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
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
            required
            style={{ width: '100%', padding: '8px' }}
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
            required
            minLength={6}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {error && (
          <div style={{ color: 'red' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} style={{ padding: '10px', marginTop: '8px' }}>
          {isSubmitting ? 'Registering…' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Register;