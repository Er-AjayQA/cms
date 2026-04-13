"use client";

import { SuperadminShell } from "@/features/superadmin/layout/superadmin-shell";
import { SuperadminTenantForm } from "@/features/superadmin/tenants/components/superadmin-tenant-form";
import { SuperadminTenantListing } from "@/features/superadmin/tenants/components/superadmin-tenant-listing";
import { SuperadminTenantView } from "@/features/superadmin/tenants/components/superadmin-tenant-view";
import {
  SuperadminTenantProvider,
  useSuperadminTenant,
} from "@/features/superadmin/tenants/providers/superadmin-tenants-provider";

const SuperadminTenantModeRenderer = () => {
  const { activeView } = useSuperadminTenant();

  if (activeView === "view") {
    return <SuperadminTenantView />;
  }

  if (activeView === "create" || activeView === "edit") {
    return <SuperadminTenantForm />;
  }

  return <SuperadminTenantListing />;
};

export function SuperadminTenantsScreen() {
  return (
    <SuperadminShell
      accent="amber"
      eyebrow="Tenant Operations"
      title="Tenant management"
      description="Manage tenant onboarding and workspace operations."
      showHero={false}
    >
      <SuperadminTenantProvider>
        <SuperadminTenantModeRenderer />
      </SuperadminTenantProvider>
    </SuperadminShell>
  );
}
