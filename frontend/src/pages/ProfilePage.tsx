import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuthUserId, getAuthCompanyId, getAuthCompanyName, getAuthDisplayName,
  withAuthHeaders, storeAuthSession, getAuthToken, logoutUser,
} from '../api/loginService';
import type { User } from '../types/User';
import '../styles/profile.css';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

type DeleteModal =
  | { open: false }
  | { open: true; canDelete: false; blockReason: string }
  | { open: true; canDelete: true; companyWillBeDeleted: boolean; companyName: string | null };

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

      {/* ── Delete confirmation modal ── */}
      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({ open: false })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {!modal.canDelete ? (
              <>
                <div className="modal-header">
                  <p className="modal-title">Cannot delete account</p>
                </div>
                <div className="modal-body">
                  <p className="modal-block">{modal.blockReason}</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setModal({ open: false })}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-header">
                  <p className="modal-title">Delete your account?</p>
                </div>
                <div className="modal-body">
                  <p>This action is permanent and cannot be undone.</p>
                  {modal.companyWillBeDeleted && (
                    <p className="modal-warning">
                      You are the only member of <strong>{modal.companyName}</strong>. Deleting your account will also permanently delete the company and all of its events, menus, and tasks.
                    </p>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setModal({ open: false })}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button className="btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                    {isDeleting ? 'Deleting…' : 'Yes, delete my account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
