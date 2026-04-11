"use client";

import { useSubscriptionPlans } from "@/app/context/superadmin_contexts/subscriptionPlanContext";
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

export const SubscriptionListing = () => {
  const {
    StatusBadge,
    handleAdd,
    handleGetData,
    handleDeleteData,
    listLoading,
    dataLoading,
    listingData,
    billingCycleOptions,
    codeBadge,
    handleUpdateStatus,
    search,
    setSearch,
  } = useSubscriptionPlans();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[10px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
        <div>
          <h1 className="text-2xl leading-none tracking-tight font-display">
            Plans listing
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Search, review, and manage subscription plans.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative min-w-[500px]">
            <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by name, code"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button size="lg" onClick={handleAdd}>
            <Plus className="size-4" />
            Add Plan
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 bg-white/70">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/50 hover:bg-background/50">
                <TableHead className="w-[6%] text-center">SNo.</TableHead>
                <TableHead className="w-[25%]">Plan</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-center">Billing Cycle</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {listLoading ? (
                <TableListingSkelton listingLength={5} columnLength={6} />
              ) : listingData.length <= 0 ? (
                <TableListingNoRecords span={6} />
              ) : (
                listingData.map((plan, idx) => (
                  <TableRow key={idx} className="bg-white/20">
                    <TableCell className="text-center py-1">
                      {idx + 1}.
                    </TableCell>
                    <TableCell className="py-1">
                      <div>
                        <p className="text-sm text-muted-foreground font-bold">
                          {plan.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-1">
                      <div>
                        <p>{codeBadge(plan?.code)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-1">
                      {
                        billingCycleOptions?.find(
                          (item) => item.value === plan.billing_cycle,
                        )?.label
                      }
                    </TableCell>
                    <TableCell className="text-center py-1">
                      <StatusBadge status={plan.status} id={plan.id} />
                    </TableCell>
                    <TableCell className="py-1">
                      <div className="flex justify-center gap-1">
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => handleGetData(plan?.id, "view")}
                          disabled={dataLoading}
                          className="hover:bg-blue-300"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => handleGetData(plan?.id, "edit")}
                          disabled={dataLoading}
                          className="hover:bg-orange-300"
                        >
                          <PencilLine className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="none"
                          onClick={() => handleDeleteData(plan?.id)}
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
