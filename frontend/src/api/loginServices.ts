interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  token?: string;
}

interface AuthSession {
  token?: string;
  username?: string;
}

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USERNAME_KEY = 'authUsername';

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
    console.log('API URL:', '/api/Auth/login');

    const response = await fetch('/api/Auth/login', {
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

export const storeAuthSession = ({ token, username }: AuthSession): void => {
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
};

/**
 * Logs out the current user by removing stored credentials
 */
export const logoutUser = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USERNAME_KEY);
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
