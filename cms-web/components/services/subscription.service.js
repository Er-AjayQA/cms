import api from "./axiosInstance";

export const createSubscriptionsApi = (data) =>
  api.post("/super-admin/subscription-plans", data);

export const updateSubscriptionsApi = (id, data) =>
  api.put(`/super-admin/subscription-plans/${id}`, data);

export const updateSubscriptionsStatusApi = (id, data) =>
  api.patch(`/super-admin/subscription-plans/${id}`, data);

export const deleteSubscriptionsStatusApi = (id) =>
  api.delete(`/super-admin/subscription-plans/${id}`);

export const getAllSubscriptionsApi = (search) =>
  api.get("/super-admin/subscription-plans", { params: { search } });

export const getByIdSubscriptionsApi = (id) =>
  api.get(`/super-admin/subscription-plans/${id}`);
