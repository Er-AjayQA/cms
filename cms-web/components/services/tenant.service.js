import api from "./axiosInstance";

export const createTenantsApi = (data) =>
  api.post("/super-admin/tenants", data);

export const getAllTenantsApi = () => api.get("/super-admin/tenants");
