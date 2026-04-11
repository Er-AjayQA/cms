import { AuthProvider } from "../context/authContext";
import "./globals.css";

import { ToastProvider } from "@/components/toast-provider";

export const metadata = {
  title: "CMS Web",
  description:
    "Frontend shell for superadmin, client admin, and client website experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children} <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
