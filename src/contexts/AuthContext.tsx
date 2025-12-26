'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    sendOTP: (mobile: string) => Promise<void>;
    loginWithOTP: (mobile: string, otp: string) => Promise<void>;
    signup: (userData: SignupData) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

interface SignupData {
    name: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('patientToken');
        const storedUser = localStorage.getItem('patientUser');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const sendOTP = async (mobile: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/patients/auth/send-otp`, { mobile });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const loginWithOTP = async (mobile: string, otp: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/patients/auth/verify-otp`, { mobile, otp });
            const { token: newToken, patient } = response.data;

            setToken(newToken);
            setUser(patient);

            localStorage.setItem('patientToken', newToken);
            localStorage.setItem('patientUser', JSON.stringify(patient));
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } catch (error) {
            throw error;
        }
    };

    const signup = async (userData: SignupData) => {
        try {
            // Map frontend field names to backend expected names
            const patientData = {
                fullName: userData.name,
                email: userData.email,
                mobile: userData.phone,
                gender: userData.gender,
                dateOfBirth: userData.dateOfBirth,
                // Add default facilityId and facilityType - you may need to adjust these
                facilityId: "675b0a0b9f8e4c001234abcd", // Replace with actual facility ID
                facilityType: "Hospital" // or "Clinic"
            };

            const response = await axios.post(`${API_BASE_URL}/api/patients`, patientData, {
                headers: {
                    'Authorization': `Bearer YOUR_FACILITY_TOKEN` // You'll need facility auth for creating patients
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('patientToken');
        localStorage.removeItem('patientUser');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, sendOTP, loginWithOTP, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
