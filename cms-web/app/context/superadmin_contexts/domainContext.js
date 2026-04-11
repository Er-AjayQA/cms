"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/utils";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createDomainsApi,
  deleteDomainsApi,
  getAllDomainsApi,
  getByIdDomainsApi,
  updateDomainsApi,
  updateDomainsStatusApi,
} from "@/components/services/domain.service";
import { getAllTenantsApi } from "@/components/services/tenant.service";

const DomainContext = createContext();

export const DomainProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("listing");
  const [listLoading, setListLoading] = useState(false);
  const [listingData, setListingData] = useState([]);
  const [tenantOptions, setTenantOptions] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

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
          mode === "edit"
            ? "Domain updated successfully"
            : "Domain created successfully";
        const res =
          mode === "edit"
            ? await updateDomainsApi(selectedRecordId, payload)
            : await createDomainsApi(payload);

        if (!res?.data?.success) {
          toast.error(res?.data?.message || "Failed to save domain");
          return;
        }

        handleCloseForm();
        fetchData();
        toast.success(res?.data?.message || successMessage);
        setMode("listing");
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(getApiErrorMessage(error, "Failed to save domain"));
      }
    },
  });

  const fetchData = async () => {
    setListLoading(true);
    try {
      const res = await getAllDomainsApi(search);
      setListingData(res?.data?.data || []);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load domains"));
    } finally {
      setListLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await getAllTenantsApi();
      setTenantOptions(res?.data?.data || []);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load tenants"));
    }
  };

  const fetchDataById = async (id) => {
    setDataLoading(true);
    try {
      const res = await getByIdDomainsApi(id);
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
      setDataLoading(false);
    }
  };

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
      const res = await deleteDomainsApi(id);
      toast.success(res?.data?.message);
      fetchData();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to delete domain"));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await updateDomainsStatusApi(id, { status });
      toast.success(res?.data?.message);
      fetchData();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to update domain status"));
    }
  };

  const StatusBadge = ({ id, status }) => {
    const classes =
      status?.toLowerCase() === "active"
        ? "bg-emerald-500/15 text-emerald-700 border-emerald-600/20"
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

  useEffect(() => {
    fetchData();
  }, [search]);

  useEffect(() => {
    fetchTenants();
  }, []);

  const value = {
    StatusBadge,
    formik,
    mode,
    setMode,
    handleCloseForm,
    handleAdd,
    handleGetData,
    handleDeleteData,
    selectedRecordId,
    setSelectedRecordId,
    listLoading,
    setListLoading,
    dataLoading,
    setDataLoading,
    listingData,
    setListingData,
    tenantOptions,
    setTenantOptions,
    handleUpdateStatus,
    search,
    setSearch,
  };

  return (
    <DomainContext.Provider value={value}>{children}</DomainContext.Provider>
  );
};

export const useDomains = () => useContext(DomainContext);
