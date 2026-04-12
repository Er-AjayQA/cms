import {
  Building2,
  Globe2,
  LayoutDashboard,
  LifeBuoy,
  Settings2,
  ShieldCheck,
} from "lucide-react";

export const superadminNavigation = {
  label: "Super Admin",
  badge: "Platform",
  homeHref: "/superadmin",
  mainLinks: [
    { title: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
    { title: "Tenants", href: "/superadmin/tenant", icon: Building2 },
    { title: "Domains", href: "/superadmin/domains", icon: Globe2 },
    {
      title: "Subscription Manager",
      href: "/superadmin/subscription-plans",
      icon: Globe2,
    },
  ],
  supportLinks: [
    { title: "Control Hub", href: "/", icon: ShieldCheck },
    { title: "Settings", href: "/", icon: Settings2 },
    { title: "Help Center", href: "/", icon: LifeBuoy },
  ],
};
