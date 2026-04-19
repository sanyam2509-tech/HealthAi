import type { Metadata } from "next";

import "@/app/globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "HealthVault AI",
  description: "AI-powered personal health record platform."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <Navbar />
          <main className="container px-4 py-6 sm:px-6 sm:py-8 md:py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
