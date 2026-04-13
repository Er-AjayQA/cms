"use client";

import { SuperadminDomainForm } from "@/features/superadmin/domains/components/superadmin-domain-form";
import { SuperadminDomainListing } from "@/features/superadmin/domains/components/superadmin-domain-listing";
import {
  SuperadminDomainProvider,
  useSuperadminDomain,
} from "@/features/superadmin/domains/providers/superadmin-domains-provider";
import { SuperadminShell } from "@/features/superadmin/layout/superadmin-shell";

const SuperadminDomainModeRenderer = () => {
  const { activeView } = useSuperadminDomain();

  if (activeView === "manage" || activeView === "create") {
    return <SuperadminDomainForm />;
  }

  return <SuperadminDomainListing />;
};

export function SuperadminDomainsScreen() {
  return (
    <SuperadminShell
      accent="amber"
      eyebrow="Domain Management"
      title="Domains"
      description="Manage tenant hostnames and primary domain routing."
      showHero={false}
    >
      <SuperadminDomainProvider>
        <SuperadminDomainModeRenderer />
      </SuperadminDomainProvider>
    </SuperadminShell>
  );
}
