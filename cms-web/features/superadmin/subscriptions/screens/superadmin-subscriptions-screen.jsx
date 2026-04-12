"use client";

import { SuperadminShell } from "@/features/superadmin/layout/superadmin-shell";
import { SuperadminSubscriptionPlanForm } from "@/features/superadmin/subscriptions/components/superadmin-subscription-plan-form";
import { SuperadminSubscriptionPlanListing } from "@/features/superadmin/subscriptions/components/superadmin-subscription-plan-listing";
import {
  SuperadminSubscriptionProvider,
  useSuperadminSubscription,
} from "@/features/superadmin/subscriptions/providers/superadmin-subscriptions-provider";

const SuperadminSubscriptionModeRenderer = () => {
  const { activeView } = useSuperadminSubscription();

  if (
    activeView === "create" ||
    activeView === "edit" ||
    activeView === "view"
  ) {
    return <SuperadminSubscriptionPlanForm />;
  }

  return <SuperadminSubscriptionPlanListing />;
};

export function SuperadminSubscriptionsScreen() {
  return (
    <SuperadminShell
      accent="amber"
      eyebrow="Subscription Management"
      title="Subscription plans"
      description="Manage platform subscription plans."
      showHero={false}
    >
      <SuperadminSubscriptionProvider>
        <SuperadminSubscriptionModeRenderer />
      </SuperadminSubscriptionProvider>
    </SuperadminShell>
  );
}
