"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/utils";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createSuperadminDomain,
  checkSuperadminDomainSsl,
  deleteSuperadminDomain,
  getSuperadminDomains,
  updateSuperadminDomain,
  verifySuperadminDomain,
  getSuperadminDomainsByTenant,
} from "@/features/superadmin/domains/services/superadmin-domain-api";
import { getSuperadminTenants } from "@/features/superadmin/tenants/services/superadmin-tenant-api";

const SuperadminDomainContext = createContext();

export const SuperadminDomainProvider = ({ children }) => {
  /* ===================================
        HANDLE STATE
     =================================== */
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("listing");
  const [isListLoading, setIsListLoading] = useState(false);
  const [list, setList] = useState([]);
  const [tenantOptions, setTenantOptions] = useState([]);
  const [records, setRecords] = useState(null);
  const [isRecordLoading, setIsRecordLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [domainEditorMode, setDomainEditorMode] = useState(null);

  /* ===================================
        HANDLE FORMIK
     =================================== */
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
          domainEditorMode === "edit"
            ? "Domain updated successfully"
            : "Domain created successfully";
        const res =
          domainEditorMode === "edit"
            ? await updateSuperadminDomain(selectedDomainId, payload)
            : await createSuperadminDomain(payload);

        if (!res?.data?.success) {
          toast.error(res?.data?.message || "Failed to save domain");
          return;
        }

        setSelectedDomainId(null);
        setDomainEditorMode(null);
        formik.resetForm({ values: initialFormikValues });
        if (selectedId) {
          await fetchRecordById(selectedId);
        }
        fetchRecords();
        toast.success(res?.data?.message || successMessage);
      } catch (error) {
        console.error("Error details:", error.response?.data || error);
        toast.error(getApiErrorMessage(error, "Failed to save domain"));
      }
    },
  });

  /* ===================================
        API HANDLING
     =================================== */
  const fetchRecords = async () => {
    setIsListLoading(true);
    try {
      const [tenantsRes, domainsRes] = await Promise.all([
        getSuperadminTenants(search),
        getSuperadminDomains(),
      ]);
      const tenants = tenantsRes?.data?.data || [];
      const domains = domainsRes?.data?.data || [];
      const tenantRows = tenants.map((tenant) => {
        const tenantDomains = domains.filter(
          (domain) => domain.tenantId === tenant.id,
        );
        const primaryDomain =
          tenantDomains.find((domain) => domain.isPrimary) || tenantDomains[0];

        return {
          ...tenant,
          totalDomains: tenantDomains.length,
          verifiedDomains: tenantDomains.filter(
            (domain) => domain.status === "verified",
          ).length,
          pendingDomains: tenantDomains.filter((domain) =>
            ["pending", "pending_dns"].includes(domain.status),
          ).length,
          failedDomains: tenantDomains.filter(
            (domain) => domain.status === "failed",
          ).length,
          primaryDomain,
        };
      });

      setList(tenantRows);
      setTenantOptions(tenants);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load domains"));
    } finally {
      setIsListLoading(false);
    }
  };

  const fetchRecordById = async (id) => {
    setIsRecordLoading(true);
    try {
      const res = await getSuperadminDomainsByTenant(id);
      const data = res?.data?.data;
      setRecords(res?.data?.data || null);
      return true;
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load domain"));
      return false;
    } finally {
      setIsRecordLoading(false);
    }
  };

  /* ===================================
        HELPER FUNCTIONS
     =================================== */
  const closeForm = () => {
    setActiveView("listing");
    setSelectedId(null);
    setSelectedDomainId(null);
    setDomainEditorMode(null);
    setRecords(null);
    formik.resetForm({ values: initialFormikValues });
  };

  const openCreateForm = () => {
    setSelectedId(null);
    setSelectedDomainId(null);
    setDomainEditorMode("create");
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

  const beginCreateDomain = () => {
    setSelectedDomainId(null);
    setDomainEditorMode("create");
    formik.setValues({
      ...initialFormikValues,
      tenantId: selectedId || records?.tenant?.id || "",
    });
  };

  const beginEditDomain = (domain) => {
    setSelectedDomainId(domain?.id);
    setDomainEditorMode("edit");
    formik.setValues({
      tenantId: domain?.tenantId,
      hostname: domain?.hostname || "",
      type: "custom",
      isPrimary: Boolean(domain?.isPrimary),
    });
  };

  const cancelDomainEditor = () => {
    setSelectedDomainId(null);
    setDomainEditorMode(null);
    formik.resetForm({ values: initialFormikValues });
  };

  const deleteRecord = async (id) => {
    try {
      const res = await deleteSuperadminDomain(id);
      toast.success(res?.data?.message);
      fetchRecords();
      if (selectedId) fetchRecordById(selectedId);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to delete domain"));
    }
  };

  const verifyDomain = async (id) => {
    setIsRecordLoading(true);
    try {
      const res = await verifySuperadminDomain(id);
      toast.success(res?.data?.message || "Domain verification checked");
      if (selectedId) await fetchRecordById(selectedId);
      fetchRecords();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to verify domain"));
    } finally {
      setIsRecordLoading(false);
    }
  };

  const checkDomainSsl = async (id) => {
    setIsRecordLoading(true);
    try {
      const res = await checkSuperadminDomainSsl(id);
      toast.success(res?.data?.message || "SSL status checked");
      if (selectedId) await fetchRecordById(selectedId);
      fetchRecords();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to check SSL status"));
    } finally {
      setIsRecordLoading(false);
    }
  };

  const valueOrDash = (value) => value ?? "-";

  const StatusBadge = ({ value }) => (
    <Badge variant="outline" className="capitalize">
      {valueOrDash(value)}
    </Badge>
  );

  /* ===================================
        INITIAL RENDERS
     =================================== */
  useEffect(() => {
    fetchRecords();
  }, [search]);

  const value = {
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
    selectedDomainId,
    domainEditorMode,
    beginCreateDomain,
    beginEditDomain,
    cancelDomainEditor,
    verifyDomain,
    checkDomainSsl,
    search,
    setSearch,
    list,
    setList,
    StatusBadge,
  };

  return (
    <SuperadminDomainContext.Provider value={value}>
      {children}
    </SuperadminDomainContext.Provider>
  );
};

export const useSuperadminDomain = () => useContext(SuperadminDomainContext);
