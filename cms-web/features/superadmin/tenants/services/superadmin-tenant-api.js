import api from "@/lib/api/api-client";

export const createSuperadminTenant = (data) =>
  api.post("/super-admin/tenants", data);

export const updateSuperadminTenant = (tenantId, data) =>
  api.put(`/super-admin/tenants/${tenantId}`, data);

export const updateSuperadminTenantStatus = (tenantId, data) =>
  api.patch(`/super-admin/tenants/${tenantId}`, data);

export const retrySuperadminTenantProvisioning = (tenantId) =>
  api.post(`/super-admin/tenants/${tenantId}/retry-provisioning`);

export const deleteSuperadminTenant = (tenantId) =>
  api.delete(`/super-admin/tenants/${tenantId}`);

export const getSuperadminTenants = (search = "") =>
  api.get("/super-admin/tenants", { params: { search } });

export const getSuperadminTenantById = (tenantId) =>
  api.get(`/super-admin/tenants/${tenantId}`);
