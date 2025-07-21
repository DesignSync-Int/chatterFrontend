import axios from 'axios';

interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  profile: string | null;
  token?: string;
  message?: string;
}

interface VerificationResponse {
  message: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  fullName: string;
  captchaCompleted: boolean;
}

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${import.meta.env.VITE_BASE_URL}/api/auth/signup`,
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error || (error && typeof error === 'object' && 'response' in error)) {
      const axiosError = error as { response?: { data?: { message: string } } };
      throw new Error(axiosError.response?.data?.message || 'Failed to sign up');
    }
    throw new Error('Failed to sign up');
  }
};

export const verifyEmail = async (token: string): Promise<VerificationResponse> => {
  try {
    const { data } = await axios.post<VerificationResponse>(
      `${import.meta.env.VITE_BASE_URL}/api/auth/verify-email`,
      { token }
    );
    return data;
  } catch (error) {
    if (error instanceof Error || (error && typeof error === 'object' && 'response' in error)) {
      const axiosError = error as { response?: { data?: { message: string } } };
      throw new Error(axiosError.response?.data?.message || 'Failed to verify email');
    }
    throw new Error('Failed to verify email');
  }
};

export const resendVerificationEmail = async (email: string): Promise<{ message: string }> => {
  try {
    const { data } = await axios.post<{ message: string }>(
      `${import.meta.env.VITE_BASE_URL}/api/auth/resend-verification`,
      { email }
    );
    return data;
  } catch (error) {
    if (error instanceof Error || (error && typeof error === 'object' && 'response' in error)) {
      const axiosError = error as { response?: { data?: { message: string } } };
      throw new Error(axiosError.response?.data?.message || 'Failed to resend verification email');
    }
    throw new Error('Failed to resend verification email');
  }
};
