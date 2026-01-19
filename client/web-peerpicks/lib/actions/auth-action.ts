"use server";

import { register, login } from '../api/auth';
import { SignupData } from '../../app/(auth)/schema'; 
import { setAuthToken, setUserData } from '../cookie';

/**
 * Handles the Registration Logic
 */
export const handleRegister = async (data: SignupData) => {
  try {
    const result = await register(data);
    
    // Check for success or the presence of a created user/id
    if (result && (result.success || result.id || result.data)) {
      return { 
        success: true, 
        message: 'Registration successful', 
        data: result.data || result 
      };
    }

    return { 
      success: false, 
      message: result?.message || 'Registration failed' 
    };

  } catch (error: any) {
    console.error("Registration Server Error:", error);
    return { 
      success: false, 
      message: error.message || 'An unexpected error occurred' 
    };
  }
};

/**
 * Handles the Login Logic
 * Updated to handle the 'token' and 'user' response seen in logs
 */
export const handleLogin = async (data: { email: string; password: string }) => {
  console.log("--- Login Attempt Started ---");
  console.log("Login Payload:", { email: data.email, password: "[HIDDEN]" });

  try {
    const result = await login(data);
    
    // Log the full result to track API changes
    console.log("API Response Result:", result);

    /**
     * LOGIC FIX: 
     * Your API returns { token, user }. 
     * We check for 'token' because 'success' was undefined in your logs.
     */
    if (result && (result.token || result.success)) {
      console.log("Login Success: Token received.");

      // 1. Save the JWT Token to cookies
      await setAuthToken(result.token);

      // 2. Save User Profile Data to cookies
      // Based on your logs, data is in 'result.user'
      const userData = result.user || result.data;
      await setUserData(userData);
      
      console.log("Auth Cookies set for user:", userData?.email);

      return {
        success: true,
        message: 'Login successful',
        data: userData
      };
    }

    // Handle case where API responds but credentials might be wrong
    console.warn("Login Failed - No token provided in response");
    return {
      success: false,
      message: result?.message || 'Invalid email or password'
    };

  } catch (error: any) {
    console.error("--- Login Server Error ---");
    console.error("Error Details:", error.message);
    
    return {
      success: false,
      message: error.message || 'An unexpected error occurred'
    };
  } finally {
    console.log("--- Login Process Finished ---");
  }
};