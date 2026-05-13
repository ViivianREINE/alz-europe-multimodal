import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RIMN — Multimodal Educational AI",
  description:
    "Recursive Iterative Modality Negotiation Network — AI-powered educational assessment by Learning Lynx, RVCE.",
  keywords: ["AI", "education", "multimodal", "assessment", "RIMN", "RVCE"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-inter bg-[#0A0A0F] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
