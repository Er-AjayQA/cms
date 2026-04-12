"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Globe2,
  RefreshCw,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dashboard = {
  tenants: {
    total: 18,
    active: 14,
    failed: 2,
    provisioning: 1,
  },
  databases: {
    managed: 11,
    own: 7,
    ready: 15,
    failed: 2,
  },
  domains: {
    pendingDns: 4,
    verified: 14,
  },
  subscriptions: {
    trial: 9,
    active: 7,
  },
  recentProvisioningJobs: [
    {
      tenant: "MARS",
      type: "tenant_retry",
      status: "succeeded",
      step: "completed",
      attempts: 1,
      startedAt: "12 Apr, 8:22 PM",
      finishedAt: "12 Apr, 8:22 PM",
    },
    {
      tenant: "Northstar Media",
      type: "tenant_create",
      status: "running",
      step: "db_migrating",
      attempts: 1,
      startedAt: "12 Apr, 8:18 PM",
      finishedAt: null,
    },
    {
      tenant: "Orbit Labs",
      type: "tenant_create",
      status: "failed",
      step: "db_verifying",
      attempts: 1,
      startedAt: "12 Apr, 8:10 PM",
      finishedAt: "12 Apr, 8:10 PM",
    },
  ],
  attention: {
    failedTenants: [
      {
        companyName: "Orbit Labs",
        step: "db_verifying",
        message: "Access denied for configured tenant database user.",
      },
    ],
    pendingDomains: [
      {
        companyName: "MARS",
        hostname: "mars.in",
        status: "pending_dns",
      },
      {
        companyName: "Blue Pixel",
        hostname: "cms.bluepixel.co",
        status: "pending_dns",
      },
    ],
    failedDatabases: [
      {
        companyName: "Orbit Labs",
        dbType: "own",
        message: "Database connection failed.",
      },
    ],
  },
};

const statusStyles = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
  succeeded: "border-emerald-200 bg-emerald-50 text-emerald-700",
  running: "border-sky-200 bg-sky-50 text-sky-700",
  provisioning: "border-sky-200 bg-sky-50 text-sky-700",
  pending_dns: "border-amber-200 bg-amber-50 text-amber-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  default: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

function StatusBadge({ status }) {
  return (
    <Badge
      variant="outline"
      className={statusStyles[status] || statusStyles.default}
    >
      {status || "unknown"}
    </Badge>
  );
}

function MetricCard({ icon: Icon, label, value, note, tone }) {
  return (
    <Card className="rounded-lg border-border/70 bg-white/80 shadow-sm">
      <CardContent className="flex min-h-32 flex-col justify-between p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className={`flex size-10 items-center justify-center rounded-lg ${tone}`}>
            <Icon className="size-5" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AttentionItem({ title, detail, meta, action }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        {meta ? <p className="mt-1 text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      <Button variant="outline" size="sm" className="shrink-0">
        {action}
      </Button>
    </div>
  );
}

export function SuperadminDashboardStatic() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border/70 bg-white/80 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Platform health
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Tenant provisioning, database readiness, domains, and subscriptions.
          </p>
        </div>
        <Button variant="outline" className="w-full md:w-auto">
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={UsersRound}
          label="Total Tenants"
          value={dashboard.tenants.total}
          note={`${dashboard.tenants.active} active tenants`}
          tone="bg-sky-50 text-sky-700"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Active"
          value={dashboard.tenants.active}
          note="Ready for tenant users"
          tone="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          icon={ShieldAlert}
          label="Failed"
          value={dashboard.tenants.failed}
          note="Needs retry or config update"
          tone="bg-red-50 text-red-700"
        />
        <MetricCard
          icon={Clock3}
          label="Provisioning"
          value={dashboard.tenants.provisioning}
          note="Currently in progress"
          tone="bg-amber-50 text-amber-700"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Database}
          label="Managed DB"
          value={dashboard.databases.managed}
          note={`${dashboard.databases.ready} databases ready`}
          tone="bg-cyan-50 text-cyan-700"
        />
        <MetricCard
          icon={Database}
          label="Own DB"
          value={dashboard.databases.own}
          note={`${dashboard.databases.failed} database failures`}
          tone="bg-violet-50 text-violet-700"
        />
        <MetricCard
          icon={Globe2}
          label="Pending Domains"
          value={dashboard.domains.pendingDns}
          note={`${dashboard.domains.verified} domains verified`}
          tone="bg-amber-50 text-amber-700"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Trial Subs"
          value={dashboard.subscriptions.trial}
          note={`${dashboard.subscriptions.active} active subscriptions`}
          tone="bg-emerald-50 text-emerald-700"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden rounded-lg border-border/70 bg-white/80 shadow-sm">
          <CardHeader className="border-b border-border/70 p-5">
            <CardTitle className="text-lg">Recent Provisioning Jobs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Tenant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead className="text-center">Attempts</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Finished</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.recentProvisioningJobs.map((job) => (
                  <TableRow key={`${job.tenant}-${job.startedAt}`}>
                    <TableCell className="font-medium">{job.tenant}</TableCell>
                    <TableCell>{job.type}</TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} />
                    </TableCell>
                    <TableCell>{job.step}</TableCell>
                    <TableCell className="text-center">{job.attempts}</TableCell>
                    <TableCell>{job.startedAt}</TableCell>
                    <TableCell>{job.finishedAt || "Running"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-lg border-border/70 bg-white/80 shadow-sm">
          <CardHeader className="border-b border-border/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-lg">Needs Attention</CardTitle>
              <AlertTriangle className="size-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {dashboard.attention.failedTenants.map((tenant) => (
              <AttentionItem
                key={tenant.companyName}
                title={tenant.companyName}
                detail={tenant.message}
                meta={tenant.step}
                action="Retry"
              />
            ))}
            {dashboard.attention.pendingDomains.map((domain) => (
              <AttentionItem
                key={domain.hostname}
                title={domain.hostname}
                detail={domain.companyName}
                meta={domain.status}
                action="Verify"
              />
            ))}
            {dashboard.attention.failedDatabases.map((database) => (
              <AttentionItem
                key={database.companyName}
                title={database.companyName}
                detail={database.message}
                meta={`${database.dbType} database`}
                action="Edit DB"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
