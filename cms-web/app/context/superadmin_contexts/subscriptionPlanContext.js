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

const SubscriptionPlansContext = createContext();

export const SubscriptionPlansProvider = ({ children }) => {
  /* ===================================
        HANDLE STATE
     =================================== */
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("listing");
  const [listLoading, setListLoading] = useState(false);
  const [listingData, setListingData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [billingCycleOptions, setBillingCycleOptions] = useState([
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
    { label: "Lifetime", value: "lifetime" },
  ]);

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
          mode === "edit"
            ? "Plan updated successfully"
            : "Plan created successfully";
        const res =
          mode === "edit"
            ? await updateSubscriptionsApi(selectedRecordId, payload)
            : await createSubscriptionsApi(payload);

        if (!res?.data?.success) {
          toast.error(res?.data?.message || "Failed to save plan");
          return;
        }

        handleCloseForm();
        fetchData();
        toast.success(res?.data?.message || successMessage);
        setMode("listing");
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(getApiErrorMessage(error, "Failed to save plan"));
      }
    },
  });

  /* ===================================
        API HANDLING
     =================================== */
  const fetchData = async () => {
    setListLoading(true);
    try {
      const res = await getAllSubscriptionsApi(search);
      setListingData(res?.data?.data || []);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
    } finally {
      setListLoading(false);
    }
  };

  const fetchDataById = async (id) => {
    setDataLoading(true);
    try {
      const res = await getByIdSubscriptionsApi(id);
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
      const res = await deleteSubscriptionsStatusApi(id);
      toast.success(res?.data?.message);
      fetchData();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to delete plan"));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await updateSubscriptionsStatusApi(id, { status });
      toast.success(res?.data?.message);
      fetchData();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to update status"));
    }
  };

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
    billingCycleOptions,
    setBillingCycleOptions,
    codeBadge,
    handleDeleteData,
    handleUpdateStatus,
    search,
    setSearch,
  };

  return (
    <SubscriptionPlansContext.Provider value={value}>
      {children}
    </SubscriptionPlansContext.Provider>
  );
};

export const useSubscriptionPlans = () => useContext(SubscriptionPlansContext);
