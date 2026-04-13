import api from "@/lib/api/api-client";

export const createSuperadminDomain = (data) =>
  api.post("/super-admin/domains", data);

export const updateSuperadminDomain = (domainId, data) =>
  api.put(`/super-admin/domains/${domainId}`, data);

export const updateSuperadminDomainStatus = (domainId, data) =>
  api.patch(`/super-admin/domains/${domainId}`, data);

export const deleteSuperadminDomain = (domainId) =>
  api.delete(`/super-admin/domains/${domainId}`);

export const getSuperadminDomains = (search = "") =>
  api.get("/super-admin/domains", { params: { search } });

export const getSuperadminDomainsByTenant = (id) =>
  api.get(`/super-admin/domains/byId-tenant/${id}`);

export const verifySuperadminDomain = (domainId) =>
  api.post(`/super-admin/domains/${domainId}/verify`);

export const checkSuperadminDomainSsl = (domainId) =>
  api.post(`/super-admin/domains/${domainId}/check-ssl`);

export const getSuperadminDomainById = (domainId) =>
  api.get(`/super-admin/domains/${domainId}`);
