
import api from '../utils/axios';

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });

    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error: any) {
    console.error('Login service error:', error);
    throw error;
  }
};

export const register = async (userData: RegisterData): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/register', userData);

    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error: any) {
    console.error('Register service error:', error);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Profile update interfaces
interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

// Update user profile
export const updateProfile = async (profileData: ProfileUpdateData): Promise<any> => {
  try {
    const response = await api.put('/auth/profile', profileData);
    
    // Update local storage if successful
    if (response.data.success && response.data.data) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          ...response.data.data
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Profile update error:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData: PasswordChangeData): Promise<any> => {
  try {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  } catch (error: any) {
    console.error('Password change error:', error);
    throw error;
  }
};
