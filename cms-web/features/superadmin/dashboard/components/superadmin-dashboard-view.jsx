"use client";

import { Activity, Database, Globe, UsersRound } from "lucide-react";
import { DashboardStat } from "@/features/superadmin/shared/components/dashboard-stat";
import { PreviewFrame } from "@/features/superadmin/shared/components/preview-frame";
import { Button } from "@/components/ui/button";
import { useSuperadminDashboard } from "@/features/superadmin/dashboard/providers/superadmin-dashboard-provider";

export function SuperadminDashboardView() {
  const { dashboardData } = useSuperadminDashboard();
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          label="Total tenants"
          value={dashboardData?.totalTenants}
          note="Migration retries available from ops panel."
        />
        <DashboardStat
          label="Active tenants"
          value={dashboardData?.activeTenants}
          note="12 new tenant workspaces this week."
        />
        <DashboardStat
          label="Suspended tenants"
          value={dashboardData?.suspendedTenants}
          note="DNS verification queue needs attention."
        />
        <DashboardStat
          label="Total Databases"
          value={dashboardData?.totalDatabases}
          note="Cross-region latency remains within target."
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <PreviewFrame
          title="Tenant overview"
          description="A fast operations list for platform owners."
          buttonLabel="Add Tenant"
          buttonRedirect="/superadmin/tenant"
        >
          <div className="divide-y divide-border/60">
            {dashboardData?.allTenants?.map((tenant, index) => (
              <div
                className="grid gap-4 p-5 md:grid-cols-[1.6fr_0.8fr_1fr_0.8fr] md:items-center"
                key={tenant.companyName}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div>
                  <p className="font-medium">{tenant.companyName}</p>
                  <p className="text-sm text-muted-foreground">
                    {
                      tenant?.domains?.find((domain) => domain.isPrimary)
                        ?.hostname
                    }
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tenant.subscription_status}
                </p>
                <p className="text-sm text-muted-foreground">{tenant.status}</p>
                <Button variant="outline" size="sm">
                  Inspect
                </Button>
              </div>
            ))}
          </div>
        </PreviewFrame>

        <PreviewFrame
          title="Ops focus"
          description="High-signal shortcuts for backend operations."
        >
          <div className="grid gap-4 p-5">
            {[
              {
                icon: UsersRound,
                title: "Create tenant",
                copy: "Launch a new tenant with schema bootstrap and owner credentials.",
              },
              {
                icon: Database,
                title: "Run migrations",
                copy: "Push controlled schema changes across tenant databases.",
              },
              {
                icon: Globe,
                title: "Review domains",
                copy: "Approve host mappings and inspect SSL readiness.",
              },
              {
                icon: Activity,
                title: "Audit incidents",
                copy: "Track failed provisioning and authentication anomalies.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="rounded-[24px] border border-border/60 bg-background/60 p-4"
                  key={item.title}
                >
                  <div className="flex items-center justify-center mb-3 size-11 rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.copy}
                  </p>
                </div>
              );
            })}
          </div>
        </PreviewFrame>
      </section>
    </>
  );
}


