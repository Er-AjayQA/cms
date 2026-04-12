import api from "@/lib/api/api-client";

export const loginAsSuperadminApi = (data) =>
  api.post("/super-admin/auth/login", data);

