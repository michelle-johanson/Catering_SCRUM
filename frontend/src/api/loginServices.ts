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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5015';

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
    console.log('API URL:', `${API_BASE_URL}/api/Auth/login`);

    const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
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

    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Logs out the current user by removing stored credentials
 */
export const logoutUser = (): void => {
  localStorage.removeItem('authToken');
};

/**
 * Retrieves the stored authentication token
 * @returns Token string or null if not authenticated
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Checks if user is currently authenticated
 * @returns True if auth token exists
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
