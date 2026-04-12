"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSuperadminAuth } from "@/features/superadmin/auth/providers/superadmin-auth-provider";

export function SuperadminLoginScreen() {
  const { formik, activeRole, roles, trustPoints } = useSuperadminAuth();
  const [showPassword, setShowPassword] = useState(false);
  const superadminRole = roles.find((role) => role.id === "superadmin");
  const displayRole = superadminRole || activeRole;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_30%),linear-gradient(180deg,_#fbf5ec_0%,_#f4ede2_40%,_#ecdfd0_100%)] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.03)_0%,transparent_35%,rgba(14,165,233,0.06)_100%)]" />

      <section className="container relative py-10 md:py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-fade-up">
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-muted-foreground">
              CMS Superadmin Portal
            </p>
            <h1 className="max-w-3xl font-display text-5xl leading-none tracking-tight md:text-7xl">
              Platform login.
              <span className="block text-primary">Control center.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Abhi project superadmin-first phase mein hai. Yahan se tenants,
              domains, subscriptions, and provisioning manage hoga; tenant/site
              builder later phase mein add karenge.
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
                Open superadmin panel
                <ArrowRight className="size-4" />
              </Link>
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
              <form className="space-y-4" onSubmit={formik.handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Email address
                  </span>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-11"
                      error={formik.errors.email}
                      name="email"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      placeholder="Enter email..."
                      type="email"
                      value={formik.values.email}
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="ms-2 mt-1 text-xs text-red-600">
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
                      className="pl-11 pr-11"
                      error={formik.errors.password}
                      name="password"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      placeholder="Enter password..."
                      type={showPassword ? "text" : "password"}
                      value={formik.values.password}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-foreground"
                      onClick={() => setShowPassword((value) => !value)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="ms-2 mt-1 text-xs text-red-600">
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
