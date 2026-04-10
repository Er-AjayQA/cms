"use client";

import {
  TenantSuperadminProvider,
  useTenantSuperadmin,
} from "@/app/context/superadmin_contexts/tenantSuperadmin";
import { TenantListing } from "./listing";
import { AppShell } from "@/components/app-shell";
import { TenantForm } from "./form";

const TenantModeRenderer = () => {
  const { mode } = useTenantSuperadmin();

  if (mode === "create" || mode === "edit") {
    return <TenantForm />;
  }

  return <TenantListing />;
};

const SuperadminTenantPage = () => {
  return (
    <AppShell
      accent="amber"
      role="superadmin"
      eyebrow="Tenant Operations"
      title="Tenant management"
      description="Manage tenant onboarding and workspace operations."
      showHero={false}
    >
      <TenantSuperadminProvider>
        <TenantModeRenderer />
      </TenantSuperadminProvider>
    </AppShell>
  );
};

export default SuperadminTenantPage;
