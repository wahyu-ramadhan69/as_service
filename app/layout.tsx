"use client";

import "../app/globals.css";
import { ReactNode } from "react";
import Navbar from "../app/components/navbar";
import { AuthProvider, useAuth } from "../app/lib/authContext";

interface RootLayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: RootLayoutProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <html lang="en">
      <head />
      <body className={isAuthenticated ? "bg-slate-200" : "bg-white"}>
        {isAuthenticated && (
          <div className="flex h-full w-full flex-col gap-3 px-[2%] py-4 transition-all duration-500 ease-in-out md:px-[5%] 1g:px-[10%]">
            <Navbar />
          </div>
        )}
        {children}
      </body>
    </html>
  );
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <AuthProvider>
      <Layout>{children}</Layout>
    </AuthProvider>
  );
}
