import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Northstar — AI Spec Generator",
  description:
    "Your north star for product specs. Generate BRD, PRD, SRS, FSD, TSD with AI. From idea to stakeholder-ready document in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
