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
  getSuperadminTenantDatabasePassword,
  getSuperadminTenants,
  getSuperadminTenantById,
  runSuperadminTenantMigrations,
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [activeView, setActiveView] = useState("listing");
  const [isListLoading, setIsListLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [isRecordLoading, setIsRecordLoading] = useState(false);
  const [plansOptions, setPlansOptions] = useState([]);
  const [isPlansLoading, setIsPlansLoading] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loadedDbType, setLoadedDbType] = useState(null);
  const [migrationLoadingId, setMigrationLoadingId] = useState(null);
  const [pendingMigrationTenantId, setPendingMigrationTenantId] =
    useState(null);
  const [passwordLoadingId, setPasswordLoadingId] = useState(null);
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
        fetchRecords({ page: currentPage });
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
  const fetchRecords = async ({
    searchValue = debouncedSearch,
    page = currentPage,
    limit = pageSize,
  } = {}) => {
    setIsListLoading(true);
    try {
      const res = await getSuperadminTenants({
        search: searchValue,
        page,
        limit,
      });
      const data = res?.data?.data;
      const nextPagination =
        data?.pagination || {
          page,
          limit,
          totalRecords: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        };

      setRecords(data?.records || []);
      setPagination(nextPagination);

      if (
        page > nextPagination.totalPages &&
        nextPagination.totalRecords > 0
      ) {
        setCurrentPage(nextPagination.totalPages);
      }
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
      fetchRecords({ page: currentPage });
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
      fetchRecords({ page: currentPage });
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(
        getApiErrorMessage(error, "Failed to retry tenant provisioning"),
      );
    } finally {
      setIsRecordLoading(false);
    }
  };

  const revealTenantDatabasePassword = async (id) => {
    setPasswordLoadingId(id);

    try {
      const res = await getSuperadminTenantDatabasePassword(id);
      const dbPassword = res?.data?.data?.dbPassword || "";

      if (selectedId === id) {
        setSelectedRecord((current) =>
          current
            ? {
                ...current,
                database: {
                  ...(current.database || {}),
                  dbPassword,
                },
              }
            : current,
        );
        formik.setFieldValue("dbPassword", dbPassword);
      }

      return dbPassword;
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load DB password"));
      return null;
    } finally {
      setPasswordLoadingId(null);
    }
  };

  const getTenantFromState = (id) =>
    records.find((record) => record.id === id) ||
    (selectedRecord?.id === id ? selectedRecord : null);

  const runTenantMigration = (id) => {
    const tenant =
      records.find((record) => record.id === id) ||
      (selectedRecord?.id === id ? selectedRecord : null);
    const migrationStatus = tenant?.migrationStatus;
    const isBusy = ["creating", "verifying", "migrating", "seeding"].includes(
      tenant?.database?.status,
    );

    if (isBusy) {
      toast.info("Tenant database is already busy");
      return;
    }

    if (migrationStatus?.state === "drift") {
      toast.error("Migration history has drift. Resolve it before running.");
      return;
    }

    if (migrationStatus?.state === "unknown") {
      toast.error("Migration status is unknown. Refresh or fix DB connection.");
      return;
    }

    if (migrationStatus?.state === "up_to_date") {
      toast.info("Tenant database is already up to date");
      return;
    }

    setPendingMigrationTenantId(id);
  };

  const confirmTenantMigration = async () => {
    const id = pendingMigrationTenantId;
    setPendingMigrationTenantId(null);

    if (!id) {
      return;
    }

    setMigrationLoadingId(id);

    try {
      const res = await runSuperadminTenantMigrations(id);
      const executed = res?.data?.data?.executed || [];

      toast.success(
        executed.length
          ? res?.data?.message || "Tenant migrations completed"
          : "Tenant database is already up to date",
      );

      await fetchRecords({ page: currentPage });

      if (selectedId === id) {
        await fetchRecordById(id);
      }
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to run tenant migrations"));
    } finally {
      setMigrationLoadingId(null);
    }
  };

  const cancelTenantMigration = () => {
    setPendingMigrationTenantId(null);
  };

  const toggleRecordStatus = async (id, status) => {
    try {
      const res = await updateSuperadminTenantStatus(id, { status });
      toast.success(res?.data?.message);
      fetchRecords({ page: currentPage });
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
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchRecords({ searchValue: debouncedSearch, page: currentPage });
  }, [debouncedSearch, currentPage, pageSize]);

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), pagination.totalPages || 1);
    setCurrentPage(nextPage);
  };

  const changePageSize = (limit) => {
    setPageSize(limit);
    setCurrentPage(1);
  };

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
    revealTenantDatabasePassword,
    runTenantMigration,
    confirmTenantMigration,
    cancelTenantMigration,
    pendingMigrationTenant: pendingMigrationTenantId
      ? getTenantFromState(pendingMigrationTenantId)
      : null,
    migrationLoadingId,
    passwordLoadingId,
    search,
    setSearch,
    currentPage,
    pageSize,
    pagination,
    goToPage,
    changePageSize,
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
