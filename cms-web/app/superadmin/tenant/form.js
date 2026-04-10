"use client";

import { useTenantSuperadmin } from "@/app/context/tenantSuperadmin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const TenantForm = () => {
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
  } = useTenantSuperadmin();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
        <div>
          <h1 className="text-2xl leading-none tracking-tight font-display">
            {mode === "edit" ? "Edit Tenant" : "Add Tenant"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {mode === "edit"
              ? "Update tenant details and save changes."
              : "Create a new tenant workspace with validated details."}
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={formik.handleSubmit}>
        {/* Basic Info */}
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2">
            <CardTitle className="text-md">Basic info</CardTitle>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Input
                  name="tenant_name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Tenant name"
                  value={formik.values.tenant_name}
                  error={formik.errors.tenant_name}
                />
                {formik.touched.tenant_name && formik.errors.tenant_name && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.tenant_name}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  name="owner_name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Owner name"
                  value={formik.values.owner_name}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  name="owner_email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Owner email"
                  type="email"
                  value={formik.values.owner_email}
                  error={formik.errors.owner_email}
                />
                {formik.touched.owner_email && formik.errors.owner_email && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.owner_email}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  name="domain"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Primary domain"
                  value={formik.values.domain}
                  error={formik.errors.domain}
                />
                {formik.touched.domain && formik.errors.domain && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.domain}
                  </p>
                )}
              </div>

              <div className="col-span-12">
                <Textarea
                  name="notes"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Internal notes"
                  value={formik.values.notes}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domain Info */}
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2">
            <CardTitle className="text-md">Domain</CardTitle>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Input
                  name="tenant_name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Tenant name"
                  value={formik.values.tenant_name}
                  error={formik.errors.tenant_name}
                />
                {formik.touched.tenant_name && formik.errors.tenant_name && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.tenant_name}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  name="owner_name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Owner name"
                  value={formik.values.owner_name}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Info */}
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2">
            <CardTitle className="text-md">Database</CardTitle>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Input
                  name="tenant_name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Tenant name"
                  value={formik.values.tenant_name}
                  error={formik.errors.tenant_name}
                />
                {formik.touched.tenant_name && formik.errors.tenant_name && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.tenant_name}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  name="owner_name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Owner name"
                  value={formik.values.owner_name}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  name="owner_email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Owner email"
                  type="email"
                  value={formik.values.owner_email}
                  error={formik.errors.owner_email}
                />
                {formik.touched.owner_email && formik.errors.owner_email && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.owner_email}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  name="domain"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Primary domain"
                  value={formik.values.domain}
                  error={formik.errors.domain}
                />
                {formik.touched.domain && formik.errors.domain && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.domain}
                  </p>
                )}
              </div>

              <div className="col-span-12">
                <Textarea
                  name="notes"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Internal notes"
                  value={formik.values.notes}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button onClick={handleCloseForm} type="button" variant="outline">
            Back to Listing
          </Button>
          <Button type="submit">
            {mode === "edit" ? "Update Tenant" : "Create Tenant"}
          </Button>
        </div>
      </form>
    </section>
  );
};
