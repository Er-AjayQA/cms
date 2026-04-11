"use client";

import { useDomains } from "@/app/context/superadmin_contexts/domainContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const DomainForm = () => {
  const { formik, mode, handleCloseForm, tenantOptions } = useDomains();

  const isDisable = mode === "view";
  const formTitle = {
    view: "View Domain",
    edit: "Edit Domain",
    create: "Add Domain",
  };

  const formDescription = {
    view: "View domain details.",
    edit: "Update domain details and save changes.",
    create: "Create a new tenant domain.",
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[10px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
        <div>
          <h1 className="text-2xl leading-none tracking-tight font-display">
            {formTitle[mode]}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {formDescription[mode]}
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={formik.handleSubmit}>
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2">
            <CardTitle className="text-md">Domain info</CardTitle>
            <CardDescription>Map a hostname to a tenant.</CardDescription>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Select
                  name="tenantId"
                  value={formik.values.tenantId}
                  onValueChange={(value) =>
                    formik.setFieldValue("tenantId", value)
                  }
                  disabled={isDisable}
                >
                  <SelectTrigger
                    className="w-full"
                    onBlur={() => formik.setFieldTouched("tenantId", true)}
                  >
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {tenantOptions.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.companyName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formik.touched.tenantId && formik.errors.tenantId && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.tenantId}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  type="text"
                  name="hostname"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="example.com"
                  value={formik.values.hostname}
                  error={formik.errors.hostname}
                  disabled={isDisable}
                />
                {formik.touched.hostname && formik.errors.hostname && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.hostname}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  type="text"
                  name="type"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="custom"
                  value={formik.values.type}
                  disabled={isDisable}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="flex h-10 items-center gap-3 rounded-[10px] border border-input bg-background px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    name="isPrimary"
                    checked={formik.values.isPrimary}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    disabled={isDisable}
                  />
                  Primary domain
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button onClick={handleCloseForm} type="button" variant="outline">
            Back to Listing
          </Button>
          {mode !== "view" && (
            <Button type="submit">
              {mode === "edit" ? "Update Domain" : "Create Domain"}
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};
