"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/lib/utils";
import { getAllSuperadminDashboardApi } from "@/components/services/dashboard.service";

const SuperadminDashboardContext = createContext();

export const SuperadminDashboardProvider = ({ children }) => {
  /* ===================================
        HANDLE STATE
     =================================== */
  const [dataLoading, setDataLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  /* ===================================
        API HANDLING
     =================================== */
  const fetchData = async () => {
    setDataLoading(true);
    try {
      const res = await getAllSuperadminDashboardApi();
      setDashboardData(res?.data?.data || null);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(
        getApiErrorMessage(error, "Failed to load dashboard content"),
      );
    } finally {
      setDataLoading(false);
    }
  };

  /* ===================================
        INITIAL RENDERS
     =================================== */
  useEffect(() => {
    fetchData();
  }, []);

  const value = {
    dashboardData,
    setDashboardData,
    dataLoading,
    setDataLoading,
  };

  return (
    <SuperadminDashboardContext.Provider value={value}>
      {children}
    </SuperadminDashboardContext.Provider>
  );
};

export const useSuperadminDashboard = () =>
  useContext(SuperadminDashboardContext);
