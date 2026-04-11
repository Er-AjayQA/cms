"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronRight,
  Globe2,
  LayoutDashboard,
  LifeBuoy,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { CmsLogo } from "@/components/cms-logo";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const shellConfig = {
  superadmin: {
    label: "Super Admin",
    badge: "Platform",
    workspace: "Citrus Core Console",
    homeHref: "/superadmin",
    nav: [
      { title: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
      { title: "Tenants", href: "/superadmin/tenant", icon: Building2 },
      { title: "Domains", href: "/superadmin", icon: Globe2 },
      {
        title: "Subscription Manager",
        href: "/superadmin/subscription-plans",
        icon: Globe2,
      },
    ],
  },
  admin: {
    label: "Client Admin",
    badge: "Tenant",
    workspace: "Acme Studio Workspace",
    homeHref: "/client-admin",
    nav: [
      { title: "Dashboard", href: "/client-admin", icon: LayoutDashboard },
      { title: "Pages", href: "/client-admin", icon: Building2 },
      { title: "Publishing", href: "/client-admin", icon: Sparkles },
      { title: "Site Preview", href: "/site/acme", icon: Globe2 },
    ],
  },
};

const supportLinks = [
  { title: "Control Hub", href: "/", icon: ShieldCheck },
  { title: "Settings", href: "/", icon: Settings2 },
  { title: "Help Center", href: "/", icon: LifeBuoy },
];

export function AppShell({
  eyebrow,
  title,
  description,
  children,
  accent = "amber",
  role = "admin",
  showHero = true,
}) {
  const pathname = usePathname();
  const config = shellConfig[role] ?? shellConfig.admin;

  return (
    <SidebarProvider
      defaultOpen
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-95",
          accent === "amber" &&
            "bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_35%),linear-gradient(180deg,_#fffdf7,_#f4efe2)]",
          accent === "cyan" &&
            "bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.2),_transparent_30%),linear-gradient(180deg,_#fcfaf4,_#eef5f2)]",
          accent === "rose" &&
            "bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_35%),linear-gradient(180deg,_#fff8f7,_#f8ebe8)]",
        )}
      />

      <Sidebar
        collapsible="icon"
        variant="inset"
        className="border-sidebar-border/70"
      >
        <SidebarHeader className="p-4">
          <Link href={config.homeHref}>
            <div className="rounded-[24px] border border-sidebar-border/70 bg-sidebar/95 p-3 shadow-sm transition hover:bg-sidebar-accent/60">
              <CmsLogo />
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="rounded-[22px] border border-sidebar-border/70 bg-sidebar-accent/45 p-3 text-sm">
                <p className="font-medium text-sidebar-foreground">
                  {config.workspace}
                </p>
                <p className="mt-1 text-xs leading-5 text-sidebar-foreground/70">
                  Built for fast daily operations with brand-safe controls.
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {config.nav.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== config.homeHref &&
                      pathname?.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={`${role}-${item.title}`}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {supportLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4">
          <div className="rounded-[22px] border border-sidebar-border/70 bg-sidebar-accent/40 p-3">
            <div className="flex items-center gap-3">
              <CmsLogo compact />
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">
                  {config.label}
                </p>
                <p className="text-xs text-sidebar-foreground/70">
                  Signed in as Demo User
                </p>
              </div>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="relative h-svh overflow-hidden bg-transparent !shadow-none !rounded-none !border-none">
        <header className="z-20 mb-6 rounded-[10px] border border-border/70 bg-background/85 px-4 py-4 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.5)] backdrop-blur md:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="w-10 h-10 border rounded-full border-border/70 bg-white/70" />
              <div className="hidden md:block">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  {eyebrow}
                </p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>{config.label}</span>
                  <ChevronRight className="size-4" />
                  <span className="text-foreground">{title}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-[340px]">
                <Search className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-10 rounded-full h-11 border-border/70 bg-white/70"
                  placeholder={`Search ${role === "superadmin" ? "tenants, domains, issues" : "pages, campaigns, menus"}`}
                />
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center justify-center transition border rounded-full size-11 border-border/70 bg-white/70 text-foreground hover:bg-white">
                  <Bell className="size-4" />
                </button>
                <Badge className="rounded-full px-4 py-2 text-xs uppercase tracking-[0.28em]">
                  {config.badge}
                </Badge>
              </div>
            </div>
          </div>
        </header>
        <div className="flex h-svh flex-col px-4 md:px-6">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-none">
            <div className="mx-auto w-full max-w-7xl">
              {showHero && (
                <section className="mb-8 rounded-[10px] border border-white/60 bg-white/55 p-6 shadow-[0_28px_90px_-56px_rgba(15,23,42,0.55)] backdrop-blur md:p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl animate-fade-up">
                      <p className="mb-3 text-sm uppercase tracking-[0.4em] text-muted-foreground">
                        {eyebrow}
                      </p>
                      <h1 className="text-4xl leading-none tracking-tight font-display md:text-6xl">
                        {title}
                      </h1>
                      <p className="max-w-2xl mt-4 text-base leading-7 text-muted-foreground md:text-lg">
                        {description}
                      </p>
                    </div>

                    <div className="rounded-[26px] border border-border/60 bg-background/75 p-4">
                      <div className="flex items-center gap-3">
                        <CmsLogo compact />
                        <div>
                          <p className="font-medium">Brand-safe workspace</p>
                          <p className="text-sm text-muted-foreground">
                            Collapsible navigation, focused header, and shared
                            system footer.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <div className="pb-8">{children}</div>

              <footer className="rounded-[10px] border border-border/70 bg-background/75 px-5 py-2 text-sm text-muted-foreground backdrop-blur">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <CmsLogo compact />
                    <p>
                      Purpose-built CMS surfaces for admins and super admins.
                    </p>
                  </div>
                  <p>Copyright (c) 2026 Citrus CMS. All rights reserved.</p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
