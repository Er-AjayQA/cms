"use client";

import { useSuperadminDomain } from "@/features/superadmin/domains/providers/superadmin-domains-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PencilLine, Plus, Trash2, X } from "lucide-react";

export const SuperadminDomainForm = () => {
  const {
    formik,
    closeForm,
    records,
    StatusBadge,
    domainEditorMode,
    beginCreateDomain,
    beginEditDomain,
    cancelDomainEditor,
    deleteRecord,
    verifyDomain,
    checkDomainSsl,
    isRecordLoading,
  } = useSuperadminDomain();

  const tenant = records?.tenant;
  const domains = records?.domains || [];
  const isEditingDomain = Boolean(domainEditorMode);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[10px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl leading-none tracking-tight font-display">
            {tenant?.companyName || "Tenant domains"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review and manage all registered domains for this tenant.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Slug: {tenant?.slug || "-"} | Total domains: {domains.length}
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={closeForm}>
            Back to Listing
          </Button>
          <Button type="button" onClick={beginCreateDomain}>
            <Plus className="size-4" />
            Add Domain
          </Button>
        </div>
      </div>

      {isEditingDomain && (
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-md">
                {domainEditorMode === "edit" ? "Edit domain" : "Add domain"}
              </CardTitle>
              <CardDescription>
                Domain changes apply only to{" "}
                {tenant?.companyName || "this tenant"}.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={cancelDomainEditor}
              className="bg-transparent border-none"
            >
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="py-5">
            <form className="space-y-4" onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label>Hostname</Label>
                  <Input
                    type="text"
                    name="hostname"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder="example.com"
                    value={formik.values.hostname}
                    error={formik.errors.hostname}
                  />
                  {formik.touched.hostname && formik.errors.hostname && (
                    <p className="mt-1 text-xs text-red-600 ms-2">
                      {formik.errors.hostname}
                    </p>
                  )}
                </div>

                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label>Type</Label>
                  <Input
                    type="text"
                    name="type"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder="custom"
                    value={formik.values.type}
                  />
                </div>

                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label>Primary</Label>
                  <label className="flex h-10 items-center gap-3 rounded-[10px] border border-input bg-background px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      name="isPrimary"
                      checked={formik.values.isPrimary}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    Set as primary domain
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelDomainEditor}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {domainEditorMode === "edit"
                    ? "Update Domain"
                    : "Create Domain"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden border-border/70 bg-white/70">
        <CardHeader className="py-2">
          <CardTitle className="text-md">Registered domains</CardTitle>
          <CardDescription>
            Open a domain to review status, SSL, verification, and edit options.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-5">
          {domains.length ? (
            <Accordion type="single" collapsible className="w-full">
              {domains.map((domain, idx) => (
                <AccordionItem key={domain.id} value={domain.id}>
                  <AccordionTrigger>
                    <div className="flex w-full flex-wrap items-center gap-3 text-left">
                      <span className="font-semibold">
                        {idx + 1}. {domain.hostname}
                      </span>
                      <StatusBadge value={domain.status} />
                      {domain.isPrimary ? (
                        <StatusBadge value="primary" />
                      ) : null}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-12 gap-4 py-3">
                      <div className="col-span-12 md:col-span-4">
                        <p className="text-xs uppercase text-muted-foreground">
                          Type
                        </p>
                        <p className="text-sm font-semibold">
                          {domain.type || "-"}
                        </p>
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <p className="text-xs uppercase text-muted-foreground">
                          SSL Status
                        </p>
                        <p className="text-sm font-semibold">
                          {domain.sslStatus || "-"}
                        </p>
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <p className="text-xs uppercase text-muted-foreground">
                          TXT Host
                        </p>
                        <p className="break-words text-sm font-semibold">
                          {domain.verificationTxtHost || "-"}
                        </p>
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <p className="text-xs uppercase text-muted-foreground">
                          TXT Value
                        </p>
                        <p className="break-words text-sm font-semibold">
                          {domain.verificationToken || "-"}
                        </p>
                      </div>
                      <div className="col-span-12">
                        <p className="text-xs uppercase text-muted-foreground">
                          Failure Reason
                        </p>
                        <p className="text-sm font-semibold">
                          {domain.failureReason || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3  pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => verifyDomain(domain.id)}
                        disabled={isRecordLoading}
                      >
                        Verify Domain
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => checkDomainSsl(domain.id)}
                        disabled={isRecordLoading}
                      >
                        Check SSL
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => beginEditDomain(domain)}
                      >
                        <PencilLine className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => deleteRecord(domain.id)}
                        className="bg-red-600 text-white"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="rounded-[10px] border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No domains registered for this tenant.
              </p>
              <Button
                type="button"
                className="mt-4"
                onClick={beginCreateDomain}
              >
                <Plus className="size-4" />
                Add Domain
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
