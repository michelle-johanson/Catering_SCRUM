import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeAuthSession } from '../api/loginService';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

type Mode = 'create' | 'join';

interface RegisterResponse {
  id?: number;
  token?: string;
  username?: string;
  displayName?: string;
  companyId?: number;
  companyName?: string;
}

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  // ── Step state ──────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Step 1: credentials ─────────────────────────────────────
  const [mode, setMode] = useState<Mode>('create');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [joinCode, setJoinCode] = useState('');

  // ── Step 2: company ─────────────────────────────────────────
  const [companyName, setCompanyName] = useState('');
  const [joinedCompany, setJoinedCompany] = useState<{ id: number; name: string } | null>(null);

  // ── Step 3: profile ──────────────────────────────────────────
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameSuggestion, setUsernameSuggestion] = useState('');
  const usernameDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Shared ───────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── Username availability check (debounced) ──────────────────
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    if (usernameDebounce.current) clearTimeout(usernameDebounce.current);
    usernameDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/Auth/check-username?username=${encodeURIComponent(username.trim())}`);
        const data = await res.json() as { available: boolean; suggestion: string | null };
        setUsernameStatus(data.available ? 'available' : 'taken');
        if (!data.available && data.suggestion) setUsernameSuggestion(data.suggestion);
      } catch {
        setUsernameStatus('idle');
      }
    }, 400);
  }, [username]);

  // ── Step 1 → 2 ───────────────────────────────────────────────
  const handleStep1 = async () => {
    setError(null);

    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (mode === 'join') {
      if (!joinCode.trim()) {
        setError('Please enter a join code.');
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/Companies/lookup?joinCode=${encodeURIComponent(joinCode.trim().toUpperCase())}`);
        if (!res.ok) {
          const data = await res.json().catch(() => null) as { message?: string } | null;
          setError(data?.message ?? 'Invalid join code.');
          setIsLoading(false);
          return;
        }
        const data = await res.json() as { id: number; name: string };
        setJoinedCompany(data);
      } catch {
        setError('Could not reach the server. Is the backend running?');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    setStep(2);
  };

  // ── Step 2 → 3 ───────────────────────────────────────────────
  const handleStep2 = () => {
    setError(null);
    if (mode === 'create' && !companyName.trim()) {
      setError('Please enter a company name.');
      return;
    }
    // Auto-suggest username from email prefix
    const suggested = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(suggested);
    setUsernameStatus('idle');
    setStep(3);
  };

  // ── Step 3 → submit ──────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);

    if (!username.trim()) {
      setError('Please choose a username.');
      return;
    }
    if (usernameStatus === 'checking') {
      setError('Still checking username availability — please wait a moment.');
      return;
    }
    if (usernameStatus === 'taken') {
      setError(`That username is taken. Try "${usernameSuggestion}" instead.`);
      return;
    }

    setIsLoading(true);
    try {
      const body = {
        username: username.trim(),
        displayName: displayName.trim() || null,
        email: email.trim(),
        password,
        ...(mode === 'create'
          ? { companyName: companyName.trim() }
          : { joinCode: joinCode.trim().toUpperCase() }),
      };

      const res = await fetch(`${API_BASE}/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null) as { message?: string; errors?: Record<string, string[]> } | null;
        let message = data?.message ?? null;
        if (!message && data?.errors) {
          message = Object.values(data.errors).flat().join(' ');
        }
        setError(message ?? `Registration failed (HTTP ${res.status}).`);
        setIsLoading(false);
        return;
      }

      const data = await res.json().catch(() => null) as RegisterResponse | null;
      storeAuthSession({
        token: data?.token,
        username: data?.username ?? username,
        displayName: data?.displayName ?? (displayName.trim() || undefined),
        userId: data?.id,
        companyId: data?.companyId,
        companyName: data?.companyName,
      });
      navigate('/dashboard');
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Something went wrong.';
      setError(
        raw === 'Failed to fetch'
          ? 'Cannot connect to the backend. Make sure it is running.'
          : raw
      );
      setIsLoading(false);
    }
  };

  // ── UI helpers ───────────────────────────────────────────────
  const usernameHint = () => {
    if (usernameStatus === 'checking') return <span className="username-hint checking">Checking…</span>;
    if (usernameStatus === 'available') return <span className="username-hint available">✓ Available</span>;
    if (usernameStatus === 'taken')
      return (
        <span className="username-hint taken">
          Taken.{' '}
          <button type="button" className="link-btn" onClick={() => setUsername(usernameSuggestion)}>
            Use "{usernameSuggestion}"
          </button>
        </span>
      );
    return null;
  };

  const stepLabels = ['Credentials', 'Company', 'Profile'];

  return (
    <div className="auth-container">
      <div className="auth-card wizard-card">

        {/* Step indicator */}
        <div className="wizard-steps">
          {stepLabels.map((label, i) => (
            <div key={label} className={`wizard-step-dot${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}>
              <span className="wizard-step-num">{step > i + 1 ? '✓' : i + 1}</span>
              <span className="wizard-step-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Sliding track */}
        <div className="wizard-track-container">
          <div className="wizard-track" style={{ transform: `translateX(-${(step - 1) * 100}%)` }}>

            {/* ── Step 1: Credentials ── */}
            <div className="wizard-panel">
              <div className="auth-header">
                <h1>Create an account</h1>
                <p>Set up your catering company or join an existing one</p>
              </div>

              <div className="auth-toggle">
                <button
                  type="button"
                  className={`auth-toggle-btn${mode === 'create' ? ' active' : ''}`}
                  onClick={() => { setMode('create'); setError(null); }}
                >
                  New Company
                </button>
                <button
                  type="button"
                  className={`auth-toggle-btn${mode === 'join' ? ' active' : ''}`}
                  onClick={() => { setMode('join'); setError(null); }}
                >
                  Join with Code
                </button>
              </div>

              {error && step === 1 && <div className="auth-error">{error}</div>}

              <form className="auth-form" onSubmit={e => { e.preventDefault(); void handleStep1(); }}>
                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                </div>

                {mode === 'join' && (
                  <div>
                    <label htmlFor="joinCode">Join Code</label>
                    <input
                      id="joinCode"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="8-character code from your admin"
                      style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      maxLength={8}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Checking…' : 'Next →'}
                </button>
              </form>

              <div className="auth-footer">
                <p>Already have an account? <a href="/login">Sign in</a></p>
              </div>
            </div>

            {/* ── Step 2: Company ── */}
            <div className="wizard-panel">
              {mode === 'join' && joinedCompany ? (
                <>
                  <div className="auth-header">
                    <h1>Join company?</h1>
                    <p>You're about to join an existing team.</p>
                  </div>
                  <div className="join-confirm-card">
                    <span className="join-confirm-name">{joinedCompany.name}</span>
                    <span className="join-confirm-sub">You'll be added as an Employee</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="auth-header">
                    <h1>Name your company</h1>
                    <p>This is how your team will be identified in the system.</p>
                  </div>
                </>
              )}

              {error && step === 2 && <div className="auth-error">{error}</div>}

              <form className="auth-form" onSubmit={e => { e.preventDefault(); handleStep2(); }}>
                {mode === 'create' && (
                  <div>
                    <label htmlFor="companyName">Company Name</label>
                    <input
                      id="companyName"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {mode === 'join' ? `Join ${joinedCompany?.name ?? 'Company'} →` : 'Next →'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setStep(1); setError(null); }}
                >
                  ← Back
                </button>
              </form>
            </div>

            {/* ── Step 3: Profile ── */}
            <div className="wizard-panel">
              <div className="auth-header">
                <h1>Set up your profile</h1>
                <p>Choose how you appear to your team.</p>
              </div>

              {error && step === 3 && <div className="auth-error">{error}</div>}

              <form className="auth-form" onSubmit={e => { e.preventDefault(); void handleSubmit(); }}>
                <div>
                  <label htmlFor="displayName">Display Name</label>
                  <input
                    id="displayName"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Display name"
                  />
                  <small className="field-hint">How your name appears to teammates — can be anything.</small>
                </div>
                <div>
                  <label htmlFor="username">
                    Username {usernameHint()}
                  </label>
                  <input
                    id="username"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="unique_handle"
                    autoComplete="username"
                  />
                  <small className="field-hint">Lowercase letters, numbers, and underscores only. Must be unique.</small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || usernameStatus === 'checking' || usernameStatus === 'taken'}
                >
                  {isLoading ? 'Creating account…' : 'Create Account'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setStep(2); setError(null); }}
                >
                  ← Back
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
