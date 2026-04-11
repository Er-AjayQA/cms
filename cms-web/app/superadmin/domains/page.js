"use client";

import {
  DomainProvider,
  useDomains,
} from "@/app/context/superadmin_contexts/domainContext";
import { AppShell } from "@/components/app-shell";
import { DomainForm } from "./form";
import { DomainListing } from "./listing";

const DomainModeRenderer = () => {
  const { mode } = useDomains();

  if (mode === "create" || mode === "edit" || mode === "view") {
    return <DomainForm />;
  }

  return <DomainListing />;
};

const SuperadminDomainsPage = () => {
  return (
    <AppShell
      accent="amber"
      role="superadmin"
      eyebrow="Domain Management"
      title="Domains"
      description="Manage tenant hostnames and primary domain routing."
      showHero={false}
    >
      <DomainProvider>
        <DomainModeRenderer />
      </DomainProvider>
    </AppShell>
  );
};

export default SuperadminDomainsPage;
