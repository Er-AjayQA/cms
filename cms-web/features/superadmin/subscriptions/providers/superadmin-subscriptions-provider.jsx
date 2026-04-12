"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatAmount, getApiErrorMessage } from "@/lib/utils";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createSuperadminSubscriptionPlan,
  deleteSuperadminSubscriptionPlan,
  getSuperadminSubscriptionPlans,
  getSuperadminSubscriptionPlanById,
  updateSuperadminSubscriptionPlan,
  updateSuperadminSubscriptionPlanStatus,
} from "@/features/superadmin/subscriptions/services/superadmin-subscription-api";

const SuperadminSubscriptionContext = createContext();

const BILLING_CYCLE_OPTIONS = [
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
  { label: "Lifetime", value: "lifetime" },
];

export const SuperadminSubscriptionProvider = ({ children }) => {
  /* ===================================
        HANDLE STATE
     =================================== */
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("listing");
  const [isListLoading, setIsListLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [isRecordLoading, setIsRecordLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const billingCycleOptions = BILLING_CYCLE_OPTIONS;

  /* ===================================
        HANDLE FORMIK
     =================================== */
  const validationSchema = Yup.object({
    name: Yup.string().required("Plan name is required"),
    code: Yup.string().required("Code is required"),
    price: Yup.string().required("Price is required"),
    billing_cycle: Yup.string().required("Billing cycle is required"),
  });

  const initialFormikValues = {
    name: "",
    code: "",
    price: "",
    billing_cycle: "monthly",
    max_pages: "",
    max_users: "",
    max_storage_gb: "",
    trial_days: "",
    description: "",
  };

  const formik = useFormik({
    validationSchema,
    initialValues: initialFormikValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const payload = { ...values };

        payload.price = formatAmount(payload.price, { fallback: "0.00" });

        if (!payload.max_pages) {
          payload.max_pages = 0;
        }
        if (!payload.max_users) {
          payload.max_users = 0;
        }
        if (!payload.max_storage_gb) {
          payload.max_storage_gb = 0;
        }
        if (!payload.trial_days) {
          payload.trial_days = 0;
        }

        const successMessage =
          activeView === "edit"
            ? "Plan updated successfully"
            : "Plan created successfully";
        const res =
          activeView === "edit"
            ? await updateSuperadminSubscriptionPlan(selectedId, payload)
            : await createSuperadminSubscriptionPlan(payload);

        if (!res?.data?.success) {
          toast.error(res?.data?.message || "Failed to save plan");
          return;
        }

        closeForm();
        fetchRecords();
        toast.success(res?.data?.message || successMessage);
        setActiveView("listing");
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(getApiErrorMessage(error, "Failed to save plan"));
      }
    },
  });

  /* ===================================
        API HANDLING
     =================================== */
  const fetchRecords = async () => {
    setIsListLoading(true);
    try {
      const res = await getSuperadminSubscriptionPlans(search);
      setRecords(res?.data?.data || []);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
    } finally {
      setIsListLoading(false);
    }
  };

  const fetchRecordById = async (id) => {
    setIsRecordLoading(true);
    try {
      const res = await getSuperadminSubscriptionPlanById(id);
      let data = res?.data?.data;

      formik.setValues({
        name: data?.name ?? "",
        code: data?.code ?? "",
        price: formatAmount(data?.price),
        billing_cycle: data?.billing_cycle ?? "monthly",
        max_pages: data?.max_pages ?? "",
        max_users: data?.max_users ?? "",
        max_storage_gb: data?.max_storage_gb ?? "",
        trial_days: data?.trial_days ?? "",
        description: data?.description ?? "",
      });

      return true;
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load plan"));
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
      const res = await deleteSuperadminSubscriptionPlan(id);
      toast.success(res?.data?.message);
      fetchRecords();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to delete plan"));
    }
  };

  const toggleRecordStatus = async (id, status) => {
    try {
      const res = await updateSuperadminSubscriptionPlanStatus(id, { status });
      toast.success(res?.data?.message);
      fetchRecords();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to update status"));
    }
  };

  /* ===================================
        HELPERS
     =================================== */
  const StatusToggleBadge = ({ id, status }) => {
    const classes =
      status?.toLowerCase() === "active"
        ? "bg-emerald-500/15 text-emerald-700 border-emerald-600/20"
        : status?.toLowerCase() === "provisioning"
          ? "bg-amber-500/15 text-amber-700 border-amber-600/20"
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

  const codeBadge = (code) => {
    const classes = "bg-emerald-500/15 text-emerald-700 border-emerald-600/20";

    return <Badge className={`border ${classes}`}>{code}</Badge>;
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
    billingCycleOptions,
    codeBadge,
    deleteRecord,
    search,
    setSearch,
  };

  return (
    <SuperadminSubscriptionContext.Provider value={value}>
      {children}
    </SuperadminSubscriptionContext.Provider>
  );
};

export const useSuperadminSubscription = () => useContext(SuperadminSubscriptionContext);


