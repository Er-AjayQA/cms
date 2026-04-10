"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createTenantsApi,
  getAllTenantsApi,
} from "@/components/services/tenant.service";
import {
  createSubscriptionsApi,
  getAllSubscriptionsApi,
} from "@/components/services/subscription.service";

const SubscriptionPlansContext = createContext();

export const SubscriptionPlansProvider = ({ children }) => {
  /* ===================================
        HANDLE STATE
     =================================== */
  const [mode, setMode] = useState("listing");
  const [listLoading, setListLoading] = useState(false);
  const [listingData, setListingData] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(listingData[0]);

  /* ===================================
        API HANDLING
     =================================== */
  const fetchData = async () => {
    setListLoading(true);
    try {
      const res = await getAllSubscriptionsApi();
      setListingData(res?.data?.data || []);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
    } finally {
      setListLoading(false);
    }
  };

  function StatusBadge({ status }) {
    const classes =
      status === "Active"
        ? "bg-emerald-500/15 text-emerald-700 border-emerald-600/20"
        : status === "Provisioning"
          ? "bg-amber-500/15 text-amber-700 border-amber-600/20"
          : "bg-slate-500/15 text-slate-700 border-slate-600/20";

    return <Badge className={`border ${classes}`}>{status}</Badge>;
  }

  /* ===================================
        HANDLE FORMIK
     =================================== */
  const validationSchema = Yup.object({
    companyName: Yup.string().required("Tenant name is required"),
    slug: Yup.string().required("Owner email name is required"),
    hostname: Yup.string().required("Domain is required"),
  });

  const initialFormikValues = {
    // Tenant Details
    companyName: "",
    slug: "",

    // Domain Details
    hostname: "",
    isPrimary: true,

    // DB Details
    dbName: "",
    dbHost: "",
    dbPort: "",
    dbUser: "",
    dbPassword: "",
    currentVersion: "",
  };

  const formik = useFormik({
    validationSchema,
    initialValues: initialFormikValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        console.log(values);

        if (mode === "edit") {
        }

        if (mode === "create") {
          const res = await createSubscriptionsApi(values);
        }
        toast.success(
          mode === "edit"
            ? "Tenant updated successfully"
            : "Tenant created successfully",
        );
        setMode("listing");
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(error.response?.data?.message || "Failed to save tenant");
      }
    },
  });

  /* ===================================
        HANDLE FORM OPEN/EDIT/LISTING
     =================================== */
  const handleCloseForm = () => {
    setMode("listing");
    setSelectedTenant(null);
    formik.resetForm({ values: initialFormikValues });
  };

  const handleAdd = () => {
    setSelectedTenant(null);
    formik.resetForm({ values: initialFormikValues });
    setMode("create");
  };

  const handleEdit = (tenant) => {
    setSelectedTenant(tenant);
    formik.resetForm({
      values: {
        tenant_name: tenant.name || "",
        tenant_code: tenant.code || "",
        owner_name: tenant.owner || "",
        owner_email: tenant.email || "",
        plan: tenant.plan || "",
        domain: tenant.domain || "",
        notes: tenant.notes || "",
      },
    });
    setMode("edit");
  };

  const handleView = (tenant) => {
    setSelectedTenant(tenant);
    formik.resetForm({
      values: {
        tenant_name: tenant.name || "",
        tenant_code: tenant.code || "",
        owner_name: tenant.owner || "",
        owner_email: tenant.email || "",
        plan: tenant.plan || "",
        domain: tenant.domain || "",
        notes: tenant.notes || "",
      },
    });
    setMode("edit");
  };

  /* ===================================
        INITIAL RENDERS
     =================================== */
  useEffect(() => {
    fetchData();
  }, []);

  const value = {
    StatusBadge,
    formik,
    mode,
    handleCloseForm,
    handleAdd,
    handleEdit,
    handleView,
    selectedTenant,
    setSelectedTenant,
    listLoading,
    setListLoading,
    listingData,
    setListingData,
  };

  return (
    <SubscriptionPlansContext.Provider value={value}>
      {children}
    </SubscriptionPlansContext.Provider>
  );
};

export const useSubscriptionPlans = () => useContext(SubscriptionPlansContext);
