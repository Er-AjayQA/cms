import api from "@/lib/api/api-client";

export const getSuperadminDashboard = () => api.get("/super-admin/dashboard");
