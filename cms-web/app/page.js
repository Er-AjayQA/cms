"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "./context/authContext";
import { Input } from "@/components/ui/input";

export default function HomePage({ tenantSlug = "", tenantLogin = false }) {
  const { formik, activeRole, setActiveRole, roles, trustPoints } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const isTenantLogin = tenantLogin || Boolean(tenantSlug);
  const tenantAdminRole = roles.find((role) => role.id === "admin");
  const platformRole = roles.find((role) => role.id === "superadmin");
  const displayRole = isTenantLogin
    ? tenantAdminRole || activeRole
    : platformRole || activeRole;
  const visibleRoles = isTenantLogin
    ? roles.filter((role) => role.id === "admin")
    : roles.filter((role) => role.id === "superadmin");

  useEffect(() => {
    if (isTenantLogin && tenantAdminRole) {
      formik.setFieldValue("selected_role", "admin", false);
      setActiveRole(tenantAdminRole);
      return;
    }

    if (!isTenantLogin && platformRole) {
      formik.setFieldValue("selected_role", "superadmin", false);
      setActiveRole(platformRole);
    }
  }, [isTenantLogin, tenantSlug]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_30%),linear-gradient(180deg,_#fbf5ec_0%,_#f4ede2_40%,_#ecdfd0_100%)] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.03)_0%,transparent_35%,rgba(14,165,233,0.06)_100%)]" />

      <section className="container relative py-10 md:py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-fade-up">
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-muted-foreground">
              CMS Access Portal
            </p>
            <h1 className="max-w-3xl font-display text-5xl leading-none tracking-tight md:text-7xl">
              {isTenantLogin ? "Tenant login." : "Platform login."}
              <span className="block text-primary">
                {isTenantLogin ? "Your workspace." : "Control center."}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {isTenantLogin
                ? `${tenantSlug || "Tenant"} workspace ke liye secure admin access. Tenant context URL/domain se automatically resolve hoga.`
                : "Superadmin ke liye platform control panel. Tenant admins apne slug wale login URL se access karenge."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {trustPoints.map((point) => (
                <div
                  className="rounded-[24px] border border-white/60 bg-white/55 p-4 backdrop-blur"
                  key={point}
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {point}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link
                className="inline-flex items-center gap-2 font-medium text-primary"
                href="/superadmin"
              >
                Open superadmin preview
                <ArrowRight className="size-4" />
              </Link>
              {!isTenantLogin && (
                <span className="text-muted-foreground">
                  Tenant login URL: /tenant/your-slug/login
                </span>
              )}
            </div>
          </div>

          <Card className="border-white/70 bg-white/70">
            <CardHeader className="pb-4">
              <CardTitle>{displayRole.title}</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                {displayRole.description}
              </p>
            </CardHeader>

            <CardContent>
              <div
                className={cn(
                  "mb-6 grid gap-3 rounded-[24px] bg-background/80 p-2",
                  isTenantLogin ? "grid-cols-1" : "grid-cols-2",
                )}
              >
                {visibleRoles.map((role) => {
                  const Icon = role.icon;
                  const isActive = role.id === displayRole.id;

                  return (
                    <button
                      className={cn(
                        "rounded-[20px] border px-4 py-4 text-left transition-all duration-200",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-[0_18px_40px_-24px_hsl(var(--primary)/0.7)]"
                          : "border-transparent bg-white/70 text-foreground hover:border-border hover:bg-white",
                      )}
                      key={role.id}
                      onClick={() => {
                        formik.setFieldValue("selected_role", role.id);
                        setActiveRole(role);
                      }}
                      type="button"
                    >
                      <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-black/10">
                        <Icon className="size-5" />
                      </div>
                      <p className="font-medium">{role.label}</p>
                      <p
                        className={cn(
                          "mt-1 text-sm leading-5",
                          isActive
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {role.id === "admin"
                          ? "Client workspace"
                          : "Platform access"}
                      </p>
                    </button>
                  );
                })}
              </div>

              <form className="space-y-4" onSubmit={formik.handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Email address
                  </span>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      name="email"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      placeholder="Enter email..."
                      value={formik.values.email}
                      error={formik.errors.email}
                      className="pl-11"
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-xs text-red-600 ms-2">
                      {formik.errors.email}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Password
                  </span>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      placeholder="Enter password..."
                      value={formik.values.password}
                      error={formik.errors.password}
                      className="pl-11 pr-11"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-foreground"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="mt-1 text-xs text-red-600 ms-2">
                      {formik.errors.password}
                    </p>
                  )}
                </label>

                <div className="flex items-center justify-end gap-4 pt-2">
                  <Button size="lg" type="submit">
                    Login as {displayRole.label}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
