"use client";

import { SubscriptionListing } from "./listing";
import { AppShell } from "@/components/app-shell";
import { SubscriptionForm } from "./form";
import {
  SubscriptionPlansProvider,
  useSubscriptionPlans,
} from "@/app/context/superadmin_contexts/subscriptionPlanContext";

const SubscriptionModeRenderer = () => {
  const { mode } = useSubscriptionPlans();

  if (mode === "create" || mode === "edit" || mode === "view") {
    return <SubscriptionForm />;
  }
  return <SubscriptionListing />;
};

const SuperadminTenantPage = () => {
  return (
    <AppShell
      accent="amber"
      role="superadmin"
      eyebrow="Subscription Management"
      title="Subscriptions plans"
      description="Manage plans onboarding and workspace operations."
      showHero={false}
    >
      <SubscriptionPlansProvider>
        <SubscriptionModeRenderer />
      </SubscriptionPlansProvider>
    </AppShell>
  );
};

export default SuperadminTenantPage;
