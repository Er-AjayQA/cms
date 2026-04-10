"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const roles = [
  {
    id: "admin",
    label: "Admin",
    title: "Tenant Admin Login",
    description: "Pages, content, menus, and publishing control for a single tenant workspace.",
    href: "/client-admin",
    icon: Building2,
  },
  {
    id: "superadmin",
    label: "Superadmin",
    title: "Platform Login",
    description: "Tenant provisioning, platform health, domains, and top-level operations.",
    href: "/superadmin",
    icon: ShieldCheck,
  },
];

const trustPoints = [
  "Single screen access for both roles",
  "Quick handoff to current dashboards",
  "Ready to connect with real API auth later",
];

export default function HomePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("superadmin");

  const activeRole = roles.find((role) => role.id === selectedRole) ?? roles[0];

  const handleSubmit = (event) => {
    event.preventDefault();
    router.push(activeRole.href);
  };

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
              One login screen.
              <span className="block text-primary">Two clear roles.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Admin aur Superadmin dono ke liye ek focused entry point, so team seedha
              apne workspace mein ja sake.
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
                  <p className="text-sm leading-6 text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link className="inline-flex items-center gap-2 font-medium text-primary" href="/superadmin">
                Open superadmin preview
                <ArrowRight className="size-4" />
              </Link>
              <Link className="inline-flex items-center gap-2 font-medium text-primary" href="/client-admin">
                Open admin preview
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <Card className="border-white/70 bg-white/70">
            <CardHeader className="pb-4">
              <CardDescription>Select role</CardDescription>
              <CardTitle>{activeRole.title}</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                {activeRole.description}
              </p>
            </CardHeader>

            <CardContent>
              <div className="mb-6 grid grid-cols-2 gap-3 rounded-[24px] bg-background/80 p-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isActive = role.id === selectedRole;

                  return (
                    <button
                      className={cn(
                        "rounded-[20px] border px-4 py-4 text-left transition-all duration-200",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-[0_18px_40px_-24px_hsl(var(--primary)/0.7)]"
                          : "border-transparent bg-white/70 text-foreground hover:border-border hover:bg-white",
                      )}
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      type="button"
                    >
                      <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-black/10">
                        <Icon className="size-5" />
                      </div>
                      <p className="font-medium">{role.label}</p>
                      <p
                        className={cn(
                          "mt-1 text-sm leading-5",
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {role.id === "admin" ? "Client workspace" : "Platform access"}
                      </p>
                    </button>
                  );
                })}
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Email address</span>
                  <input
                    className="h-12 w-full rounded-2xl border border-border bg-background/80 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder={selectedRole === "admin" ? "admin@tenant.com" : "superadmin@cms.com"}
                    type="email"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Password</span>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className="h-12 w-full rounded-2xl border border-border bg-background/80 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter your password"
                      type="password"
                    />
                  </div>
                </label>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <p className="text-sm text-muted-foreground">
                    Demo flow abhi selected role ke dashboard par redirect karta hai.
                  </p>
                  <Button size="lg" type="submit">
                    Login as {activeRole.label}
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
