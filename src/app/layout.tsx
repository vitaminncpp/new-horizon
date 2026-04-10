import "./globals.css";
import React from "react";
import { ApiProvider } from "@/src/infra/api/api.context";
import { AuthProvider } from "@/src/infra/auth/auth.context";

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
      <body data-theme="dark">
        <ApiProvider>
          <AuthProvider>{children}</AuthProvider>
        </ApiProvider>
      </body>
    </html>
  );
}
