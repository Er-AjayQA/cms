"use client";

import { useDomains } from "@/app/context/superadmin_contexts/domainContext";
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

export const DomainListing = () => {
  const {
    StatusBadge,
    handleAdd,
    handleGetData,
    handleDeleteData,
    listLoading,
    dataLoading,
    listingData,
    search,
    setSearch,
  } = useDomains();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[10px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
        <div>
          <h1 className="text-2xl leading-none tracking-tight font-display">
            Domains listing
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Search, review, and manage tenant domains.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative min-w-[500px]">
            <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by hostname, type, status"
              name="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Button size="lg" onClick={handleAdd}>
            <Plus className="size-4" />
            Add Domain
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 bg-white/70">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/50 hover:bg-background/50">
                <TableHead className="w-[6%] text-center">SNo.</TableHead>
                <TableHead>Hostname</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Primary</TableHead>
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
                listingData.map((domain, idx) => (
                  <TableRow key={domain.id || idx} className="bg-white/20">
                    <TableCell className="py-1 text-center">
                      {idx + 1}.
                    </TableCell>
                    <TableCell className="py-1">
                      <p className="text-sm font-bold text-muted-foreground">
                        {domain.hostname}
                      </p>
                    </TableCell>
                    <TableCell className="py-1">
                      {domain?.tenant?.companyName || "-"}
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      {domain.type || "-"}
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      {domain.isPrimary ? "Yes" : "No"}
                    </TableCell>
                    <TableCell className="py-1 text-center">
                      <StatusBadge status={domain.status} id={domain.id} />
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="flex justify-center gap-1">
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => handleGetData(domain?.id, "view")}
                          disabled={dataLoading}
                          className="hover:bg-blue-300"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => handleGetData(domain?.id, "edit")}
                          disabled={dataLoading}
                          className="hover:bg-orange-300"
                        >
                          <PencilLine className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => handleDeleteData(domain?.id)}
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
