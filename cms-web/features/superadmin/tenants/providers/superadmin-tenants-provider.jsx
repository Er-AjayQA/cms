"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/utils";
import {
  createSuperadminTenant,
  deleteSuperadminTenant,
  getSuperadminTenants,
  getSuperadminTenantById,
  updateSuperadminTenant,
  updateSuperadminTenantStatus,
} from "@/features/superadmin/tenants/services/superadmin-tenant-api";

const SuperadminTenantContext = createContext();

const TENANT_ROLE_OPTIONS = [
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
];

const TENANT_SUBSCRIPTION_STATUS_OPTIONS = [
  { label: "Trial", value: "trial" },
  { label: "Active", value: "active" },
  { label: "Cancelled", value: "cancelled" },
];

const TENANT_ONBOARDING_SOURCE_OPTIONS = [
  { label: "Control Panel", value: "control_panel" },
];

const TENANT_DATABASE_TYPE_OPTIONS = [
  { label: "Own", value: "own" },
  { label: "Managed", value: "managed" },
];

export const SuperadminTenantProvider = ({ children }) => {
  /* ===================================
        HANDLE STATE
     =================================== */
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("listing");
  const [isListLoading, setIsListLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [isRecordLoading, setIsRecordLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const roleOptions = TENANT_ROLE_OPTIONS;
  const subscriptionStatusOptions = TENANT_SUBSCRIPTION_STATUS_OPTIONS;
  const sourceOptions = TENANT_ONBOARDING_SOURCE_OPTIONS;
  const dbTypeOptions = TENANT_DATABASE_TYPE_OPTIONS;

  /* ===================================
        HANDLE FORMIK
     =================================== */
  const validationSchema = Yup.object({
    companyName: Yup.string().required("Tenant name is required"),
    adminEmail: Yup.string()
      .email("Valid email is required")
      .when([], {
        is: () => activeView === "create",
        then: (schema) => schema.required("Admin email is required"),
        otherwise: (schema) => schema,
      }),
    adminPassword: Yup.string().when([], {
      is: () => activeView === "create",
      then: (schema) => schema.required("Admin password is required"),
      otherwise: (schema) => schema,
    }),
  });

  const initialFormikValues = {
    companyName: "",
    slug: null,
    adminEmail: "",
    adminPassword: "",
    subscription_status: "trial",
    onboarding_source: "control_panel",
    role: "owner",
    dbType: "managed",
    dbName: null,
    dbHost: null,
    dbPort: null,
    dbUser: null,
    dbPassword: null,
    currentVersion: null,
    dbStatus: "",
    dbProvisionSource: "",
  };

  const formik = useFormik({
    validationSchema,
    initialValues: initialFormikValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const payload = { ...values };
        const successMessage =
          activeView === "edit"
            ? "Tenant updated successfully"
            : "Tenant created successfully";
        const res =
          activeView === "edit"
            ? await updateSuperadminTenant(selectedId, payload)
            : await createSuperadminTenant(payload);

        if (!res?.data?.success) {
          toast.error(res?.data?.message || "Failed to save tenant");
          return;
        }

        closeForm();
        fetchRecords();
        toast.success(res?.data?.message || successMessage);
        setActiveView("listing");
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(getApiErrorMessage(error, "Failed to save tenant"));
      }
    },
  });

  /* ===================================
        API HANDLING
     =================================== */
  const fetchRecords = async () => {
    setIsListLoading(true);
    try {
      const res = await getSuperadminTenants(search);
      setRecords(res?.data?.data || []);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load tenants"));
    } finally {
      setIsListLoading(false);
    }
  };

  const fetchRecordById = async (id) => {
    setIsRecordLoading(true);
    try {
      const res = await getSuperadminTenantById(id);
      const data = res?.data?.data;

      formik.setValues({
        companyName: data?.companyName ?? "",
        slug: data?.slug ?? "",
        adminEmail: data?.adminUser?.email ?? "",
        adminPassword: "",
        subscription_status: data?.subscription_status ?? "trial",
        onboarding_source: data?.onboarding_source ?? "control_panel",
        role: data?.adminUser?.role ?? "owner",
        dbType: data?.database?.dbType ?? "managed",
        dbName: data?.database?.dbName ?? "",
        dbHost: data?.database?.dbHost ?? "",
        dbPort: data?.database?.dbPort ?? "",
        dbUser: data?.database?.dbUser ?? "",
        dbPassword: data?.database?.dbPassword ?? "",
        currentVersion: data?.database?.currentVersion ?? "",
        dbStatus: data?.database?.status ?? "",
        dbProvisionSource: data?.database?.provisionSource ?? "",
      });

      return true;
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load tenant"));
      return false;
    } finally {
      setIsRecordLoading(false);
    }
  };

  /* ===================================
        HANDLE FORM OPEN/EDIT/LISTING
     =================================== */
  const closeForm = () => {
    setActiveView("listing");
    setSelectedId(null);
    formik.resetForm({ values: initialFormikValues });
  };

  const openCreateForm = () => {
    setSelectedId(null);
    formik.resetForm({ values: initialFormikValues });
    setActiveView("create");
  };

  const openRecord = async (id, type) => {
    setSelectedId(id);
    const isDataLoaded = await fetchRecordById(id);

    if (isDataLoaded) {
      setActiveView(type);
    }
  };

  const deleteRecord = async (id) => {
    try {
      const res = await deleteSuperadminTenant(id);
      toast.success(res?.data?.message);
      fetchRecords();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to delete tenant"));
    }
  };

  const toggleRecordStatus = async (id, status) => {
    try {
      const res = await updateSuperadminTenantStatus(id, { status });
      toast.success(res?.data?.message);
      fetchRecords();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to update tenant status"));
    }
  };

  /* ===================================
        HELPERS
     =================================== */
  const StatusToggleBadge = ({ id, status }) => {
    const normalizedStatus = status?.toLowerCase();
    const classes =
      normalizedStatus === "active"
        ? "bg-emerald-500/15 text-emerald-700 border-emerald-600/20"
        : normalizedStatus === "provisioning"
          ? "bg-amber-500/15 text-amber-700 border-amber-600/20"
          : normalizedStatus === "failed" || normalizedStatus === "suspended"
            ? "bg-red-500/15 text-red-700 border-red-600/20"
            : "bg-slate-500/15 text-slate-700 border-slate-600/20";

    return (
      <Badge
        className={`border cursor-pointer ${classes}`}
        onClick={() => toggleRecordStatus(id, status)}
      >
        {status}
      </Badge>
    );
  };

  /* ===================================
        INITIAL RENDERS
     =================================== */
  useEffect(() => {
    fetchRecords();
  }, [search]);

  const value = {
    StatusToggleBadge,
    formik,
    activeView,
    closeForm,
    openCreateForm,
    openRecord,
    isListLoading,
    isRecordLoading,
    records,
    deleteRecord,
    search,
    setSearch,
    roleOptions,
    subscriptionStatusOptions,
    sourceOptions,
    dbTypeOptions,
  };

  return (
    <SuperadminTenantContext.Provider value={value}>
      {children}
    </SuperadminTenantContext.Provider>
  );
};

export const useSuperadminTenant = () => useContext(SuperadminTenantContext);


