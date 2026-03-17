import "./globals.css";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>New Horizon</title>
      </head>
      <body>
        <h1>Header</h1>
        {children}
      </body>
    </html>
  );
}
