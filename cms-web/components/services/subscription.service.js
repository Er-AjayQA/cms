import api from "./axiosInstance";

export const createSubscriptionsApi = (data) =>
  api.post("/super-admin/subscription-plans", data);

export const getAllSubscriptionsApi = () =>
  api.get("/super-admin/subscription-plans");
