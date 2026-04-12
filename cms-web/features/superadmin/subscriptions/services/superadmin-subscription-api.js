import api from "@/lib/api/api-client";

export const createSuperadminSubscriptionPlan = (data) =>
  api.post("/super-admin/subscription-plans", data);

export const updateSuperadminSubscriptionPlan = (planId, data) =>
  api.put(`/super-admin/subscription-plans/${planId}`, data);

export const updateSuperadminSubscriptionPlanStatus = (planId, data) =>
  api.patch(`/super-admin/subscription-plans/${planId}`, data);

export const deleteSuperadminSubscriptionPlan = (planId) =>
  api.delete(`/super-admin/subscription-plans/${planId}`);

export const getSuperadminSubscriptionPlans = (search = "") =>
  api.get("/super-admin/subscription-plans", { params: { search } });

export const getSuperadminSubscriptionPlanById = (planId) =>
  api.get(`/super-admin/subscription-plans/${planId}`);
