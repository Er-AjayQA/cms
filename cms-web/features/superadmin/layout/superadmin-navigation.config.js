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
    { title: "Dashboard", href: "/superadmin", icon: LayoutDashboard, code: "dashboard" },
    { title: "Tenants", href: "/superadmin/tenant", icon: Building2, code: "tenants" },
    { title: "Domains", href: "/superadmin/domains", icon: Globe2, code: "domains" },
    {
      title: "Subscription Manager",
      href: "/superadmin/subscription-plans",
      icon: Globe2,
      code: "subscription_plans",
    },
    {
      title: "Access Control",
      href: "/superadmin/access-control",
      icon: ShieldCheck,
      code: "access_control",
    },
  ],
  supportLinks: [
    { title: "Control Hub", href: "/", icon: ShieldCheck },
    { title: "Settings", href: "/", icon: Settings2 },
    { title: "Help Center", href: "/", icon: LifeBuoy },
  ],
};
