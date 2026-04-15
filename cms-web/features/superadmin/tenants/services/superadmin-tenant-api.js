import api from "@/lib/api/api-client";

export const createSuperadminTenant = (data) =>
  api.post("/super-admin/tenants", data);

export const updateSuperadminTenant = (tenantId, data) =>
  api.put(`/super-admin/tenants/${tenantId}`, data);

export const updateSuperadminTenantStatus = (tenantId, data) =>
  api.patch(`/super-admin/tenants/${tenantId}`, data);

export const retrySuperadminTenantProvisioning = (tenantId) =>
  api.post(`/super-admin/tenants/${tenantId}/retry-provisioning`);

export const runSuperadminTenantMigrations = (tenantId) =>
  api.post(`/super-admin/tenants/${tenantId}/run-migrations`);

export const deleteSuperadminTenant = (tenantId) =>
  api.delete(`/super-admin/tenants/${tenantId}`);

export const getSuperadminTenants = (params = {}) => {
  const normalizedParams =
    typeof params === "string" ? { search: params } : params;
  const { search = "", page = 1, limit = 10 } = normalizedParams;

  return api.get("/super-admin/tenants", { params: { search, page, limit } });
};

export const getSuperadminTenantById = (tenantId) =>
  api.get(`/super-admin/tenants/${tenantId}`);

export const getSuperadminTenantDatabasePassword = (tenantId) =>
  api.get(`/super-admin/tenants/${tenantId}/database-password`);
