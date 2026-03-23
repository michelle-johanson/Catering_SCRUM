import { useState, useEffect } from 'react';
import { getAuthUserId, getAuthUsername, withAuthHeaders, storeAuthSession, getAuthToken } from '../api/loginService';
import type { User } from '../types/User';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface FormErrors {
  username?: string;
  email?: string;
  submit?: string;
}

function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const userId = getAuthUserId();
    if (userId === null) return;

    const load = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          headers: withAuthHeaders(),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: User = await response.json();
        setUser(data);
        setUsername(data.username);
        setEmail(data.email);
      } catch {
        setErrors({ submit: 'Failed to load profile. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!username.trim()) next.username = 'Username is required';
    else if (username.trim().length < 3) next.username = 'Username must be at least 3 characters';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    if (!validate() || !user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        // passwordHash and role are sent back unchanged — they are never shown in the UI
        body: JSON.stringify({
          ...user,
          username: username.trim(),
          email: email.trim(),
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      // Keep localStorage username in sync if it changed
      if (username.trim() !== user.username) {
        storeAuthSession({
          token: getAuthToken() ?? undefined,
          username: username.trim(),
          userId: user.id,
        });
      }

      setUser((prev) => prev ? { ...prev, username: username.trim(), email: email.trim() } : prev);
      setSuccessMessage('Profile updated successfully.');
    } catch {
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="alert alert-info">Loading profile...</div>;
  }

  return (
    <div>
      <h2 className="section-title">My Profile</h2>

      <div className="card p-4" style={{ maxWidth: '32rem' }}>
        {errors.submit && (
          <div className="alert alert-danger mb-3" role="alert">{errors.submit}</div>
        )}
        {successMessage && (
          <div className="alert alert-success mb-3" role="alert">{successMessage}</div>
        )}

        {/* Read-only info */}
        <div className="mb-4">
          <p className="mb-1" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Role</p>
          <p className="mb-0" style={{ fontWeight: 'var(--weight-medium)' }}>
            {user?.role ?? '—'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className={errors.username ? 'input-error' : ''}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              disabled={isSubmitting}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="mb-4">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={errors.email ? 'input-error' : ''}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              disabled={isSubmitting}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
