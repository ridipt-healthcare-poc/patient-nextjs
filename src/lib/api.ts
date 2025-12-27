import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
  getDashboardStats: () => api.get('/api/patient-app/stats'),

  // Get patient appointments
  getAppointments: () => api.get('/api/patient-app/appointments'),

  // Get single appointment by ID
  getAppointmentById: (id: string) => api.get(`/api/patient-app/appointments/${id}`),

  // Cancel appointment
  cancelAppointment: (id: string, reason?: string) =>
    api.post(`/api/patient-app/appointments/${id}/cancel`, { cancellationReason: reason }),

  // Get patient doctors
  getDoctors: () => api.get('/api/patient-app/doctors'),

  // Get patient facilities
  getFacilities: () => api.get('/api/patient-app/facilities'),

  // Get doctors by facility
  getDoctorsByFacility: (facilityId: string) => api.get(`/api/patient-app/facilities/${facilityId}/doctors`),

  // Get doctor slots for a specific date
  getDoctorSlots: (doctorId: string, date: string) => api.get(`/api/patient-app/doctors/${doctorId}/slots`, { params: { date } }),

  // Create appointment
  createAppointment: (appointmentData: any) => api.post('/api/patient-app/appointments', appointmentData),

  // Get patient profile
  getProfile: () => api.get('/api/patient-app/profile'),

  // Update patient profile
  updateProfile: (profileData: any) => api.put('/api/patient-app/profile', profileData),
};

export default api;