"use client";

import { useState } from "react";
import { useSuperadminTenant } from "@/features/superadmin/tenants/providers/superadmin-tenants-provider";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, EyeOff } from "lucide-react";

export const SuperadminTenantForm = () => {
  const {
    formik,
    activeView,
    closeForm,
    dbTypeOptions,
    plansOptions,
    loadedDbType,
    selectedRecord,
    revealTenantDatabasePassword,
    passwordLoadingId,
  } = useSuperadminTenant();

  const isReadOnly = activeView === "view";
  const isEditing = activeView === "edit";
  const canEditAdminSeed =
    isEditing && selectedRecord?.actions?.canEditAdminSeed;
  const isAdminLocked = isReadOnly || (isEditing && !canEditAdminSeed);
  const [pendingDbType, setPendingDbType] = useState(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showDbPassword, setShowDbPassword] = useState(false);
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

  const handleDbTypeChange = (value) => {
    if (isEditing && value !== formik.values.dbType) {
      setPendingDbType(value);
      return;
    }

    applyDbTypeChange(value);
  };

  const applyDbTypeChange = (value) => {
    formik.setFieldValue("dbType", value);

    if (
      activeView === "edit" &&
      loadedDbType === "managed" &&
      value === "own"
    ) {
      formik.setFieldValue("dbName", "");
      formik.setFieldValue("dbHost", "");
      formik.setFieldValue("dbPort", 3306);
      formik.setFieldValue("dbUser", "");
      formik.setFieldValue("dbPassword", "");
      formik.setFieldValue("currentVersion", 0);
    }
  };

  const confirmDbTypeChange = () => {
    if (pendingDbType) {
      applyDbTypeChange(pendingDbType);
      setPendingDbType(null);
    }
  };

  const handleDbPasswordToggle = async () => {
    if (
      !showDbPassword &&
      selectedRecord?.id &&
      formik.values.dbPassword === "********"
    ) {
      const revealed = await revealTenantDatabasePassword(selectedRecord.id);

      if (!revealed) {
        return;
      }
    }

    setShowDbPassword((current) => !current);
  };

  return (
    <section className="space-y-6">
      <AlertDialog
        open={Boolean(pendingDbType)}
        onOpenChange={(open) => {
          if (!open) setPendingDbType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change database type?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing database type can create a new tenant database. Existing
              tenant data may not be available after the switch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current type</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDbTypeChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-4 rounded-[10px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
        <div>
          <h1 className="text-2xl leading-none tracking-tight font-display">
            {formTitle[activeView]}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {formDescription[activeView]}
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
                  disabled={isReadOnly}
                />
                {formik.touched.companyName && formik.errors.companyName && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.companyName}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6 space-y-2">
                <Label>Slug</Label>
                <Input
                  name="slug"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="e.g: vision-worlds..."
                  value={formik.values.slug}
                  error={formik.errors.slug}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6 space-y-2">
                <Label>Subscription Plan</Label>
                <Select
                  name="planId"
                  value={formik.values.planId}
                  onValueChange={(value) =>
                    formik.setFieldValue("planId", value)
                  }
                  disabled={isReadOnly}
                >
                  <SelectTrigger
                    className="w-full"
                    onBlur={() => formik.setFieldTouched("planId", true)}
                  >
                    <SelectValue placeholder="Select a subscription status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {plansOptions?.map((option, idx) => {
                        return (
                          <SelectItem key={idx} value={option.id}>
                            {option.name}
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
              {activeView === "create"
                ? "Enter the correct admin credentials. The first admin is created as owner."
                : canEditAdminSeed
                  ? "Provisioning has not seeded this admin yet. You can fix these details before retry."
                  : "Admin email and password cannot be changed after tenant creation."}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-5 space-y-4">
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
                  disabled={isAdminLocked}
                />
                {formik.touched.adminEmail && formik.errors.adminEmail && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.adminEmail}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6 space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showAdminPassword ? "text" : "password"}
                    name="adminPassword"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder={
                      isEditing && canEditAdminSeed
                        ? "Leave blank to keep saved password"
                        : isEditing
                          ? "Admin password cannot be changed"
                          : "Enter password..."
                    }
                    value={formik.values.adminPassword}
                    error={formik.errors.adminPassword}
                    disabled={isAdminLocked}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                    onClick={() => setShowAdminPassword((current) => !current)}
                  >
                    {showAdminPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
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

        {/* DB Info */}
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2 flex flex-row justify-between">
            <div>
              <CardTitle className="text-md">Database info</CardTitle>
              <CardDescription>
                {activeView === "view"
                  ? "View tenant database configuration."
                  : "Provide database details."}
              </CardDescription>
            </div>

            <div className="flex gap-2 items-center space-y-2">
              <Label className="w-full text-right">DB Type</Label>
              <Select
                name="dbType"
                value={formik.values.dbType}
                onValueChange={handleDbTypeChange}
                disabled={isReadOnly}
              >
                <SelectTrigger
                  className="w-[500px] !m-0"
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
          </CardHeader>
          {formik.values.dbType === "own" && (
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
                    disabled={isReadOnly}
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
                    disabled={isReadOnly}
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
                    disabled={isReadOnly}
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
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6 space-y-2">
                  <Label>DB Password</Label>
                  <div className="relative">
                    <Input
                      type={showDbPassword ? "text" : "password"}
                      name="dbPassword"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      placeholder="Enter db password..."
                      value={formik.values.dbPassword}
                      error={formik.errors.dbPassword}
                      disabled={isReadOnly}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                      disabled={passwordLoadingId === selectedRecord?.id}
                      onClick={handleDbPasswordToggle}
                    >
                      {showDbPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  </div>
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
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              {activeView === "view" && (
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
          )}
        </Card>

        <div className="flex justify-end gap-3">
          <Button onClick={closeForm} type="button" variant="outline">
            Back to Listing
          </Button>
          {activeView !== "view" && (
            <Button type="submit">
              {activeView === "edit" ? "Update Tenant" : "Create Tenant"}
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};
