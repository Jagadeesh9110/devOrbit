"use client";

import React from "react";
import BrandingPanel from "@/components/register/BrandingPanel";
import RegisterForm from "@/components/register/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <BrandingPanel />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
