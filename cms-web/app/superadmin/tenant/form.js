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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TenantForm = () => {
  const {
    formik,
    mode,
    handleCloseForm,
    roleOptions,
    setRoleOptions,
    subscriptionStatusOptions,
    setSubscriptionStatusOptions,
    sourceOptions,
    setSourceOptions,
    dbTypeOptions,
    setDbTypeOptions,
  } = useTenantSuperadmin();

  const isDisable = mode === "view";
  const shouldShowDatabaseInfo =
    mode === "view" || formik.values.dbType === "own";
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
          <CardContent className="py-5 space-y-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6 space-y-2">
                <Label>Tenant/Company Name</Label>
                <Input
                  name="companyName"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="e.g: Vision Worlds..."
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

              <div className="col-span-12 md:col-span-6 space-y-2">
                <Label>Role</Label>
                <Select
                  name="role"
                  value={formik.values.role}
                  onValueChange={(value) => formik.setFieldValue("role", value)}
                  disabled={isDisable}
                >
                  <SelectTrigger
                    className="w-full"
                    onBlur={() => formik.setFieldTouched("role", true)}
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {roleOptions.map((option, idx) => {
                        return (
                          <SelectItem key={idx} value={option.value}>
                            {option.label}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6 space-y-2">
                <Label>Slug</Label>
                <Input
                  name="slug"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="e.g: vision-worlds..."
                  value={formik.values.slug}
                  error={formik.errors.slug}
                  disabled={isDisable}
                />
              </div>

              <div className="col-span-12 md:col-span-6 space-y-2">
                <Label>DB Type</Label>
                <Select
                  name="dbType"
                  value={formik.values.dbType}
                  onValueChange={(value) =>
                    formik.setFieldValue("dbType", value)
                  }
                  disabled={isDisable}
                >
                  <SelectTrigger
                    className="w-full"
                    onBlur={() => formik.setFieldTouched("dbType", true)}
                  >
                    <SelectValue placeholder="Select a DB type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {dbTypeOptions.map((option, idx) => {
                        return (
                          <SelectItem key={idx} value={option.value}>
                            {option.label}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
              <div className="col-span-12 md:col-span-6 space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  name="adminEmail"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="e.g: admin@gmail.com..."
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

              <div className="col-span-12 md:col-span-6 space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  name="adminPassword"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Enter password..."
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
              <div className="col-span-12 md:col-span-6 space-y-2">
                <Label>Subscription Status</Label>
                <Select
                  name="subscription_status"
                  value={formik.values.subscription_status}
                  onValueChange={(value) =>
                    formik.setFieldValue("subscription_status", value)
                  }
                  disabled={isDisable}
                >
                  <SelectTrigger
                    className="w-full"
                    onBlur={() =>
                      formik.setFieldTouched("subscription_status", true)
                    }
                  >
                    <SelectValue placeholder="Select a subscription status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {subscriptionStatusOptions.map((option, idx) => {
                        return (
                          <SelectItem key={idx} value={option.value}>
                            {option.label}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 md:col-span-6 space-y-2">
                <Label>Onboarding Source</Label>
                <Select
                  name="onboarding_source"
                  value={formik.values.onboarding_source}
                  onValueChange={(value) =>
                    formik.setFieldValue("onboarding_source", value)
                  }
                  disabled={isDisable}
                >
                  <SelectTrigger
                    className="w-full"
                    onBlur={() =>
                      formik.setFieldTouched("onboarding_source", true)
                    }
                  >
                    <SelectValue placeholder="Select a onboarding source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {sourceOptions.map((option, idx) => {
                        return (
                          <SelectItem key={idx} value={option.value}>
                            {option.label}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DB Info */}
        {shouldShowDatabaseInfo && (
          <Card className="overflow-hidden border-border/70 bg-white/70">
            <CardHeader className="py-2">
              <CardTitle className="text-md">Database info</CardTitle>
              <CardDescription>
                {mode === "view"
                  ? "View tenant database configuration."
                  : "Provide database details."}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-5">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label>DB Name</Label>
                  <Input
                    name="dbName"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder="e.g: vision_cms"
                    value={formik.values.dbName}
                    error={formik.errors.dbName}
                    disabled={isDisable}
                  />
                </div>

                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label>DB Host</Label>
                  <Input
                    name="dbHost"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder="e.g: 192.68.01.9..."
                    value={formik.values.dbHost}
                    error={formik.errors.dbHost}
                    disabled={isDisable}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label>DB Port</Label>
                  <Input
                    name="dbPort"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder="e.g: 3306"
                    value={formik.values.dbPort}
                    error={formik.errors.dbPort}
                    disabled={isDisable}
                  />
                </div>

                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label>DB User</Label>
                  <Input
                    name="dbUser"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder="e.g: root"
                    value={formik.values.dbUser}
                    error={formik.errors.dbUser}
                    disabled={isDisable}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label>DB Password</Label>
                  <Input
                    name="dbPassword"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder="Enter db password..."
                    value={formik.values.dbPassword}
                    error={formik.errors.dbPassword}
                    disabled={isDisable}
                  />
                </div>

                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label>Current Version</Label>
                  <Input
                    name="currentVersion"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder="e.g: 1, 2, 3..."
                    value={formik.values.currentVersion}
                    error={formik.errors.currentVersion}
                    disabled={isDisable}
                  />
                </div>
              </div>

              {mode === "view" && (
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-6 space-y-2">
                    <Label>DB Status</Label>
                    <Input value={formik.values.dbStatus || "-"} disabled />
                  </div>

                  <div className="col-span-12 md:col-span-6 space-y-2">
                    <Label>Provision Source</Label>
                    <Input
                      value={formik.values.dbProvisionSource || "-"}
                      disabled
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
