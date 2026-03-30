import { useRef, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

interface Props {
  open: boolean;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  username: string;
  usernameStatus: UsernameStatus;
  email: string;
  password: string;
  role: string;
  onUsernameChange: (v: string) => void;
  onUsernameStatusChange: (s: UsernameStatus) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

function AddTeamMemberModal({
  open, isLoading, error, success,
  username, usernameStatus, email, password, role,
  onUsernameChange, onUsernameStatusChange,
  onEmailChange, onPasswordChange, onRoleChange,
  onSubmit, onClose,
}: Props) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!username.trim()) {
      onUsernameStatusChange('idle');
      return;
    }
    onUsernameStatusChange('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Auth/check-username?username=${encodeURIComponent(username.trim())}`);
        const data = await res.json() as { available: boolean };
        onUsernameStatusChange(data.available ? 'available' : 'taken');
      } catch {
        onUsernameStatusChange('idle');
      }
    }, 400);
  }, [username]);

  if (!open) return null;

  const inputClass = usernameStatus === 'available'
    ? 'input-success'
    : usernameStatus === 'taken'
      ? 'input-error'
      : '';

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal" onClick={e => e.stopPropagation()}>
        <div className="app-modal-header">
          <p className="app-modal-title">Add Team Member</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="app-modal-body">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Create an account for a new employee. Share their username and temporary password with them — they can change it from their profile after logging in.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="settings-field">
                <div className="settings-username-label">
                  <label htmlFor="modal-add-username">Username</label>
                  {usernameStatus === 'checking' && <span className="username-status checking">Checking…</span>}
                  {usernameStatus === 'available' && <span className="username-status available">✓ Available</span>}
                  {usernameStatus === 'taken' && <span className="username-status taken">Username already taken</span>}
                </div>
                <input
                  id="modal-add-username"
                  className={inputClass}
                  value={username}
                  onChange={e => onUsernameChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. jsmith"
                  disabled={isLoading}
                />
              </div>

              <div className="settings-field">
                <label htmlFor="modal-add-email">Email</label>
                <input
                  id="modal-add-email"
                  type="email"
                  value={email}
                  onChange={e => onEmailChange(e.target.value)}
                  placeholder="employee@example.com"
                  disabled={isLoading}
                />
              </div>

              <div className="settings-field">
                <label htmlFor="modal-add-password">Temporary Password</label>
                <input
                  id="modal-add-password"
                  type="text"
                  value={password}
                  onChange={e => onPasswordChange(e.target.value)}
                  placeholder="Min. 6 characters"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>

              <div className="settings-field">
                <label htmlFor="modal-add-role">Role</label>
                <select
                  id="modal-add-role"
                  value={role}
                  onChange={e => onRoleChange(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {error && <span className="settings-save-error">{error}</span>}
              {success && <span className="settings-save-feedback">{success}</span>}
            </div>
          </div>

          <div className="app-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || usernameStatus === 'checking' || usernameStatus === 'taken'}
            >
              {isLoading ? 'Adding…' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTeamMemberModal;
export type { UsernameStatus };
