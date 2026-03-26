const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  id: number;
  username: string;
  displayName?: string;
  email: string;
  role: string;
  companyId: number;
  companyName?: string;
  token?: string;
}

interface AuthSession {
  token?: string;
  username?: string;
  displayName?: string;
  userId?: number;
  companyId?: number;
  companyName?: string;
}

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USERNAME_KEY = 'authUsername';
const AUTH_DISPLAY_NAME_KEY = 'authDisplayName';
const AUTH_USER_ID_KEY = 'authUserId';
const AUTH_COMPANY_ID_KEY = 'authCompanyId';
const AUTH_COMPANY_NAME_KEY = 'authCompanyName';

/**
 * Authenticates a user with the provided credentials
 * @param credentials - Username and password
 * @returns User data if successful, throws error otherwise
 */
export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    console.log('Attempting login with:', { username: credentials.username });
    console.log('API URL:', `${API_BASE_URL}/Auth/login`);

    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('Login response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Login failed with status: ${response.status}`
      );
    }

    const data: LoginResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const storeAuthSession = ({ token, username, displayName, userId, companyId, companyName }: AuthSession): void => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  if (username) {
    localStorage.setItem(AUTH_USERNAME_KEY, username);
  } else {
    localStorage.removeItem(AUTH_USERNAME_KEY);
  }

  if (displayName) {
    localStorage.setItem(AUTH_DISPLAY_NAME_KEY, displayName);
  } else {
    localStorage.removeItem(AUTH_DISPLAY_NAME_KEY);
  }

  if (typeof userId === 'number') {
    localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
  } else {
    localStorage.removeItem(AUTH_USER_ID_KEY);
  }

  if (typeof companyId === 'number') {
    localStorage.setItem(AUTH_COMPANY_ID_KEY, String(companyId));
  } else {
    localStorage.removeItem(AUTH_COMPANY_ID_KEY);
  }

  if (companyName) {
    localStorage.setItem(AUTH_COMPANY_NAME_KEY, companyName);
  } else {
    localStorage.removeItem(AUTH_COMPANY_NAME_KEY);
  }
};

/**
 * Logs out the current user by removing stored credentials
 */
export const logoutUser = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USERNAME_KEY);
  localStorage.removeItem(AUTH_DISPLAY_NAME_KEY);
  localStorage.removeItem(AUTH_USER_ID_KEY);
  localStorage.removeItem(AUTH_COMPANY_ID_KEY);
  localStorage.removeItem(AUTH_COMPANY_NAME_KEY);
};

export const getAuthDisplayName = (): string | null => {
  return localStorage.getItem(AUTH_DISPLAY_NAME_KEY);
};

export const getAuthCompanyName = (): string | null => {
  return localStorage.getItem(AUTH_COMPANY_NAME_KEY);
};

export const getAuthCompanyId = (): number | null => {
  const value = localStorage.getItem(AUTH_COMPANY_ID_KEY);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Retrieves the stored authentication token
 * @returns Token string or null if not authenticated
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getAuthUsername = (): string | null => {
  return localStorage.getItem(AUTH_USERNAME_KEY);
};

export const getAuthUserId = (): number | null => {
  const value = localStorage.getItem(AUTH_USER_ID_KEY);

  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Checks if user is currently authenticated
 * @returns True if auth token exists
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() || !!getAuthUsername();
};

export const withAuthHeaders = (
  headers: Record<string, string> = {}
): Record<string, string> => {
  const token = getAuthToken();

  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};
