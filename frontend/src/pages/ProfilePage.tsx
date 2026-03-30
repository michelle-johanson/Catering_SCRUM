import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuthUserId, getAuthCompanyId, getAuthCompanyName, getAuthDisplayName,
  withAuthHeaders, storeAuthSession, getAuthToken, logoutUser,
} from '../api/loginService';
import type { User } from '../types/User';
import DeleteAccountModal from '../components/modals/DeleteAccountModal';
import type { DeleteModal } from '../components/modals/DeleteAccountModal';
import '../styles/profile.css';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState(getAuthDisplayName() ?? '');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameSuggestion, setUsernameSuggestion] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [modal, setModal] = useState<DeleteModal>({ open: false });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [changePwSuccess, setChangePwSuccess] = useState(false);

  const companyName = getAuthCompanyName();

  // Load profile
  useEffect(() => {
    const userId = getAuthUserId();
    if (!userId) { setIsLoading(false); return; }

    fetch(`${API_BASE}/users/${userId}`, { headers: withAuthHeaders() })
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<User>; })
      .then(data => {
        setUser(data);
        setDisplayName(data.displayName ?? '');
        setUsername(data.username);
      })
      .catch(() => setSaveError('Failed to load profile.'))
      .finally(() => setIsLoading(false));
  }, []);

  // Username availability check — skip if unchanged
  useEffect(() => {
    if (!username.trim() || username === user?.username) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/Auth/check-username?username=${encodeURIComponent(username.trim())}`);
        const data = await res.json() as { available: boolean; suggestion: string | null };
        setUsernameStatus(data.available ? 'available' : 'taken');
        if (!data.available && data.suggestion) setUsernameSuggestion(data.suggestion);
      } catch {
        setUsernameStatus('idle');
      }
    }, 400);
  }, [username, user?.username]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!username.trim()) { setSaveError('Username is required.'); return; }
    if (username.trim().length < 3) { setSaveError('Username must be at least 3 characters.'); return; }
    if (usernameStatus === 'checking') { setSaveError('Still checking username — please wait.'); return; }
    if (usernameStatus === 'taken') { setSaveError(`That username is taken. Try "${usernameSuggestion}".`); return; }

    setSaveError(null);
    setSaved(false);
    setIsSaving(true);

    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...user, username: username.trim(), displayName: displayName.trim() || null }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const updated = { ...user, username: username.trim(), displayName: displayName.trim() || null };
      setUser(updated);
      storeAuthSession({
        token: getAuthToken() ?? undefined,
        username: updated.username,
        displayName: updated.displayName ?? undefined,
        userId: user.id,
        companyId: getAuthCompanyId() ?? undefined,
        companyName: companyName ?? undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!user) return;
    setDeleteError(null);
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/delete-info`, { headers: withAuthHeaders() });
      if (!res.ok) throw new Error();
      const info = await res.json() as {
        canDelete: boolean;
        blockReason: string | null;
        companyWillBeDeleted: boolean;
        companyName: string | null;
      };
      if (!info.canDelete) {
        setModal({ open: true, canDelete: false, blockReason: info.blockReason ?? 'Deletion not allowed.' });
      } else {
        setModal({ open: true, canDelete: true, companyWillBeDeleted: info.companyWillBeDeleted, companyName: info.companyName });
      }
    } catch {
      setDeleteError('Could not check account status. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'DELETE',
        headers: withAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      logoutUser();
      navigate('/');
    } catch {
      setDeleteError('Failed to delete account. Please try again.');
      setModal({ open: false });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwError(null);
    setChangePwSuccess(false);

    if (newPassword.length < 6) { setChangePwError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setChangePwError('New passwords do not match.'); return; }

    const userId = getAuthUserId();
    if (!userId) return;

    setIsChangingPw(true);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/change-password`, {
        method: 'POST',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.status === 400) {
        const data = await res.json() as { message: string };
        setChangePwError(data.message ?? 'Current password is incorrect.');
        return;
      }
      if (!res.ok) throw new Error();
      setChangePwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setChangePwSuccess(false), 3000);
    } catch {
      setChangePwError('Failed to change password. Please try again.');
    } finally {
      setIsChangingPw(false);
    }
  };

  const usernameStatusEl = () => {
    if (usernameStatus === 'checking') return <span className="username-status checking">Checking…</span>;
    if (usernameStatus === 'available') return <span className="username-status available">✓ Available</span>;
    if (usernameStatus === 'taken')
      return (
        <span className="username-status taken">
          Taken —{' '}
          <button type="button" className="link-btn" onClick={() => setUsername(usernameSuggestion)}>
            use "{usernameSuggestion}"
          </button>
        </span>
      );
    return null;
  };

  if (isLoading) return <div className="alert alert-info">Loading…</div>;

  return (
    <div className="settings-page">
      <h2 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>
        {user?.displayName ? `Hi, ${user.displayName}!` : `Hi, ${user?.username ?? ''}!`}
      </h2>
      <p className="section-subtitle" style={{ marginBottom: 'var(--space-6)' }}>Manage your profile and account settings.</p>

      {/* ── Profile section ── */}
      <section className="settings-section">
        <div className="settings-section-header">
          <p className="settings-section-title">Profile</p>
          <p className="settings-section-desc">Update your display name and username.</p>
        </div>

        <form onSubmit={handleSave}>
          <div className="settings-section-body">
            <div className="settings-field">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name"
                disabled={isSaving}
              />
              <span className="settings-field-hint">How you appear to your teammates. Can be anything.</span>
            </div>

            <div className="settings-field">
              <div className="settings-username-label">
                <label htmlFor="username">Username</label>
                {usernameStatusEl()}
              </div>
              <input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                disabled={isSaving}
                autoComplete="username"
              />
              <span className="settings-field-hint">Lowercase letters, numbers, and underscores. Must be unique.</span>
            </div>
          </div>

          <div className="settings-section-footer">
            <span>
              {saved && <span className="settings-save-feedback">Changes saved.</span>}
              {saveError && <span className="settings-save-error">{saveError}</span>}
            </span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving || usernameStatus === 'checking' || usernameStatus === 'taken'}
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Account info section ── */}
      <section className="settings-section">
        <div className="settings-section-header">
          <p className="settings-section-title">Account</p>
        </div>

        <div className="settings-info-list">
          <div className="settings-info-row">
            <span className="settings-info-label">Email</span>
            <span className="settings-info-value">{user?.email ?? '—'}</span>
          </div>
          <div className="settings-info-row">
            <span className="settings-info-label">Role</span>
            <span className="settings-info-value">
              <span className={`role-badge ${user?.role?.toLowerCase() ?? ''}`}>
                {user?.role ?? '—'}
              </span>
            </span>
          </div>
          <div className="settings-info-row">
            <span className="settings-info-label">Company</span>
            <span className="settings-info-value">{companyName ?? '—'}</span>
          </div>
        </div>
      </section>

      {/* ── Change password ── */}
      <section className="settings-section">
        <div className="settings-section-header">
          <p className="settings-section-title">Change Password</p>
          <p className="settings-section-desc">Update your login password.</p>
        </div>

        <form onSubmit={handleChangePassword}>
          <div className="settings-section-body">
            <div className="settings-field">
              <label htmlFor="current-password">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  id="current-password"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  disabled={isChangingPw}
                  autoComplete="current-password"
                />
                <button type="button" className="toggle-password-btn" onClick={() => setShowCurrentPw(p => !p)} disabled={isChangingPw} aria-label={showCurrentPw ? 'Hide password' : 'Show password'}>
                  {showCurrentPw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="new-password">New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="new-password"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  disabled={isChangingPw}
                  autoComplete="new-password"
                />
                <button type="button" className="toggle-password-btn" onClick={() => setShowNewPw(p => !p)} disabled={isChangingPw} aria-label={showNewPw ? 'Hide password' : 'Show password'}>
                  {showNewPw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  )}
                </button>
              </div>
              <span className="settings-field-hint">At least 6 characters.</span>
            </div>

            <div className="settings-field">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={isChangingPw}
                  autoComplete="new-password"
                />
                <button type="button" className="toggle-password-btn" onClick={() => setShowConfirmPw(p => !p)} disabled={isChangingPw} aria-label={showConfirmPw ? 'Hide password' : 'Show password'}>
                  {showConfirmPw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="settings-section-footer">
            <span>
              {changePwSuccess && <span className="settings-save-feedback">Password changed.</span>}
              {changePwError && <span className="settings-save-error">{changePwError}</span>}
            </span>
            <button type="submit" className="btn btn-primary" disabled={isChangingPw}>
              {isChangingPw ? 'Updating…' : 'Change Password'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Danger zone ── */}
      <section className="settings-section danger">
        <div className="settings-section-header">
          <p className="settings-section-title">Danger Zone</p>
        </div>

        <div className="settings-danger-row">
          <p>Permanently delete your account and all associated data.</p>
          <button type="button" className="btn-danger" onClick={handleDeleteClick}>
            Delete Account
          </button>
        </div>

        {deleteError && (
          <div style={{ padding: '0 var(--space-6) var(--space-4)' }}>
            <span className="settings-save-error">{deleteError}</span>
          </div>
        )}
      </section>

      <DeleteAccountModal
        modal={modal}
        isDeleting={isDeleting}
        onClose={() => setModal({ open: false })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default ProfilePage;
