import { Activity, Database, Globe, UsersRound } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DashboardStat } from "@/components/dashboard-stat";
import { PreviewFrame } from "@/components/preview-frame";
import { Button } from "@/components/ui/button";

const tenantRows = [
  { name: "Acme Studio", plan: "Growth", domain: "acme.example.com", status: "Healthy" },
  { name: "Northstar Labs", plan: "Scale", domain: "northstar.example.com", status: "Provisioning" },
  { name: "Olive Market", plan: "Starter", domain: "olive.example.com", status: "Attention" },
];

export default function SuperadminPage() {
  return (
    <AppShell
      accent="amber"
      eyebrow="Platform Control"
      title="Superadmin command deck"
      description="A platform-first surface for tenant lifecycle, domain reliability, and rollout visibility."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStat label="Active tenants" value="128" note="12 new tenant workspaces this week." />
        <DashboardStat label="Pending domains" value="07" note="DNS verification queue needs attention." />
        <DashboardStat label="Failed jobs" value="02" note="Migration retries available from ops panel." />
        <DashboardStat label="API uptime" value="99.98%" note="Cross-region latency remains within target." />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <PreviewFrame
          title="Tenant overview"
          description="A fast operations list for platform owners."
        >
          <div className="divide-y divide-border/60">
            {tenantRows.map((tenant, index) => (
              <div
                className="grid gap-4 p-5 md:grid-cols-[1.6fr_0.8fr_1fr_0.8fr] md:items-center"
                key={tenant.name}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div>
                  <p className="font-medium">{tenant.name}</p>
                  <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                </div>
                <p className="text-sm text-muted-foreground">{tenant.plan}</p>
                <p className="text-sm text-muted-foreground">{tenant.status}</p>
                <Button variant="outline" size="sm">Inspect</Button>
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
              { icon: UsersRound, title: "Create tenant", copy: "Launch a new tenant with schema bootstrap and owner credentials." },
              { icon: Database, title: "Run migrations", copy: "Push controlled schema changes across tenant databases." },
              { icon: Globe, title: "Review domains", copy: "Approve host mappings and inspect SSL readiness." },
              { icon: Activity, title: "Audit incidents", copy: "Track failed provisioning and authentication anomalies." },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div className="rounded-[24px] border border-border/60 bg-background/60 p-4" key={item.title}>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </PreviewFrame>
      </section>
    </AppShell>
  );
}
