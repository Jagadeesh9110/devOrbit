"use client";

import React from "react";
import BrandingPanel from "@/components/login/BrandingPanel";
import LoginForm from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <BrandingPanel />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
