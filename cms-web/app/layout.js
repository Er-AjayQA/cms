import { SuperadminAuthProvider } from "@/features/superadmin/auth/providers/superadmin-auth-provider";
import "./globals.css";

import { ToastProvider } from "@/components/toast-provider";

export const metadata = {
  title: "CMS Web",
  description: "Frontend shell for the CMS superadmin platform panel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SuperadminAuthProvider>
          {children} <ToastProvider />
        </SuperadminAuthProvider>
      </body>
    </html>
  );
}

