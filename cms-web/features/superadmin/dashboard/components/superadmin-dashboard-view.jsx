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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSuperadminDashboard } from "../providers/superadmin-dashboard-provider";
import { TableListingSkeleton } from "@/components/shared/table-listing-skeleton";
import { TableListingNoRecords } from "@/components/shared/table-listing-no-records";

export function SuperadminDashboardView() {
  const {
    dashboardData,
    isDashboardLoading,
    StatusBadge,
    MetricCard,
    AttentionItem,
    handleRefresh,
  } = useSuperadminDashboard();
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
        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={handleRefresh}
        >
          <RefreshCw
            className={`size-4 ${isDashboardLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Tenant Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={UsersRound}
          label="Total Tenants"
          value={dashboardData?.tenants?.total}
          note={`${dashboardData?.tenants?.active} active tenants`}
          tone="bg-sky-50 text-sky-700"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Active"
          value={dashboardData?.tenants?.active}
          note="Ready for tenant users"
          tone="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          icon={ShieldAlert}
          label="Failed"
          value={dashboardData?.tenants?.failed}
          note="Needs retry or config update"
          tone="bg-red-50 text-red-700"
        />
        <MetricCard
          icon={Clock3}
          label="Provisioning"
          value={dashboardData?.tenants?.provisioning}
          note="Currently in progress"
          tone="bg-amber-50 text-amber-700"
        />
      </div>

      {/* Database Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Database}
          label="Managed DB"
          value={dashboardData?.databases?.managed}
          note={`${dashboardData?.databases?.ready} databases ready`}
          tone="bg-cyan-50 text-cyan-700"
        />
        <MetricCard
          icon={Database}
          label="Own DB"
          value={dashboardData?.databases?.own}
          note={`${dashboardData?.databases?.failed} database failures`}
          tone="bg-violet-50 text-violet-700"
        />
        <MetricCard
          icon={Globe2}
          label="Pending Domains"
          value={dashboardData?.domains?.pendingDns}
          note={`${dashboardData?.domains?.verified} domains verified`}
          tone="bg-amber-50 text-amber-700"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Trial Subs"
          value={dashboardData?.subscriptions?.trial}
          note={`${dashboardData?.subscriptions?.active} active subscriptions`}
          tone="bg-emerald-50 text-emerald-700"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Jobs Card */}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDashboardLoading ? (
                  <TableListingSkeleton listingLength={3} columnLength={5} />
                ) : dashboardData?.recentProvisioningJobs?.length !== 0 ? (
                  dashboardData?.recentProvisioningJobs?.map((job) => (
                    <TableRow key={`${job.tenant}-${job.startedAt}`}>
                      <TableCell className="py-1">
                        <p className="text-sm font-semibold text-muted-foreground">
                          {job.companyName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          DB: {job.dbName || "-"}
                        </p>
                      </TableCell>
                      <TableCell>{job.type}</TableCell>
                      <TableCell>
                        <StatusBadge status={job.status} />
                      </TableCell>
                      <TableCell>{job.step}</TableCell>
                      <TableCell className="text-center">
                        {job.attempts}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableListingNoRecords span={5} />
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Attention Card */}
        <Card className="overflow-hidden rounded-lg border-border/70 bg-white/80 shadow-sm">
          <CardHeader className="border-b border-border/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-lg">Needs Attention</CardTitle>
              <AlertTriangle className="size-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {dashboardData?.attention?.failedTenants.map((tenant) => (
              <AttentionItem
                key={tenant.companyName}
                title={tenant.companyName}
                detail={tenant.message}
                meta={tenant.step}
                action={tenant.action}
              />
            ))}
            {dashboardData?.attention?.pendingDomains.map((domain) => (
              <AttentionItem
                key={domain.hostname}
                title={domain.hostname}
                detail={domain.companyName}
                meta={domain.status}
                action="Verify"
              />
            ))}
            {dashboardData?.attention?.failedDatabases.map((database) => (
              <AttentionItem
                key={database.companyName}
                title={database.companyName}
                detail={database.message}
                meta={`${database.dbType} database`}
                action={database.action}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
