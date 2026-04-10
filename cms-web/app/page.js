import Link from "next/link";
import { ArrowRight, Building2, Globe2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const surfaces = [
  {
    href: "/superadmin",
    icon: ShieldCheck,
    title: "Superadmin Console",
    description: "Tenant provisioning, domain orchestration, billing readiness, and platform-wide health.",
  },
  {
    href: "/client-admin",
    icon: Building2,
    title: "Client Admin Workspace",
    description: "Editorial tools, page operations, growth metrics, and content scheduling for one tenant.",
  },
  {
    href: "/site/acme",
    icon: Globe2,
    title: "Client Website",
    description: "A public-facing tenant website route that can later hydrate from your tenant APIs.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f1e8_0%,_#f4efe7_32%,_#efe6db_100%)] text-foreground">
      <section className="container py-10 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="animate-fade-up">
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-muted-foreground">
              CMS Frontend Starter
            </p>
            <h1 className="font-display text-5xl leading-none tracking-tight md:text-7xl">
              One codebase.
              <span className="block text-primary">Three clear surfaces.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              `cms-web` is set up with Next.js, JavaScript, Tailwind CSS, and shadcn-style UI
              primitives so we can move fast on the actual product screens.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/superadmin">
                <Button size="lg">
                  Open Superadmin
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/client-admin">
                <Button size="lg" variant="outline">
                  Open Client Admin
                </Button>
              </Link>
            </div>
          </div>

          <Card className="border-white/70 bg-white/65">
            <CardHeader>
              <CardDescription>Suggested route split</CardDescription>
              <CardTitle>Ready for real auth boundaries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-2xl bg-background/80 p-4">
                `/superadmin` for platform operators
              </div>
              <div className="rounded-2xl bg-background/80 p-4">
                `/client-admin` for tenant-level admins
              </div>
              <div className="rounded-2xl bg-background/80 p-4">
                `/site/[tenant]` for public websites
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {surfaces.map((surface) => {
            const Icon = surface.icon;

            return (
              <Card key={surface.href} className="group border-white/70 bg-white/60">
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <CardTitle>{surface.title}</CardTitle>
                  <CardDescription>{surface.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link className="inline-flex items-center gap-2 text-sm font-medium text-primary" href={surface.href}>
                    Explore
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
