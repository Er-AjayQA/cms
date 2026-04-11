import api from "./axiosInstance";

export const getAllSuperadminDashboardApi = () =>
  api.get("/super-admin/dashboard");
