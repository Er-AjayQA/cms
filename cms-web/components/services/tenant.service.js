import api from "./axiosInstance";

export const createTenantsApi = (data) =>
  api.post("/super-admin/tenants", data);

export const updateTenantsApi = (id, data) =>
  api.put(`/super-admin/tenants/${id}`, data);

export const updateTenantsStatusApi = (id, data) =>
  api.patch(`/super-admin/tenants/${id}`, data);

export const deleteTenantsApi = (id) => api.delete(`/super-admin/tenants/${id}`);

export const getAllTenantsApi = (search = "") =>
  api.get("/super-admin/tenants", { params: { search } });

export const getByIdTenantsApi = (id) => api.get(`/super-admin/tenants/${id}`);
