"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/utils";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createSuperadminDomain,
  deleteSuperadminDomain,
  getSuperadminDomains,
  getSuperadminDomainById,
  updateSuperadminDomain,
  updateSuperadminDomainStatus,
} from "@/features/superadmin/domains/services/superadmin-domain-api";
import { getSuperadminTenants } from "@/features/superadmin/tenants/services/superadmin-tenant-api";

const SuperadminDomainContext = createContext();

export const SuperadminDomainProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("listing");
  const [isListLoading, setIsListLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [tenantOptions, setTenantOptions] = useState([]);
  const [isRecordLoading, setIsRecordLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const validationSchema = Yup.object({
    tenantId: Yup.string().required("Tenant is required"),
    hostname: Yup.string().required("Hostname is required"),
  });

  const initialFormikValues = {
    tenantId: "",
    hostname: "",
    type: "custom",
    isPrimary: false,
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
            ? "Domain updated successfully"
            : "Domain created successfully";
        const res =
          activeView === "edit"
            ? await updateSuperadminDomain(selectedId, payload)
            : await createSuperadminDomain(payload);

        if (!res?.data?.success) {
          toast.error(res?.data?.message || "Failed to save domain");
          return;
        }

        closeForm();
        fetchRecords();
        toast.success(res?.data?.message || successMessage);
        setActiveView("listing");
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(getApiErrorMessage(error, "Failed to save domain"));
      }
    },
  });

  const fetchRecords = async () => {
    setIsListLoading(true);
    try {
      const res = await getSuperadminDomains(search);
      setRecords(res?.data?.data || []);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load domains"));
    } finally {
      setIsListLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await getSuperadminTenants();
      setTenantOptions(res?.data?.data || []);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load tenants"));
    }
  };

  const fetchRecordById = async (id) => {
    setIsRecordLoading(true);
    try {
      const res = await getSuperadminDomainById(id);
      const data = res?.data?.data;

      formik.setValues({
        tenantId: data?.tenantId ?? "",
        hostname: data?.hostname ?? "",
        type: data?.type ?? "custom",
        isPrimary: Boolean(data?.isPrimary),
      });

      return true;
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load domain"));
      return false;
    } finally {
      setIsRecordLoading(false);
    }
  };

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
      const res = await deleteSuperadminDomain(id);
      toast.success(res?.data?.message);
      fetchRecords();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to delete domain"));
    }
  };

  const toggleRecordStatus = async (id, status) => {
    try {
      const res = await updateSuperadminDomainStatus(id, { status });
      toast.success(res?.data?.message);
      fetchRecords();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to update domain status"));
    }
  };

  const StatusToggleBadge = ({ id, status }) => {
    const classes =
      status?.toLowerCase() === "active"
        ? "bg-emerald-500/15 text-emerald-700 border-emerald-600/20"
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

  useEffect(() => {
    fetchRecords();
  }, [search]);

  useEffect(() => {
    fetchTenants();
  }, []);

  const value = {
    StatusToggleBadge,
    formik,
    activeView,
    closeForm,
    openCreateForm,
    openRecord,
    deleteRecord,
    isListLoading,
    isRecordLoading,
    records,
    tenantOptions,
    search,
    setSearch,
  };

  return (
    <SuperadminDomainContext.Provider value={value}>{children}</SuperadminDomainContext.Provider>
  );
};

export const useSuperadminDomain = () => useContext(SuperadminDomainContext);


