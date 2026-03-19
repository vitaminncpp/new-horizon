import "./globals.css";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>New Horizon</title>
      </head>
      <body data-theme="dark">{children}</body>
    </html>
  );
}
