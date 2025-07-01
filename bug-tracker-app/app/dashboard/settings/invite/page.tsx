"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { fetchWithAuth } from "@/lib/auth";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["Admin", "Project Manager", "Developer", "Tester"]),
});

const InvitePage = () => {
  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "Developer",
    },
  });

  const handleInvite = async (data: z.infer<typeof inviteSchema>) => {
    try {
      const res = await fetchWithAuth("/api/settings/invite", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.success)
        throw new Error(res.error || "Failed to send invitation");
      toast.success("Invitation sent successfully");
      form.reset();
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Toaster position="top-right" />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(handleInvite)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  {...form.register("email")}
                  className={
                    form.formState.errors.email ? "border-red-500" : ""
                  }
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(value) =>
                    form.setValue(
                      "role",
                      value as
                        | "Admin"
                        | "Project Manager"
                        | "Developer"
                        | "Tester"
                    )
                  }
                >
                  <SelectTrigger
                    className={
                      form.formState.errors.role ? "border-red-500" : ""
                    }
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Project Manager">
                      Project Manager
                    </SelectItem>
                    <SelectItem value="Developer">Developer</SelectItem>
                    <SelectItem value="Tester">Tester</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default InvitePage;
