import React from "react";
import { notFound } from "next/navigation";
import BugDetails from "@/components/BugDetails";

interface BugDetailPageProps {
  params: {
    id: string;
  };
}

export default async function BugDetailPage({ params }: BugDetailPageProps) {
  const { id } = params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <BugDetails bugId={id} />
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: BugDetailPageProps) {
  const { id } = params;

  return {
    title: `Bug ${id} - Dashboard`,
    description: `Details for bug ${id}`,
  };
}

// Optional: Generate static params for static generation (if you have a finite set of bug IDs)
// export async function generateStaticParams() {
//   // In a real app, you might fetch all bug IDs from your API
//   // const bugs = await fetchAllBugIds();
//   // return bugs.map((bug) => ({
//   //   id: bug.id,
//   // }));
//   return [];
// }
