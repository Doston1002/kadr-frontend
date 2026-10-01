import axios from "axios";
import { useAuthStore } from "./store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const { token, expiresAt } = useAuthStore.getState();
    if (expiresAt && Date.now() > expiresAt) {
      useAuthStore.getState().logout();
      return config;
    }
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      useAuthStore.getState().logout();
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }),
  me: () => api.get("/auth/me"),
};

export const employeesApi = {
  list: (params?: Record<string, string>) => api.get("/employees", { params }),
  get: (id: string) => api.get(`/employees/${id}`),
  create: (data: Record<string, unknown>) => api.post("/employees", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/employees/${id}`, data),
  uploadPhoto: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return api.post(`/employees/${id}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers["Content-Type"];
          }
          return data;
        },
      ],
    });
  },
  delete: (id: string) => api.delete(`/employees/${id}`),
};

export const departmentsApi = {
  list: () => api.get("/departments"),
  create: (data: { name: string; description?: string }) =>
    api.post("/departments", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

export const schedulesApi = {
  list: () => api.get("/schedules"),
  create: (data: Record<string, unknown>) => api.post("/schedules", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/schedules/${id}`, data),
  delete: (id: string) => api.delete(`/schedules/${id}`),
};

export const attendanceApi = {
  today: () => api.get("/attendance/today"),
  history: (employeeId: string, params?: Record<string, string>) =>
    api.get("/attendance/history", { params: { employeeId, ...params } }),
  report: (params?: Record<string, string>) =>
    api.get("/attendance/report", { params }),
  dashboard: () => api.get("/attendance/dashboard"),
  weekly: () => api.get("/attendance/weekly"),
  map: (date?: string) => api.get("/attendance/map", { params: { date } }),
  pendingComments: () => api.get("/attendance/pending-comments"),
  updateComment: (attendanceId: string, comment: string) =>
    api.put("/attendance/comment", { attendanceId, comment }),
};

export const settingsApi = {
  get: () => api.get("/settings"),
  update: (data: Record<string, unknown>) => api.put("/settings", data),
};

export const photosApi = {
  list: (params?: Record<string, string>) => api.get("/photos", { params }),
};
