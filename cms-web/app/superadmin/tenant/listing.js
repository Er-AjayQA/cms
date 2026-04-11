"use client";

import { useTenantSuperadmin } from "@/app/context/superadmin_contexts/tenantSuperadmin";
import { TableListingNoRecords } from "@/components/TableListingNoRecords";
import { TableListingSkelton } from "@/components/TableListingSkelton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, PencilLine, Plus, Search, Trash2 } from "lucide-react";

export const TenantListing = () => {
  const {
    StatusBadge,
    formik,
    mode,
    setMode,
    handleCloseForm,
    handleAdd,
    handleGetData,
    selectedRecordId,
    setSelectedRecordId,
    listLoading,
    setListLoading,
    dataLoading,
    setDataLoading,
    listingData,
    setListingData,
    handleDeleteData,
    handleUpdateStatus,
    search,
    setSearch,
    roleOptions,
    setRoleOptions,
    subscriptionStatusOptions,
    setSubscriptionStatusOptions,
    sourceOptions,
    setSourceOptions,
    dbTypeOptions,
    setDbTypeOptions,
  } = useTenantSuperadmin();

  return (
    <section className="space-y-6">
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

          <Button size="lg" onClick={handleAdd}>
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
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {listLoading ? (
                <TableListingSkelton listingLength={5} columnLength={7} />
              ) : listingData.length <= 0 ? (
                <TableListingNoRecords span={7} />
              ) : (
                listingData.map((tenant, idx) => (
                  <TableRow key={tenant.id || idx} className="bg-white/20">
                    <TableCell className="py-1 text-center">
                      {idx + 1}.
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
                      {subscriptionStatusOptions?.find(
                        (item) => item.value === tenant.subscription_status,
                      )?.label || "-"}
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      {sourceOptions?.find(
                        (item) => item.value === tenant.onboarding_source,
                      )?.label || "-"}
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      <StatusBadge status={tenant.status} id={tenant.id} />
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="flex justify-center">
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => handleGetData(tenant?.id, "view")}
                          disabled={dataLoading}
                          className="hover:bg-blue-300"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => handleGetData(tenant?.id, "edit")}
                          disabled={dataLoading}
                          className="hover:bg-orange-300"
                        >
                          <PencilLine className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => handleDeleteData(tenant?.id)}
                          disabled={dataLoading}
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
        </CardContent>
      </Card>
    </section>
  );
};
