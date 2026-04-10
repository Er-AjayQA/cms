"use client";

import { useSubscriptionPlans } from "@/app/context/superadmin_contexts/subscriptionPlanContext";
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
import { Eye, PencilLine, Plus, Search } from "lucide-react";

export const SubscriptionListing = () => {
  const {
    StatusBadge,
    formik,
    mode,
    handleCloseForm,
    handleAdd,
    handleEdit,
    handleView,
    selectedTenant,
    setSelectedTenant,
    listLoading,
    setListLoading,
    listingData,
    setListingData,
  } = useSubscriptionPlans();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
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
              placeholder="Search by tenant, owner, domain"
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
                <TableHead>Tenant</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {listingData.map((tenant) => (
                <TableRow key={tenant.code} className="bg-white/20">
                  <TableCell>
                    <div>
                      <p className="font-medium">{tenant.companyName}</p>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {tenant.code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{tenant.owner}</p>
                      <p className="text-sm text-muted-foreground">
                        {tenant.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{tenant.plan}</TableCell>
                  <TableCell>
                    <StatusBadge status={tenant.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tenant.domain}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(tenant)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(tenant)}
                      >
                        <PencilLine className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
};
