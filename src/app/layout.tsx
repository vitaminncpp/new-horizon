import "./globals.css";
import React from "react";
import { Inter } from "next/font/google";
import { AppProviders } from "@/src/context/app-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <title>New Horizon</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="dark">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
