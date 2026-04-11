"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatAmount, getApiErrorMessage } from "@/lib/utils";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createSubscriptionsApi,
  deleteSubscriptionsStatusApi,
  getAllSubscriptionsApi,
  getByIdSubscriptionsApi,
  updateSubscriptionsApi,
  updateSubscriptionsStatusApi,
} from "@/components/services/subscription.service";
import { Building2, ShieldCheck } from "lucide-react";
import {
  loginAsSuperadminApi,
  loginAsTenantApi,
} from "@/components/services/auth.service";

const AuthContext = createContext();

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
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeRole, setActiveRole] = useState(
    roles.find((role) => role.id === "superadmin"),
  );

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

        toast.success(res?.data?.message || successMessage);
        formik.resetForm();
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(getApiErrorMessage(error, "Failed to login"));
      }
    },
  });

  /* ===================================
        API HANDLING
     =================================== */

  /* ===================================
        HANDLE FORM OPEN/EDIT/LISTING
     =================================== */

  /* ===================================
        HELPERS
     =================================== */
  const StatusBadge = ({ id, status }) => {
    const classes =
      status?.toLowerCase() === "active"
        ? "bg-emerald-500/15 text-emerald-700 border-emerald-600/20"
        : status?.toLowerCase() === "provisioning"
          ? "bg-amber-500/15 text-amber-700 border-amber-600/20"
          : "bg-slate-500/15 text-slate-700 border-slate-600/20";

    return (
      <Badge
        className={`border cursor-pointer ${classes}`}
        onClick={() => handleUpdateStatus(id, status)}
      >
        {status}
      </Badge>
    );
  };

  const codeBadge = (code) => {
    const classes = "bg-emerald-500/15 text-emerald-700 border-emerald-600/20";

    return <Badge className={`border ${classes}`}>{code}</Badge>;
  };

  /* ===================================
        INITIAL RENDERS
     =================================== */

  const value = {
    formik,
    activeRole,
    setActiveRole,
    codeBadge,
    StatusBadge,
    roles,
    trustPoints,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
