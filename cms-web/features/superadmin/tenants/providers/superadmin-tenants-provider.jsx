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
  retrySuperadminTenantProvisioning,
  updateSuperadminTenant,
  updateSuperadminTenantStatus,
} from "@/features/superadmin/tenants/services/superadmin-tenant-api";
import { getSuperadminSubscriptionPlans } from "../../subscriptions/services/superadmin-subscription-api";

const SuperadminTenantContext = createContext();

const TENANT_DATABASE_TYPE_OPTIONS = [
  { label: "Own", value: "own" },
  { label: "Managed", value: "managed" },
];

const buildTenantPayload = (values, view, record) => {
  if (view !== "edit") {
    return { ...values };
  }

  const payload = {
    companyName: values.companyName,
    slug: values.slug,
    planId: values.planId,
    dbType: values.dbType,
  };

  if (record?.actions?.canEditAdminSeed) {
    payload.adminEmail = values.adminEmail;

    if (values.adminPassword) {
      payload.adminPassword = values.adminPassword;
    }
  }

  if (values.dbType === "own") {
    payload.dbName = values.dbName;
    payload.dbHost = values.dbHost;
    payload.dbPort = values.dbPort;
    payload.dbUser = values.dbUser;
    payload.dbPassword = values.dbPassword;
    payload.currentVersion = values.currentVersion;
  }

  return payload;
};

export const SuperadminTenantProvider = ({ children }) => {
  /* ===================================
        HANDLE STATE
     =================================== */
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("listing");
  const [isListLoading, setIsListLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [isRecordLoading, setIsRecordLoading] = useState(false);
  const [plansOptions, setPlansOptions] = useState([]);
  const [isPlansLoading, setIsPlansLoading] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loadedDbType, setLoadedDbType] = useState(null);
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
    planId: "",
    dbType: "managed",
    dbName: null,
    dbHost: null,
    dbPort: null,
    dbUser: null,
    dbPassword: null,
    currentVersion: null,
  };

  const formik = useFormik({
    validationSchema,
    initialValues: initialFormikValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const payload = buildTenantPayload(values, activeView, selectedRecord);
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

  const fetchPlans = async () => {
    setIsPlansLoading(true);
    try {
      const res = await getSuperadminSubscriptionPlans(search);
      setPlansOptions(res?.data?.data || []);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(
        getApiErrorMessage(error, "Failed to load subscription plans"),
      );
    } finally {
      setIsPlansLoading(false);
    }
  };

  const fetchRecordById = async (id) => {
    setIsRecordLoading(true);
    try {
      const res = await getSuperadminTenantById(id);
      const data = res?.data?.data;
      const recordDbType = data?.database?.dbType ?? "managed";
      setSelectedRecord(data || null);

      formik.setValues({
        companyName: data?.companyName ?? "",
        slug: data?.slug ?? "",
        adminEmail: data?.adminUser?.email ?? "",
        adminPassword: "",
        planId: data?.currentSubscription?.plan?.id ?? "",
        dbType: recordDbType,
        dbName: data?.database?.dbName ?? null,
        dbHost: data?.database?.dbHost ?? null,
        dbPort: data?.database?.dbPort ?? null,
        dbUser: data?.database?.dbUser ?? null,
        dbPassword: data?.database?.dbPassword ?? null,
        currentVersion: data?.database?.currentVersion ?? null,
      });
      setLoadedDbType(recordDbType);

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
    setSelectedRecord(null);
    setLoadedDbType(null);
    formik.resetForm({ values: initialFormikValues });
  };

  const openCreateForm = () => {
    setSelectedId(null);
    setSelectedRecord(null);
    setLoadedDbType(null);
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

  const retryRecord = async (id) => {
    setIsRecordLoading(true);
    try {
      const res = await retrySuperadminTenantProvisioning(id);
      toast.success(res?.data?.message || "Tenant provisioning retried");
      await fetchRecordById(id);
      fetchRecords();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(
        getApiErrorMessage(error, "Failed to retry tenant provisioning"),
      );
    } finally {
      setIsRecordLoading(false);
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

  useEffect(() => {
    if (activeView !== "listing") fetchPlans();
  }, [activeView]);

  const value = {
    StatusToggleBadge,
    formik,
    activeView,
    closeForm,
    openCreateForm,
    openRecord,
    isListLoading,
    isRecordLoading,
    selectedRecord,
    records,
    deleteRecord,
    retryRecord,
    search,
    setSearch,
    dbTypeOptions,
    plansOptions,
    loadedDbType,
    setPlansOptions,
    isPlansLoading,
    setIsPlansLoading,
  };

  return (
    <SuperadminTenantContext.Provider value={value}>
      {children}
    </SuperadminTenantContext.Provider>
  );
};

export const useSuperadminTenant = () => useContext(SuperadminTenantContext);
