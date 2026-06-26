import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import Footer from "./Footer";

// Společný rám obsahových stránek: hlavička + obsah + patička.
export default function ContentLayout({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className={`mx-auto w-full flex-1 px-4 py-8 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
