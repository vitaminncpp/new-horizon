import "./globals.css";
import React from "react";
import { AppProviders } from "@/src/context/app-providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>New Horizon</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swaps"
        />
      </head>
      <body className="dark">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
