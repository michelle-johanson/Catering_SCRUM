import { useState, useEffect } from 'react';
import { getAuthCompanyId, getAuthUserId, withAuthHeaders } from '../api/loginService';
import AddTeamMemberModal, { type UsernameStatus } from '../components/modals/AddTeamMemberModal';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface StaffMember {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface CompanyData {
  id: number;
  name: string;
  joinCode: string;
  users: StaffMember[];
}

function StaffPage() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [codeActionMsg, setCodeActionMsg] = useState<string | null>(null);
  const [codeActionLoading, setCodeActionLoading] = useState(false);

  // Add user modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [addUsernameStatus, setAddUsernameStatus] = useState<UsernameStatus>('idle');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState('Employee');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  const myId = getAuthUserId();

  const loadCompany = async () => {
    const companyId = getAuthCompanyId();
    if (companyId === null) {
      setError('No company found for your account.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        headers: withAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: CompanyData = await response.json();
      setCompany(data);
    } catch {
      setError('Failed to load staff. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadCompany(); }, []);

  const isAdmin = company?.users.find(u => u.id === myId)?.role === 'Admin';
  const codeDisabled = (company?.joinCode.length ?? 0) > 8;

  const handleCopyCode = () => {
    if (!company) return;
    void navigator.clipboard.writeText(company.joinCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  const handleToggleJoinCode = async () => {
    if (!company) return;
    setCodeActionLoading(true);
    setCodeActionMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${company.id}/regenerate-join-code`, {
        method: 'PUT',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ disable: !codeDisabled }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { joinCode: string };
      setCompany(prev => prev ? { ...prev, joinCode: data.joinCode } : prev);
      setCodeActionMsg(codeDisabled ? 'Join code re-enabled.' : 'Join code disabled.');
      setTimeout(() => setCodeActionMsg(null), 3000);
    } catch {
      setCodeActionMsg('Failed to update join code. Please try again.');
    } finally {
      setCodeActionLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);

    if (!addUsername.trim() || !addEmail.trim() || !addPassword.trim()) {
      setAddError('Username, email, and password are required.');
      return;
    }
    if (addPassword.length < 6) {
      setAddError('Password must be at least 6 characters.');
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${company!.id}/users`, {
        method: 'POST',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          username: addUsername.trim(),
          email: addEmail.trim(),
          password: addPassword,
          role: addRole,
        }),
      });
      if (res.status === 409) {
        setAddError('A user with that username or email already exists.');
        return;
      }
      if (!res.ok) throw new Error();
      setAddSuccess(`${addUsername.trim()} has been added to the team.`);
      setAddUsername('');
      setAddEmail('');
      setAddPassword('');
      setAddUsernameStatus('idle');
      setAddRole('Employee');
      await loadCompany();
      setTimeout(() => { setAddModalOpen(false); setAddSuccess(null); }, 1200);
    } catch {
      setAddError('Failed to add team member. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  if (isLoading) return <div className="alert alert-info">Loading staff...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!company) return null;

  return (
    <div className="page-container">
      <h2 className="section-title">{company.name} — Staff</h2>

      {/* ── Join Code ── */}
      <div className="card p-4 mb-4" style={{ maxWidth: '40rem' }}>
        <p className="mb-1" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Company Join Code
        </p>

        {codeDisabled ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span style={{
              display: 'inline-block',
              padding: '2px var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger)',
            }}>
              Disabled
            </span>
            {isAdmin && (
              <button
                className="btn btn-sm btn-outline"
                onClick={() => void handleToggleJoinCode()}
                disabled={codeActionLoading}
              >
                {codeActionLoading ? 'Updating…' : 'Re-enable Code'}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: '0.15em' }}>
              {company.joinCode}
            </span>
            <button className="btn btn-sm btn-outline" onClick={handleCopyCode}>
              {codeCopied ? 'Copied!' : 'Copy'}
            </button>
            {isAdmin && (
              <button
                className="btn btn-sm btn-outline"
                onClick={() => void handleToggleJoinCode()}
                disabled={codeActionLoading}
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              >
                {codeActionLoading ? 'Updating…' : 'Disable Code'}
              </button>
            )}
          </div>
        )}

        {codeActionMsg && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-2)' }}>
            {codeActionMsg}
          </p>
        )}

        <p className="mb-0" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {codeDisabled
            ? 'The join code is disabled. New members cannot join using a join code until it is re-enabled.'
            : 'Share this code with new team members so they can join your company on the registration page.'}
        </p>
      </div>

      {/* ── Team Members ── */}
      <div className="card p-4 mb-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', margin: 0 }}>
            Team Members ({company.users.length})
          </h3>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => setAddModalOpen(true)}>
              + Add Team Member
            </button>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: 'var(--border)', textAlign: 'left' }}>
              <th style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 'var(--weight-medium)' }}>Username</th>
              <th style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 'var(--weight-medium)' }}>Email</th>
              <th style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 'var(--weight-medium)' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {company.users.map(member => (
              <tr key={member.id} style={{ borderBottom: 'var(--border)' }}>
                <td style={{ padding: 'var(--space-3)', fontWeight: 'var(--weight-medium)' }}>{member.username}</td>
                <td style={{ padding: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>{member.email}</td>
                <td style={{ padding: 'var(--space-3)' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-medium)',
                    background: member.role === 'Admin' ? 'var(--color-primary-bg, #eff6ff)' : 'var(--color-bg)',
                    color: member.role === 'Admin' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    border: 'var(--border)',
                  }}>
                    {member.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddTeamMemberModal
        open={addModalOpen}
        isLoading={addLoading}
        error={addError}
        success={addSuccess}
        username={addUsername}
        usernameStatus={addUsernameStatus}
        email={addEmail}
        password={addPassword}
        role={addRole}
        onUsernameChange={setAddUsername}
        onUsernameStatusChange={setAddUsernameStatus}
        onEmailChange={setAddEmail}
        onPasswordChange={setAddPassword}
        onRoleChange={setAddRole}
        onSubmit={(e) => void handleAddUser(e)}
        onClose={() => { setAddModalOpen(false); setAddError(null); setAddSuccess(null); setAddUsernameStatus('idle'); setAddRole('Employee'); }}
      />
    </div>
  );
}

export default StaffPage;
