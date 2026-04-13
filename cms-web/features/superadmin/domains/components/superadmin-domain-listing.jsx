"use client";

import { useSuperadminDomain } from "@/features/superadmin/domains/providers/superadmin-domains-provider";
import { TableListingNoRecords } from "@/components/shared/table-listing-no-records";
import { TableListingSkeleton } from "@/components/shared/table-listing-skeleton";
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
import {
  ArrowRight,
  Search,
} from "lucide-react";

export const SuperadminDomainListing = () => {
  const {
    openRecord,
    isListLoading,
    isRecordLoading,
    search,
    setSearch,
    list,
  } = useSuperadminDomain();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[10px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
        <div>
          <h1 className="text-2xl leading-none tracking-tight font-display">
            Domains listing
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Search tenants and manage registered domains from one place.
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
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 bg-white/70">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/50 hover:bg-background/50">
                <TableHead className="w-[6%] text-center">SNo.</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Primary Domain</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Verified</TableHead>
                <TableHead className="text-center">Pending</TableHead>
                <TableHead className="text-center">Failed</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isListLoading ? (
                <TableListingSkeleton listingLength={5} columnLength={8} />
              ) : list?.length <= 0 ? (
                <TableListingNoRecords span={8} />
              ) : (
                list?.map((tenant, idx) => (
                  <TableRow key={tenant.id || idx} className="bg-white/20">
                    <TableCell className="py-1 text-center">
                      {idx + 1}.
                    </TableCell>
                    <TableCell className="py-1">
                      <p className="text-sm font-bold text-muted-foreground">
                        {tenant.companyName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tenant.slug}
                      </p>
                    </TableCell>
                    <TableCell className="py-1">
                      {tenant?.primaryDomain?.hostname || "-"}
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      {tenant?.totalDomains || 0}
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      {tenant?.verifiedDomains || 0}
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      {tenant?.pendingDomains || 0}
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      {tenant?.failedDomains || 0}
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="flex justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRecord(tenant?.id, "manage")}
                          disabled={isRecordLoading}
                        >
                          Proceed
                          <ArrowRight className="size-4" />
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
