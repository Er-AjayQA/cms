"use client";

import { useSuperadminTenant } from "@/features/superadmin/tenants/providers/superadmin-tenants-provider";
import { TableListingNoRecords } from "@/components/shared/table-listing-no-records";
import { TableListingSkeleton } from "@/components/shared/table-listing-skeleton";
import { SuperadminTenantMigrationDialog } from "@/features/superadmin/tenants/components/superadmin-tenant-migration-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatabaseZap, Eye, PencilLine, Plus, Search, Trash2 } from "lucide-react";

const MigrationStatusBadge = ({ status }) => {
  const state = status?.state;

  if (state === "pending") {
    return (
      <Badge
        className="border border-amber-600/20 bg-amber-500/15 text-amber-700"
        title={`${status.pendingCount || 0} pending migration(s)`}
      >
        Need migration
      </Badge>
    );
  }

  if (state === "drift") {
    return (
      <Badge
        className="border border-red-600/20 bg-red-500/15 text-red-700"
        title={`${status.appliedButMissingCount || 0} applied migration(s) missing from code`}
      >
        Drift
      </Badge>
    );
  }

  if (state === "up_to_date") {
    return (
      <Badge className="border border-emerald-600/20 bg-emerald-500/15 text-emerald-700">
        Up to date
      </Badge>
    );
  }

  return (
    <Badge
      className="border border-slate-600/20 bg-slate-500/15 text-slate-700"
      title={status?.error || "Migration status unavailable"}
    >
      Unknown
    </Badge>
  );
};

export const SuperadminTenantListing = () => {
  const {
    StatusToggleBadge,
    openCreateForm,
    openRecord,
    isListLoading,
    isRecordLoading,
    records,
    deleteRecord,
    runTenantMigration,
    confirmTenantMigration,
    cancelTenantMigration,
    pendingMigrationTenant,
    migrationLoadingId,
    search,
    setSearch,
    currentPage,
    pageSize,
    pagination,
    goToPage,
    changePageSize,
  } = useSuperadminTenant();

  const startRecord =
    pagination.totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(
    currentPage * pageSize,
    pagination.totalRecords || 0,
  );

  return (
    <section className="space-y-6">
      <SuperadminTenantMigrationDialog
        tenant={pendingMigrationTenant}
        onCancel={cancelTenantMigration}
        onConfirm={confirmTenantMigration}
      />

      <div className="flex flex-col gap-4 rounded-[10px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
        <div>
          <h1 className="text-2xl leading-none tracking-tight font-display">
            Tenant listing
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Search, review, and manage tenants from one operational list.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative min-w-[500px]">
            <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by tenant, slug, status"
              name="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Button size="lg" onClick={openCreateForm}>
            <Plus className="size-4" />
            Add Tenant
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 bg-white/70">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/50 hover:bg-background/50">
                <TableHead className="w-[6%] text-center">SNo.</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Subscription</TableHead>
                <TableHead className="text-center">Source</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Migration</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isListLoading ? (
                <TableListingSkeleton listingLength={5} columnLength={8} />
              ) : records.length <= 0 ? (
                <TableListingNoRecords span={8} />
              ) : (
                records.map((tenant, idx) => (
                  <TableRow key={tenant.id || idx} className="bg-white/20">
                    <TableCell className="py-1 text-center">
                      {(currentPage - 1) * pageSize + idx + 1}.
                    </TableCell>
                    <TableCell className="py-1">
                      <p className="text-sm font-bold text-muted-foreground">
                        {tenant.companyName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        DB: {tenant?.database?.dbName || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="py-1">{tenant.slug}</TableCell>
                    <TableCell className="py-1 text-center">
                      {tenant?.subscription?.planName || "-"}
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      {tenant?.source === "control_panel"
                        ? "Control Panel"
                        : tenant?.source === "website"
                          ? "Website"
                          : "-"}
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      <StatusToggleBadge
                        status={tenant.status}
                        id={tenant.id}
                      />
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      <MigrationStatusBadge status={tenant.migrationStatus} />
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="flex justify-center">
                        <Button
                          size="icon"
                          variant="none"
                          title="Run migrations"
                          onClick={() => runTenantMigration(tenant?.id)}
                          disabled={
                            isRecordLoading ||
                            migrationLoadingId === tenant.id ||
                            tenant?.migrationStatus?.state === "up_to_date" ||
                            tenant?.migrationStatus?.state === "drift" ||
                            tenant?.migrationStatus?.state === "unknown" ||
                            ["creating", "verifying", "migrating", "seeding"].includes(
                              tenant?.database?.status,
                            )
                          }
                          className="hover:bg-emerald-300"
                        >
                          <DatabaseZap
                            className={`size-4 ${
                              migrationLoadingId === tenant.id
                                ? "animate-pulse"
                                : ""
                            }`}
                          />
                        </Button>
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => openRecord(tenant?.id, "view")}
                          disabled={isRecordLoading}
                          className="hover:bg-blue-300"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => openRecord(tenant?.id, "edit")}
                          disabled={isRecordLoading}
                          className="hover:bg-orange-300"
                        >
                          <PencilLine className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => deleteRecord(tenant?.id)}
                          disabled={isRecordLoading}
                          className="hover:bg-red-300"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startRecord}-{endRecord} of{" "}
              {pagination.totalRecords || 0} tenants
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => changePageSize(Number(value))}
              >
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[10, 25, 50, 100].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} / page
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={isListLoading || !pagination.hasPreviousPage}
                >
                  Previous
                </Button>
                <span className="min-w-24 text-center text-sm text-muted-foreground">
                  Page {pagination.page || currentPage} of{" "}
                  {pagination.totalPages || 1}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={isListLoading || !pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
