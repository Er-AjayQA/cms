"use client";

import { useTenantSuperadmin } from "@/app/context/superadmin_contexts/tenantSuperadmin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const TenantForm = () => {
  const { formik, mode, handleCloseForm } = useTenantSuperadmin();

  const isDisable = mode === "view";
  const formTitle = {
    view: "View Tenant",
    edit: "Edit Tenant",
    create: "Add Tenant",
  };

  const formDescription = {
    view: "View tenant details.",
    edit: "Update tenant details and save changes.",
    create: "Create a new tenant workspace with validated details.",
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
        {/* Basic Info */}
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2">
            <CardTitle className="text-md">Basic info</CardTitle>
            <CardDescription>Basic tenant details.</CardDescription>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Input
                  name="companyName"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Tenant name"
                  value={formik.values.companyName}
                  error={formik.errors.companyName}
                  disabled={isDisable}
                />
                {formik.touched.companyName && formik.errors.companyName && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.companyName}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  name="slug"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Slug"
                  value={formik.values.slug}
                  error={formik.errors.slug}
                  disabled={isDisable}
                />
                {formik.touched.slug && formik.errors.slug && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.slug}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Info */}
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2">
            <CardTitle className="text-md">Admin login</CardTitle>
            <CardDescription>
              Create the first tenant admin account.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Input
                  type="email"
                  name="adminEmail"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Admin email"
                  value={formik.values.adminEmail}
                  error={formik.errors.adminEmail}
                  disabled={isDisable || mode === "edit"}
                />
                {formik.touched.adminEmail && formik.errors.adminEmail && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.adminEmail}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  type="password"
                  name="adminPassword"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Admin password"
                  value={formik.values.adminPassword}
                  error={formik.errors.adminPassword}
                  disabled={isDisable || mode === "edit"}
                />
                {formik.touched.adminPassword &&
                  formik.errors.adminPassword && (
                    <p className="mt-1 text-xs text-red-600 ms-2">
                      {formik.errors.adminPassword}
                    </p>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Info */}
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2">
            <CardTitle className="text-md">Platform info</CardTitle>
            <CardDescription>
              Track onboarding and subscription state.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Input
                  name="subscription_status"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Subscription status"
                  value={formik.values.subscription_status}
                  disabled={isDisable}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  name="onboarding_source"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Onboarding source"
                  value={formik.values.onboarding_source}
                  disabled={isDisable}
                />
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
              {mode === "edit" ? "Update Tenant" : "Create Tenant"}
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};
