"use client";

import { useSuperadminTenant } from "@/features/superadmin/tenants/providers/superadmin-tenants-provider";
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

const valueOrDash = (value) => value ?? "-";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const DetailItem = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium uppercase text-muted-foreground">
      {label}
    </p>
    <p className="break-words text-sm font-semibold text-foreground">
      {valueOrDash(value)}
    </p>
  </div>
);

const StatusBadge = ({ value }) => (
  <Badge variant="outline" className="capitalize">
    {valueOrDash(value)}
  </Badge>
);

const ScrollTable = ({ headers, children }) => (
  <div>
    <Table className="table-fixed">
      <TableHeader className="bg-white">
        <TableRow>
          {headers.map((header) => (
            <TableHead key={header}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
    </Table>
    <div className="max-h-[360px] overflow-y-auto border-t border-border/70">
      <Table className="table-fixed">
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  </div>
);

export const SuperadminTenantView = () => {
  const { selectedRecord: tenant, closeForm, openRecord, retryRecord } =
    useSuperadminTenant();

  if (!tenant) {
    return (
      <section className="space-y-4">
        <Card className="border-border/70 bg-white/70">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Tenant details are not available.
            </p>
            <Button className="mt-4" type="button" onClick={closeForm}>
              Back to Listing
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const database = tenant.database || {};
  const currentSubscription = tenant.currentSubscription;
  const subscriptions = tenant.subscriptions || [];
  const domains = tenant.domains || [];
  const provisioningJobs = tenant.provisioningJobs || [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[10px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Tenant details
          </p>
          <h1 className="mt-1 text-2xl leading-none tracking-tight font-display">
            {tenant.companyName}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge value={tenant.status} />
            <StatusBadge value={tenant.provisioningStep} />
            <StatusBadge value={database.dbType} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={closeForm}>
            Back to Listing
          </Button>
          {tenant.actions?.canRetry ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => retryRecord(tenant.id)}
            >
              Retry Provisioning
            </Button>
          ) : null}
          <Button type="button" onClick={() => openRecord(tenant.id, "edit")}>
            Edit Tenant
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 border-border/70 bg-white/70 lg:col-span-8">
          <CardHeader>
            <CardTitle>Tenant summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <DetailItem label="Company" value={tenant.companyName} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <DetailItem label="Slug" value={tenant.slug} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <DetailItem label="Source" value={tenant.onboardingSource} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <DetailItem label="Created" value={formatDate(tenant.createdAt)} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <DetailItem label="Updated" value={formatDate(tenant.updatedAt)} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <DetailItem label="Failure" value={tenant.failureReason} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 border-border/70 bg-white/70 lg:col-span-4">
          <CardHeader>
            <CardTitle>Admin account</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <DetailItem label="Name" value={tenant.adminUser?.name} />
            <DetailItem label="Email" value={tenant.adminUser?.email} />
            <DetailItem label="Role" value={tenant.adminUser?.role} />
            <DetailItem label="Status" value={tenant.adminUser?.status} />
            <DetailItem label="Seed status" value={tenant.adminSeed?.status} />
            <DetailItem label="Seed failure" value={tenant.adminSeed?.failureReason} />
            {tenant.adminUserError ? (
              <DetailItem label="Lookup error" value={tenant.adminUserError} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-white/70">
        <CardHeader>
          <CardTitle>Database</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="Type" value={database.dbType} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="Status" value={database.status} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="DB Name" value={database.dbName} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="Version" value={database.currentVersion} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="Host" value={database.dbHost} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="Port" value={database.dbPort} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="User" value={database.dbUser} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="Password" value={database.dbPassword} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="Verified" value={formatDate(database.verifiedAt)} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="Ready" value={formatDate(database.readyAt)} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem
              label="Last migration"
              value={formatDate(database.lastMigrationAt)}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="Failure" value={database.failureReason} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-white/70">
        <CardHeader>
          <CardTitle>Current subscription</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="Plan" value={currentSubscription?.plan?.name} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem label="Status" value={currentSubscription?.status} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem
              label="Billing"
              value={currentSubscription?.plan?.billingCycle}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem
              label="Amount"
              value={
                currentSubscription
                  ? `${currentSubscription.currency} ${currentSubscription.amount}`
                  : "-"
              }
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem
              label="Started"
              value={formatDate(currentSubscription?.startDate)}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem
              label="Trial ends"
              value={formatDate(currentSubscription?.trialEndAt)}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem
              label="Ends"
              value={formatDate(currentSubscription?.endDate)}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DetailItem
              label="Auto renew"
              value={
                currentSubscription
                  ? currentSubscription.autoRenew
                    ? "Yes"
                    : "No"
                  : "-"
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 bg-white/70">
        <CardHeader>
          <CardTitle>Subscription history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollTable
            headers={[
              "Plan",
              "Status",
              "Amount",
              "Start",
              "Trial End",
              "End",
              "Current",
            ]}
          >
                {subscriptions.length ? (
                  subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>{valueOrDash(subscription.plan?.name)}</TableCell>
                      <TableCell>{valueOrDash(subscription.status)}</TableCell>
                      <TableCell>
                        {subscription.currency} {subscription.amount}
                      </TableCell>
                      <TableCell>{formatDate(subscription.startDate)}</TableCell>
                      <TableCell>{formatDate(subscription.trialEndAt)}</TableCell>
                      <TableCell>{formatDate(subscription.endDate)}</TableCell>
                      <TableCell>
                        {subscription.isCurrent ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-6 text-center">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                )}
          </ScrollTable>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 bg-white/70">
        <CardHeader>
          <CardTitle>Domains</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollTable
            headers={[
              "Hostname",
              "Type",
              "Primary",
              "Status",
              "SSL",
              "Verified",
            ]}
          >
                {domains.length ? (
                  domains.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell>{valueOrDash(domain.hostname)}</TableCell>
                      <TableCell>{valueOrDash(domain.type)}</TableCell>
                      <TableCell>{domain.isPrimary ? "Yes" : "No"}</TableCell>
                      <TableCell>{valueOrDash(domain.status)}</TableCell>
                      <TableCell>{valueOrDash(domain.sslStatus)}</TableCell>
                      <TableCell>{formatDate(domain.verifiedAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center">
                      No domains found.
                    </TableCell>
                  </TableRow>
                )}
          </ScrollTable>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 bg-white/70">
        <CardHeader>
          <CardTitle>Provisioning jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollTable
            headers={[
              "Type",
              "Step",
              "Status",
              "Attempts",
              "Started",
              "Finished",
              "Error",
            ]}
          >
                {provisioningJobs.length ? (
                  provisioningJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{valueOrDash(job.type)}</TableCell>
                      <TableCell>{valueOrDash(job.step)}</TableCell>
                      <TableCell>{valueOrDash(job.status)}</TableCell>
                      <TableCell>
                        {job.attempts ?? 0}/{job.maxAttempts ?? "-"}
                      </TableCell>
                      <TableCell>{formatDate(job.startedAt)}</TableCell>
                      <TableCell>{formatDate(job.finishedAt)}</TableCell>
                      <TableCell>{valueOrDash(job.errorMessage)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-6 text-center">
                      No provisioning jobs found.
                    </TableCell>
                  </TableRow>
                )}
          </ScrollTable>
        </CardContent>
      </Card>
    </section>
  );
};
