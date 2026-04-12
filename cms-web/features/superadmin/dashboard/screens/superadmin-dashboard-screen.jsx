import { SuperadminDashboardView } from "@/features/superadmin/dashboard/components/superadmin-dashboard-view";
import { SuperadminDashboardProvider } from "@/features/superadmin/dashboard/providers/superadmin-dashboard-provider";
import { SuperadminShell } from "@/features/superadmin/layout/superadmin-shell";

export function SuperadminDashboardScreen() {
  return (
    <SuperadminShell
      accent="amber"
      eyebrow="Platform Control"
      title="Dashboard"
      description="A platform-first surface for tenant lifecycle, domain reliability, and rollout visibility."
    >
      <SuperadminDashboardProvider>
        <SuperadminDashboardView />
      </SuperadminDashboardProvider>
    </SuperadminShell>
  );
}
