import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("rimn_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("rimn_token");
      localStorage.removeItem("rimn_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: { email: string; full_name: string; password: string; role: string }) =>
    api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  updateProfile: (data: any) => api.put("/auth/profile", data),
};

// ── Inference ─────────────────────────────────────────────────────────────────
export const inferenceApi = {
  grade: (formData: FormData) =>
    api.post("/inference/grade", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getResult: (submissionId: string) =>
    api.get(`/inference/result/${submissionId}`),
  askQuestion: (data: FormData) => api.post("/inference/ask-question", data),
};

// ── Submissions ───────────────────────────────────────────────────────────────
export const submissionsApi = {
  list: (limit = 20, offset = 0) =>
    api.get(`/submissions/?limit=${limit}&offset=${offset}`),
  get: (id: string) => api.get(`/submissions/${id}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  student: () => api.get("/analytics/student"),
  teacher: () => api.get("/analytics/teacher"),
};

// ── Assignments ──────────────────────────────────────────────────────────────
export const assignmentsApi = {
  create: (data: any) => api.post("/assignments/", data),
  list: () => api.get("/assignments/"),
};

// ── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: () => api.get("/notifications/"),
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post("/notifications/mark-all-read"),
  unreadCount: () => api.get("/notifications/unread-count"),
};

