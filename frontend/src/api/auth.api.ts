import axios from 'axios';
import { API_BASE_URL, API_PATH } from '../utils/constants';
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest } from '../types/auth.types';

// Create isolated auth client to avoid circular dependency
const authClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PATH}`,
  timeout: 10000,
  withCredentials: true,
});

// Validate token - read from cookie, no parameter
export async function validateToken() {
  try {
    const res = await authClient.get(`/auth/validate/token`);
    return res;
  } catch (error: any) {
    return {
      data: {
        detail: "TOKEN_INVALID"
      },
      status: 401
    };
  }
}

export async function refreshToken() {
  try {
    const res = await authClient.post(`/auth/refresh/token`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function login(username: string | null, email: string | null, password: string) {
  try {
    const res = await authClient.post(`/auth/login`, {
      username: username || null,
      email: email || null,
      password,
    } as LoginRequest);
    return res.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    if (errorData?.detail) {
      throw { message: errorData.detail, error: errorData.detail };
    }
    throw errorData || { message: 'Login failed', error: 'Login failed' };
  }
}

export async function register(userData: RegisterRequest) {
  try {
    const res = await authClient.post(`/auth/register`, userData);
    return res.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    if (errorData?.detail) {
      throw { message: errorData.detail, error: errorData.detail };
    }
    throw errorData || { message: 'Registration failed', error: 'Registration failed' };
  }
}

export async function logout() {
  try {
    const res = await authClient.post(`/auth/logout`);
    return res.data;
  } catch (error: any) {
    console.error('Logout API error:', error);
    return null;
  }
}

export async function forgotPassword(email: string) {
  try {
    const res = await authClient.post(`/auth/forgot-password`, { email } as ForgotPasswordRequest);
    return res.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    if (errorData?.detail) {
      throw { message: errorData.detail, error: errorData.detail };
    }
    throw errorData || { message: 'Failed to send OTP', error: 'Failed to send OTP' };
  }
}

export async function verifyOTP(email: string, otp: string) {
  try {
    const res = await authClient.post(`/auth/verify-otp`, { email, otp } as VerifyOTPRequest);
    return res.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    if (errorData?.detail) {
      throw { message: errorData.detail, error: errorData.detail };
    }
    throw errorData || { message: 'Invalid OTP', error: 'Invalid OTP' };
  }
}

export async function resetPassword(email: string, otp: string, newPassword: string) {
  try {
      const res = await authClient.post(`/auth/reset-password`, {
      email,
      otp,
      new_password: newPassword,
    } as ResetPasswordRequest);
    return res.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    if (errorData?.detail) {
      throw { message: errorData.detail, error: errorData.detail };
    }
    throw errorData || { message: 'Failed to reset password', error: 'Failed to reset password' };
  }
}
