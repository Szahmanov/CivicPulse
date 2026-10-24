import type { Metadata } from "next";
import "./globals.css";
import SitewideLayout from "@/components/SitewideLayout";

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
        <SitewideLayout snapshotDate="2024-01-15">
          {children}
        </SitewideLayout>
      </body>
    </html>
  );
}
