export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    REFRESH: "/api/auth/refresh",
  },
  COURSES: "/api/courses",
} as const;
