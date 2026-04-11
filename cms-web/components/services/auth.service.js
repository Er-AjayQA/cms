import api from "./axiosInstance";

export const loginAsSuperadminApi = (data) =>
  api.post("/super-admin/auth/login", data);

export const loginAsTenantApi = (data) => api.post("/tenant/auth/login", data);
