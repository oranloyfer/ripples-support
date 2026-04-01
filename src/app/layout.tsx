import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RIPPLES Audio — Support",
  description: "Get help with RIPPLES Audio plugins",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0D0F14] text-white antialiased">{children}</body>
    </html>
  );
}
