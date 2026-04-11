"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/utils";
import {
  createTenantsApi,
  deleteTenantsApi,
  getAllTenantsApi,
  getByIdTenantsApi,
  updateTenantsApi,
  updateTenantsStatusApi,
} from "@/components/services/tenant.service";

const TenantSuperadminContext = createContext();

export const TenantSuperadminProvider = ({ children }) => {
  /* ===================================
        HANDLE STATE
     =================================== */
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("listing");
  const [listLoading, setListLoading] = useState(false);
  const [listingData, setListingData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [roleOptions, setRoleOptions] = useState([
    { label: "Owner", value: "owner" },
    { label: "Admin", value: "admin" },
    { label: "Editor", value: "editor" },
  ]);
  const [subscriptionStatusOptions, setSubscriptionStatusOptions] = useState([
    { label: "Trial", value: "trial" },
    { label: "Active", value: "active" },
    { label: "Cancelled", value: "cancelled" },
  ]);
  const [sourceOptions, setSourceOptions] = useState([
    { label: "Control Panel", value: "control_panel" },
  ]);
  const [dbTypeOptions, setDbTypeOptions] = useState([
    { label: "Own", value: "own" },
    { label: "Managed", value: "managed" },
  ]);

  /* ===================================
        HANDLE FORMIK
     =================================== */
  const validationSchema = Yup.object({
    companyName: Yup.string().required("Tenant name is required"),
    adminEmail: Yup.string()
      .email("Valid email is required")
      .when([], {
        is: () => mode === "create",
        then: (schema) => schema.required("Admin email is required"),
        otherwise: (schema) => schema,
      }),
    adminPassword: Yup.string().when([], {
      is: () => mode === "create",
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
        console.log("PAYLOAD====>", payload);
        const successMessage =
          mode === "edit"
            ? "Tenant updated successfully"
            : "Tenant created successfully";
        const res =
          mode === "edit"
            ? await updateTenantsApi(selectedRecordId, payload)
            : await createTenantsApi(payload);

        if (!res?.data?.success) {
          toast.error(res?.data?.message || "Failed to save tenant");
          return;
        }

        handleCloseForm();
        fetchData();
        toast.success(res?.data?.message || successMessage);
        setMode("listing");
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(getApiErrorMessage(error, "Failed to save tenant"));
      }
    },
  });

  /* ===================================
        API HANDLING
     =================================== */
  const fetchData = async () => {
    setListLoading(true);
    try {
      const res = await getAllTenantsApi(search);
      setListingData(res?.data?.data || []);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load tenants"));
    } finally {
      setListLoading(false);
    }
  };

  const fetchDataById = async (id) => {
    setDataLoading(true);
    try {
      const res = await getByIdTenantsApi(id);
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
      setDataLoading(false);
    }
  };

  /* ===================================
        HANDLE FORM OPEN/EDIT/LISTING
     =================================== */
  const handleCloseForm = () => {
    setMode("listing");
    setSelectedRecordId(null);
    formik.resetForm({ values: initialFormikValues });
  };

  const handleAdd = () => {
    setSelectedRecordId(null);
    formik.resetForm({ values: initialFormikValues });
    setMode("create");
  };

  const handleGetData = async (id, type) => {
    setSelectedRecordId(id);
    const isDataLoaded = await fetchDataById(id);

    if (isDataLoaded) {
      setMode(type);
    }
  };

  const handleDeleteData = async (id) => {
    try {
      const res = await deleteTenantsApi(id);
      toast.success(res?.data?.message);
      fetchData();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to delete tenant"));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await updateTenantsStatusApi(id, { status });
      toast.success(res?.data?.message);
      fetchData();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to update tenant status"));
    }
  };

  /* ===================================
        HELPERS
     =================================== */
  const StatusBadge = ({ id, status }) => {
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
        onClick={() => handleUpdateStatus(id, status)}
      >
        {status}
      </Badge>
    );
  };

  /* ===================================
        INITIAL RENDERS
     =================================== */
  useEffect(() => {
    fetchData();
  }, [search]);

  const value = {
    StatusBadge,
    formik,
    mode,
    setMode,
    handleCloseForm,
    handleAdd,
    handleGetData,
    selectedRecordId,
    setSelectedRecordId,
    listLoading,
    setListLoading,
    dataLoading,
    setDataLoading,
    listingData,
    setListingData,
    handleDeleteData,
    handleUpdateStatus,
    search,
    setSearch,
    roleOptions,
    setRoleOptions,
    subscriptionStatusOptions,
    setSubscriptionStatusOptions,
    sourceOptions,
    setSourceOptions,
    dbTypeOptions,
    setDbTypeOptions,
  };

  return (
    <TenantSuperadminContext.Provider value={value}>
      {children}
    </TenantSuperadminContext.Provider>
  );
};

export const useTenantSuperadmin = () => useContext(TenantSuperadminContext);
