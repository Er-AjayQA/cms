"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/utils";
import { getSuperadminDashboard } from "@/features/superadmin/dashboard/services/superadmin-dashboard-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SuperadminDashboardContext = createContext();

export const SuperadminDashboardProvider = ({ children }) => {
  /* ===================================
        HANDLE STATE
     =================================== */
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  /* ===================================
        API HANDLING
     =================================== */
  const fetchDashboard = async () => {
    setIsDashboardLoading(true);
    try {
      const res = await getSuperadminDashboard();
      setDashboardData(res?.data?.data || null);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(
        getApiErrorMessage(error, "Failed to load dashboard content"),
      );
    } finally {
      setIsDashboardLoading(false);
    }
  };

  /* ===================================
        HELPER FUNCTIONS
     =================================== */
  const statusStyles = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
    verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
    succeeded: "border-emerald-200 bg-emerald-50 text-emerald-700",
    running: "border-sky-200 bg-sky-50 text-sky-700",
    provisioning: "border-sky-200 bg-sky-50 text-sky-700",
    pending_dns: "border-amber-200 bg-amber-50 text-amber-700",
    failed: "border-red-200 bg-red-50 text-red-700",
    default: "border-zinc-200 bg-zinc-50 text-zinc-700",
  };

  const StatusBadge = ({ status }) => {
    return (
      <Badge
        variant="outline"
        className={statusStyles[status] || statusStyles.default}
      >
        {status || "unknown"}
      </Badge>
    );
  };

  const MetricCard = ({ icon: Icon, label, value, note, tone }) => {
    return (
      <Card className="rounded-lg border-border/70 bg-white/80 shadow-sm">
        <CardContent className="flex min-h-32 flex-col justify-between p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div
              className={`flex size-10 items-center justify-center rounded-lg ${tone}`}
            >
              <Icon className="size-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight">
              {isDashboardLoading ? <Skeleton /> : value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{note}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AttentionItem = ({ title, detail, meta, action }) => {
    return (
      <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4 last:border-b-0">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          {meta ? (
            <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
          ) : null}
        </div>
        <Badge variant="outline" className="shrink-0">
          {action}
        </Badge>
      </div>
    );
  };

  const handleRefresh = () => {
    fetchDashboard();
  };

  /* ===================================
        INITIAL RENDERS
     =================================== */
  useEffect(() => {
    fetchDashboard();
  }, []);

  const value = {
    dashboardData,
    setDashboardData,
    isDashboardLoading,
    setIsDashboardLoading,
    StatusBadge,
    MetricCard,
    AttentionItem,
    handleRefresh,
  };

  return (
    <SuperadminDashboardContext.Provider value={value}>
      {children}
    </SuperadminDashboardContext.Provider>
  );
};

export const useSuperadminDashboard = () =>
  useContext(SuperadminDashboardContext);
