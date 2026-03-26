import { useState, useEffect } from 'react';
import { getAuthCompanyId, withAuthHeaders } from '../api/loginService';

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

  useEffect(() => {
    const companyId = getAuthCompanyId();
    if (companyId === null) {
      setError('No company found for your account.');
      setIsLoading(false);
      return;
    }

    const load = async () => {
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

    void load();
  }, []);

  const handleCopyCode = () => {
    if (!company) return;
    void navigator.clipboard.writeText(company.joinCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  if (isLoading) return <div className="alert alert-info">Loading staff...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!company) return null;

  return (
    <div>
      <h2 className="section-title">{company.name} — Staff</h2>

      <div className="card p-4 mb-4" style={{ maxWidth: '32rem' }}>
        <p className="mb-1" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Company Join Code
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: '0.15em' }}>
            {company.joinCode}
          </span>
          <button className="btn btn-sm btn-outline" onClick={handleCopyCode}>
            {codeCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="mb-0 mt-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Share this code with new team members so they can join your company on the registration page.
        </p>
      </div>

      <div className="card p-4" style={{ maxWidth: '48rem' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-4)' }}>
          Team Members ({company.users.length})
        </h3>

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
    </div>
  );
}

export default StaffPage;
