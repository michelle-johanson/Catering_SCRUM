import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuthCompanyId, getAuthCompanyName, withAuthHeaders } from '../api/loginService';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/events': 'Events',
  '/tasks': 'Tasks',
  '/menus': 'Menus',
  '/analytics': 'Analytics',
  '/staff': 'Staff',
};

// Pages whose header should show a fixed label with no company-name prefix
const STANDALONE_TITLES: Record<string, string> = {
  '/profile': 'Account Settings',
};

function getPageTitle(pathname: string): { title: string; standalone: boolean } {
  if (STANDALONE_TITLES[pathname]) return { title: STANDALONE_TITLES[pathname], standalone: true };
  if (PAGE_TITLES[pathname]) return { title: PAGE_TITLES[pathname], standalone: false };
  if (pathname.startsWith('/events/')) return { title: 'Events', standalone: false };
  if (pathname.startsWith('/menus/')) return { title: 'Menus', standalone: false };
  return { title: '', standalone: false };
}

interface HeaderProps {
  toggleMobileNav?: () => void;
}

function Header({ toggleMobileNav }: HeaderProps) {
  const location = useLocation();
  const { title: pageTitle, standalone } = getPageTitle(location.pathname);

  const [companyName, setCompanyName] = useState<string | null>(
    getAuthCompanyName()
  );

  useEffect(() => {
    if (companyName) return;
    const companyId = getAuthCompanyId();
    if (!companyId) return;

    fetch(`${API_BASE_URL}/companies/${companyId}`, {
      headers: withAuthHeaders(),
    })
      .then(r => r.json())
      .then(data => setCompanyName(data.name ?? null))
      .catch(() => null);
  }, [companyName]);

  const label = standalone
    ? pageTitle
    : companyName && pageTitle
      ? `${companyName}'s ${pageTitle}`
      : companyName ?? pageTitle ?? 'Catering Management';

  return (
    <header className="app-header">
      {toggleMobileNav && (
        <button className="mobile-nav-toggle" onClick={toggleMobileNav} aria-label="Toggle Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>
      )}
      <span className="app-header-company">{label}</span>
    </header>
  );
}

export default Header;
