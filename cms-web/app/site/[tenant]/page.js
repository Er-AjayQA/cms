import Link from "next/link";
import { ArrowRight, BadgeCheck, CirclePlay, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function TenantSitePage({ params }) {
  const tenantName = params.tenant.replace(/-/g, " ");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8f6_0%,_#f7ebe7_42%,_#f2e4db_100%)] text-foreground">
      <section className="container py-8">
        <div className="rounded-full border border-border/70 bg-white/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
          Public website preview for tenant: <span className="font-medium text-foreground">{tenantName}</span>
        </div>
      </section>

      <section className="container grid gap-10 pb-16 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="animate-fade-up">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-muted-foreground">
            Tenant Website
          </p>
          <h1 className="font-display text-5xl leading-none tracking-tight md:text-7xl">
            Design a client website that still feels premium at template speed.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            This route is set up as the public-facing tenant experience. Later, we can fetch by
            domain or slug and hydrate pages, menus, and sections from your tenant database.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg">
              Explore templates
              <ArrowRight className="size-4" />
            </Button>
            <Link href="/client-admin">
              <Button size="lg" variant="outline">
                Open client admin
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: BadgeCheck, label: "Multi-tenant ready" },
              { icon: CirclePlay, label: "Preview-first workflow" },
              { icon: Wand2, label: "Themeable sections" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div className="rounded-[24px] border border-border/60 bg-white/60 p-4 backdrop-blur" key={item.label}>
                  <Icon className="mb-3 size-5 text-primary" />
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="animate-fade-up rounded-[36px] border border-white/70 bg-white/60 p-4 shadow-[0_30px_100px_-50px_rgba(124,45,18,0.55)] backdrop-blur">
          <div className="rounded-[28px] bg-[linear-gradient(135deg,_#1f2937,_#0f172a_45%,_#431407)] p-8 text-white">
            <p className="text-sm uppercase tracking-[0.4em] text-orange-200">Featured Story</p>
            <h2 className="mt-4 font-display text-4xl leading-none">
              Build polished websites for every tenant without duplicating teams.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
              Keep your website layer separated from platform operations while still sharing one
              maintainable frontend system.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/10 p-4">
                <p className="text-3xl font-semibold">12</p>
                <p className="mt-1 text-sm text-white/70">Reusable section patterns</p>
              </div>
              <div className="rounded-[24px] bg-white/10 p-4">
                <p className="text-3xl font-semibold">3</p>
                <p className="mt-1 text-sm text-white/70">Distinct product surfaces</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
