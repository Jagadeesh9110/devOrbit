"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogoutModal } from "./LogoutModal";

export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Logout
      </Button>
      <LogoutModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
