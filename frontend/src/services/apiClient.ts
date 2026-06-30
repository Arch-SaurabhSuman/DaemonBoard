import axios from 'axios';

// Create a configured Axios instance
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies/session if required by Go backend
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('db_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiration (401 Unauthorized) and auto refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // If code is specifically TOKEN_EXPIRED, we attempt refresh
      if (error.response.data && error.response.data.code === 'TOKEN_EXPIRED') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('db_refresh_token');
        if (refreshToken) {
          try {
            // Call refresh endpoint directly using a separate axios call to avoid interceptor recursion
            const response = await axios.post('/api/v1/auth/refresh', { refreshToken });
            const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem('db_token', newAccessToken);
            localStorage.setItem('db_refresh_token', newRefreshToken);

            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            isRefreshing = false;

            return apiClient(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;

            // Clear session and redirect to login
            localStorage.removeItem('db_token');
            localStorage.removeItem('db_refresh_token');
            localStorage.removeItem('db_user');
            localStorage.removeItem('db_mock_mode');
            if (!window.location.pathname.startsWith('/login')) {
              window.location.href = '/login?expired=true';
            }
            return Promise.reject(refreshError);
          }
        }
      }

      // If not token expiration, clear tokens and redirect to login
      localStorage.removeItem('db_token');
      localStorage.removeItem('db_refresh_token');
      localStorage.removeItem('db_user');
      localStorage.removeItem('db_mock_mode');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
