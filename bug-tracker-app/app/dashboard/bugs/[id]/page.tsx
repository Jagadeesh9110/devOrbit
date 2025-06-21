import React from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import BugDetails from "@/components/BugDetails";
import { PopulatedBug } from "@/types/bug";

interface BugDetailPageProps {
  params: {
    id: string;
  };
}

async function fetchBug(id: string): Promise<PopulatedBug> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    throw new Error("No access token found");
  }

  const res = await fetch(`/api/bugs/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch bug");
  }

  const data = await res.json();
  if (!data.success || !data.data) {
    throw new Error(data.message || "Bug not found");
  }

  return data.data;
}

export default async function BugDetailPage({ params }: BugDetailPageProps) {
  const { id } = params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  try {
    const bug = await fetchBug(id);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <BugDetails bug={bug} />
          </div>
        </main>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

export async function generateMetadata({ params }: BugDetailPageProps) {
  const { id } = params;

  try {
    const bug = await fetchBug(id);
    return {
      title: `${bug.title} - Bug ${id} - Dashboard`,
      description: bug.description || `Details for bug ${id}`,
    };
  } catch (error) {
    return {
      title: `Bug ${id} - Dashboard`,
      description: `Details for bug ${id}`,
    };
  }
}
