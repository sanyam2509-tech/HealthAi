import { Outlet } from "react-router-dom";

import { Navbar } from "@/components/Navbar";

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container px-4 py-6 sm:px-6 sm:py-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
