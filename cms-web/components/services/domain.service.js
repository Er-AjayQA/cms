import api from "./axiosInstance";

export const createDomainsApi = (data) =>
  api.post("/super-admin/domains", data);

export const updateDomainsApi = (id, data) =>
  api.put(`/super-admin/domains/${id}`, data);

export const updateDomainsStatusApi = (id, data) =>
  api.patch(`/super-admin/domains/${id}`, data);

export const deleteDomainsApi = (id) => api.delete(`/super-admin/domains/${id}`);

export const getAllDomainsApi = (search = "") =>
  api.get("/super-admin/domains", { params: { search } });

export const getByIdDomainsApi = (id) => api.get(`/super-admin/domains/${id}`);
