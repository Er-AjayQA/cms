"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/utils";
import { getSuperadminDashboard } from "@/features/superadmin/dashboard/services/superadmin-dashboard-api";

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
  };

  return (
    <SuperadminDashboardContext.Provider value={value}>
      {children}
    </SuperadminDashboardContext.Provider>
  );
};

export const useSuperadminDashboard = () =>
  useContext(SuperadminDashboardContext);




