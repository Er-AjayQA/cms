import { AppShell } from "@/components/app-shell";
import SuperadminDashboard from "./dashboard";
import { SuperadminDashboardProvider } from "../context/superadmin_contexts/dashboard";

export default function SuperadminPage() {
  return (
    <AppShell
      accent="amber"
      role="superadmin"
      eyebrow="Platform Control"
      title="Dashboard"
      description="A platform-first surface for tenant lifecycle, domain reliability, and rollout visibility."
    >
      <SuperadminDashboardProvider>
        <SuperadminDashboard />
      </SuperadminDashboardProvider>
    </AppShell>
  );
}
