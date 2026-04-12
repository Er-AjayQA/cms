"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/utils";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { loginAsSuperadminApi } from "@/features/superadmin/auth/services/superadmin-auth-api";

const SuperadminAuthContext = createContext();
const AUTH_TOKEN_KEY = "cms_token";
const AUTH_ROLE_KEY = "cms_auth_role";
const AUTH_USER_KEY = "cms_auth_user";

export const SuperadminAuthProvider = ({ children }) => {
  const roles = [
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
    "Focused superadmin access only",
    "Tenant provisioning and platform control",
    "Tenant/site builder paused for a later phase",
  ];

  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(roles[0]);

  const getRoleById = (roleId) =>
    roles.find((role) => role.id === roleId) || roles[0];

  const isProtectedPath = pathname?.startsWith("/superadmin");

  const validationSchema = Yup.object({
    email: Yup.string().required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    validationSchema,
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      try {
        const res = await loginAsSuperadminApi(values);

        if (!res?.data?.success) {
          toast.error(res?.data?.message || "Failed to login");
          return;
        }

        const authToken = res?.data?.data?.token;
        const user = res?.data?.data?.admin || res?.data?.data?.user || null;

        if (!authToken) {
          toast.error("Login response does not include token");
          return;
        }

        localStorage.setItem(AUTH_TOKEN_KEY, authToken);
        localStorage.setItem(AUTH_ROLE_KEY, "superadmin");
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        setToken(authToken);
        setIsAuthenticated(true);
        setActiveRole(getRoleById("superadmin"));

        toast.success(res?.data?.message || "Login successfully");
        formik.resetForm();
        router.replace("/superadmin");
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(getApiErrorMessage(error, "Failed to login"));
      }
    },
  });

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_ROLE_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken("");
    setIsAuthenticated(false);
    setActiveRole(getRoleById("superadmin"));
    router.replace("/");
  };

  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const savedRole = localStorage.getItem(AUTH_ROLE_KEY);

    if (savedToken && savedRole === "superadmin") {
      setToken(savedToken);
      setIsAuthenticated(true);
      setActiveRole(getRoleById(savedRole));
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_ROLE_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
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
      router.replace("/superadmin");
    }
  }, [authLoading, isAuthenticated, isProtectedPath, pathname, router]);

  const shouldHideProtectedPage =
    authLoading || (!isAuthenticated && isProtectedPath);

  const value = {
    activeRole,
    authLoading,
    formik,
    handleLogout,
    isAuthenticated,
    roles,
    setActiveRole,
    token,
    trustPoints,
  };

  return (
    <SuperadminAuthContext.Provider value={value}>
      {shouldHideProtectedPage ? null : children}
    </SuperadminAuthContext.Provider>
  );
};

export const useSuperadminAuth = () => useContext(SuperadminAuthContext);

