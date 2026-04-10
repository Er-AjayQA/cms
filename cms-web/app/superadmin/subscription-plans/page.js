"use client";

import { SubscriptionListing, TenantListing } from "./listing";
import { AppShell } from "@/components/app-shell";
import { SubscriptionForm, TenantForm } from "./form";
import {
  SubscriptionPlansProvider,
  useSubscriptionPlans,
} from "@/app/context/superadmin_contexts/subscriptionPlanContext";

const SubscriptionModeRenderer = () => {
  const { mode } = useSubscriptionPlans();

  if (mode === "create" || mode === "edit") {
    return <SubscriptionForm />;
  }

  return <SubscriptionListing />;
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
      <SubscriptionPlansProvider>
        <SubscriptionModeRenderer />
      </SubscriptionPlansProvider>
    </AppShell>
  );
};

export default SuperadminTenantPage;
