import axios from "./axios";
import { API } from "./endpoints";

export const register = async ( registerData : any ) => {
    try{
        const response = await axios.post(
            API.AUTH.REGISTER, //path
            registerData //body data
        );
        return response.data; // what controller from backend sends
    } catch (err: Error | any) {
        throw new Error(
            // 400-500 err code counts as exception
            err.response?.data?.message // log error message from backend
             || err.message // default error message
             || "Registration failed" //fallback message if default fails
        );
    };
}

export const login = async ( loginData : any ) => {
    try{
        const response = await axios.post(
            API.AUTH.LOGIN, //path=
            loginData //body data
        );
        return response.data; // what controller from backend sends
    } catch (err: Error | any) {
        throw new Error(
            // 400-500 err code counts as exception
            err.response?.data?.message // log error message from backend
             || err.message // default error message
             || "Login failed" //fallback message if default fails
        );
    };
}

export const whoami = async () => {
    try{
        const response = await axios.get(
            API.AUTH.WHOAMI //path
        );
        return response.data; // what controller from backend sends
    } catch (err: Error | any) {
        throw new Error(
            // 400-500 err code counts as exception
            err.response?.data?.message // log error message from backend
             || err.message // default error message
             || "Fetching user info failed" //fallback message if default fails
        );
    };
}

export const updateProfile = async (updateData: FormData) => {
    try {
        const response = await axios.put(
            API.AUTH.UPDATEPROFILE, 
            updateData, 
            { 
                headers: { 
                    // Axios automatically sets the boundary for FormData
                    'Content-Type': 'multipart/form-data' 
                },
                // If you are using cookies for sessions:
                withCredentials: true 
            }
        );
        
        return {
            success: true,
            data: response.data.user || response.data, // adjust based on your backend structure
            message: response.data.message || "Profile updated successfully"
        };
    }
    catch (err: any) {
        // Log the actual error for debugging
        console.error("Axios Update Error:", err.response?.data || err.message);
        
        return {
            success: false,
            message: err.response?.data?.message || err.message || "Profile update failed"
        };
    };
}