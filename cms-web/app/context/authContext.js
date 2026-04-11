"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/utils";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Building2, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  loginAsSuperadminApi,
  loginAsTenantApi,
} from "@/components/services/auth.service";

const AuthContext = createContext();
const AUTH_TOKEN_KEY = "cms_token";
const AUTH_ROLE_KEY = "cms_auth_role";
const AUTH_USER_KEY = "cms_auth_user";

export const AuthProvider = ({ children }) => {
  /* ===================================
        HANDLE STATE
     =================================== */
  const roles = [
    {
      id: "admin",
      label: "Admin",
      title: "Tenant Admin Login",
      description:
        "Pages, content, menus, and publishing control for a single tenant workspace.",
      href: "/client-admin",
      icon: Building2,
    },
    {
      id: "superadmin",
      label: "Superadmin",
      title: "Platform Login",
      description:
        "Tenant provisioning, platform health, domains, and top-level operations.",
      href: "/superadmin",
      icon: ShieldCheck,
    },
  ];

  const trustPoints = [
    "Single screen access for both roles",
    "Quick handoff to current dashboards",
    "Ready to connect with real API auth later",
  ];
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(
    roles.find((role) => role.id === "superadmin"),
  );

  const getRoleById = (roleId) =>
    roles.find((role) => role.id === roleId) || roles[0];

  const getDashboardByRole = (roleId) =>
    roleId === "superadmin" ? "/superadmin" : "/client-admin";

  const isProtectedPath =
    pathname?.startsWith("/superadmin") ||
    pathname?.startsWith("/client-admin");

  /* ===================================
        HANDLE FORMIK
     =================================== */
  const validationSchema = Yup.object({
    email: Yup.string().required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const initialFormikValues = {
    email: "",
    password: "",
  };

  const formik = useFormik({
    validationSchema,
    initialValues: initialFormikValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const payload = { ...values };

        const successMessage = "Login successfully";

        const res =
          activeRole.id === "superadmin"
            ? await loginAsSuperadminApi(payload)
            : await loginAsTenantApi(payload);

        if (!res?.data?.success) {
          toast.error(res?.data?.message || "Failed to login");
          return;
        }

        const roleId = activeRole.id;
        const authToken = res?.data?.data?.token;
        const user = res?.data?.data?.admin || res?.data?.data?.user || null;

        if (!authToken) {
          toast.error("Login response does not include token");
          return;
        }

        localStorage.setItem(AUTH_TOKEN_KEY, authToken);
        localStorage.setItem(AUTH_ROLE_KEY, roleId);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        setToken(authToken);
        setIsAuthenticated(true);
        setActiveRole(getRoleById(roleId));

        toast.success(res?.data?.message || successMessage);
        formik.resetForm();
        router.replace(getDashboardByRole(roleId));
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(getApiErrorMessage(error, "Failed to login"));
      }
    },
  });

  /* ===================================
        HANDLE LOGOUT
     =================================== */
  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_ROLE_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken("");
    setIsAuthenticated(false);
    setActiveRole(getRoleById("superadmin"));
    router.replace("/");
  };

  /* ===================================
        INITIAL RENDERS
     =================================== */
  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const savedRole = localStorage.getItem(AUTH_ROLE_KEY);

    if (savedToken && savedRole) {
      setToken(savedToken);
      setIsAuthenticated(true);
      setActiveRole(getRoleById(savedRole));
    }

    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading || !pathname) {
      return;
    }

    if (!isAuthenticated && isProtectedPath) {
      router.replace("/");
      return;
    }

    if (isAuthenticated && pathname === "/") {
      router.replace(getDashboardByRole(activeRole.id));
      return;
    }

    if (isAuthenticated && pathname.startsWith("/superadmin")) {
      if (activeRole.id !== "superadmin") {
        router.replace("/client-admin");
      }
      return;
    }

    if (isAuthenticated && pathname.startsWith("/client-admin")) {
      if (activeRole.id !== "admin") {
        router.replace("/superadmin");
      }
    }
  }, [activeRole.id, authLoading, isAuthenticated, isProtectedPath, pathname]);

  const shouldHideProtectedPage =
    authLoading ||
    (!isAuthenticated && isProtectedPath) ||
    (isAuthenticated &&
      ((pathname?.startsWith("/superadmin") &&
        activeRole.id !== "superadmin") ||
        (pathname?.startsWith("/client-admin") && activeRole.id !== "admin")));

  const value = {
    formik,
    activeRole,
    setActiveRole,
    authLoading,
    handleLogout,
    isAuthenticated,
    roles,
    token,
    trustPoints,
  };

  return (
    <AuthContext.Provider value={value}>
      {shouldHideProtectedPage ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
