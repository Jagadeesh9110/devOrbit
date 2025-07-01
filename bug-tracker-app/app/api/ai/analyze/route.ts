export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import BugModel from "@/models/bugModel";

let featureExtractor: any = null;

function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB || 1);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(accessToken);
    if (!payload?.userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!featureExtractor) {
      const { pipeline } = await import("@xenova/transformers");
      featureExtractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
    }

    const { description } = await request.json();
    const newVector: number[] = Array.from(
      (await featureExtractor(description))[0].data
    );

    const bugs = await BugModel.find({ status: { $ne: "resolved" } }).select(
      "embedding title"
    );
    const duplicates = bugs
      .map((bug) => ({
        id: bug._id.toString(),
        title: bug.title,
        similarity: computeCosineSimilarity(newVector, bug.embedding),
      }))
      .filter((b) => b.similarity > 0.8)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        duplicates,
        severity: "medium",
        priority: "medium",
        assignee: "auto-assign",
        tags: [],
        estimatedTime: "3-5 days",
      },
    });
  } catch (error: any) {
    console.error("AI Analyze POST error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to analyze bug" },
      { status: 500 }
    );
  }
}
