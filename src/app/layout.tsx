import type { Metadata } from "next";
import "./globals.css";
import SitewideLayout from "@/components/SitewideLayout";
import { DATA_SNAPSHOT_DATE } from "@/data/loaders";

export const metadata: Metadata = {
  title: "CivicPulse",
  description: "Explainable civic dashboard for Boston 311 service request patterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <SitewideLayout snapshotDate={DATA_SNAPSHOT_DATE}>
          {children}
        </SitewideLayout>
      </body>
    </html>
  );
}
