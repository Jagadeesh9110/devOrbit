export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import BugModel from "@/models/bugModel";

let featureExtractor: any = null;

function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce(
    (sum: number, val: number, i: number) => sum + val * vecB[i],
    0
  );
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

    const { query } = await request.json();
    const queryVector: number[] = Array.from(
      (await featureExtractor(query))[0].data
    );

    const bugs = await BugModel.find({ createdBy: payload.userId }).select(
      "embedding title description"
    );
    const results = bugs
      .map((bug) => ({
        ...bug.toObject(),
        similarity: computeCosineSimilarity(queryVector, bug.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error("AI Search POST error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to perform search" },
      { status: 500 }
    );
  }
}
