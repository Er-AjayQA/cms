"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, LogOut, Search } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { useSuperadminAuth } from "@/features/superadmin/auth/providers/superadmin-auth-provider";
import { superadminNavigation } from "./superadmin-navigation.config";

export function SuperadminShell({
  eyebrow,
  title,
  description,
  children,
  accent = "amber",
  showHero = true,
}) {
  const { handleLogout } = useSuperadminAuth();
  const pathname = usePathname();
  const config = superadminNavigation;
  const nav = config.mainLinks;
  const homeHref = config.homeHref;

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
          <Link href={homeHref}>
            <div className="rounded-lg border border-sidebar-border/70 bg-sidebar/95 p-3 shadow-sm transition hover:bg-sidebar-accent/60">
              <CmsLogo />
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== homeHref && pathname?.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.title}>
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
                {config.supportLinks.map((item) => {
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
          <div className="rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                className="w-full hover:bg-red-600"
                onClick={handleLogout}
              >
                Logout
                <LogOut />
              </Button>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="relative h-svh overflow-hidden bg-transparent !shadow-none !rounded-none !border-none">
        <header className="z-20 mb-6 rounded-lg border border-border/70 bg-background/85 px-4 py-4 shadow-sm backdrop-blur md:px-6">
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
                  className="h-10 rounded-md border-border/70 bg-white/70 pl-10"
                  placeholder="Search tenants, domains, issues"
                />
              </div>

              <div className="flex items-center gap-3">
                <button className="flex size-10 items-center justify-center rounded-md border border-border/70 bg-white/70 text-foreground transition hover:bg-white">
                  <Bell className="size-4" />
                </button>
                <Badge className="rounded-md px-3 py-2 text-xs uppercase">
                  {config.badge}
                </Badge>
              </div>
            </div>
          </div>
        </header>
        <div className="flex h-svh flex-col px-4 md:px-6">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-none">
            <div className="mx-auto w-full max-w-7xl">
              <div className="pb-8">{children}</div>

              <footer className="rounded-lg border border-border/70 bg-background/75 px-5 py-2 text-sm text-muted-foreground backdrop-blur">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <CmsLogo compact />
                    <p>Purpose-built CMS surfaces for super admins.</p>
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
