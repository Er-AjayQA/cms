import "./globals.css";

export const metadata = {
  title: "CMS Web",
  description: "Frontend shell for superadmin, client admin, and client website experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
