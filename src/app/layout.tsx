import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/layout/sidebar/index";
import { ThemeProvider } from "@/components/shared/providers/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-50">
        <ThemeProvider defaultTheme="light">
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}