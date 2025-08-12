import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/layout/sidebar/index";

export const metadata: Metadata = {
  title: "Trading Dashboard",
  description: "Your modern trading dashboard application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50 dark:bg-slate-900">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}