import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('patientToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('patientToken');
      localStorage.removeItem('patientUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const patientApi = {
  // Get patient dashboard stats
  getDashboardStats: () => api.get('/patient-app/stats'),

  // Get patient appointments
  getAppointments: () => api.get('/patient-app/appointments'),

  // Get single appointment by ID
  getAppointmentById: (id: string) => api.get(`/patient-app/appointments/${id}`),

  // Cancel appointment
  cancelAppointment: (id: string, reason?: string) =>
    api.post(`/patient-app/appointments/${id}/cancel`, { cancellationReason: reason }),

  // Get patient doctors
  getDoctors: () => api.get('/patient-app/doctors'),
};

export default api;