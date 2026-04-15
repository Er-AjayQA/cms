import api from "@/lib/api/api-client";

export const getSuperadminAccessMe = () => api.get("/super-admin/access/me");

export const getSuperadminMenus = () => api.get("/super-admin/access/menus");

export const getSuperadminRoles = () => api.get("/super-admin/access/roles");

export const createSuperadminRole = (data) =>
  api.post("/super-admin/access/roles", data);

export const updateSuperadminRole = (id, data) =>
  api.put(`/super-admin/access/roles/${id}`, data);

export const deleteSuperadminRole = (id) =>
  api.delete(`/super-admin/access/roles/${id}`);

export const getSuperadminUsers = (search = "") =>
  api.get("/super-admin/access/users", { params: { search } });

export const createSuperadminUser = (data) =>
  api.post("/super-admin/access/users", data);

export const updateSuperadminUser = (id, data) =>
  api.put(`/super-admin/access/users/${id}`, data);

export const deleteSuperadminUser = (id) =>
  api.delete(`/super-admin/access/users/${id}`);
