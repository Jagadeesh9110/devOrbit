export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import Bug from "@/models/bugModel";

let featureExtractor: any = null;

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!featureExtractor) {
      const { pipeline } = await import("@xenova/transformers");
      featureExtractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
    }

    const body = await request.json();
    const { description } = body;

    const queryEmbedding = await featureExtractor(description);
    const queryVector: number[] = Array.from(
      queryEmbedding[0].data as number[]
    );

    const bugs = await Bug.find({}).select("embedding title description");

    const similarities = bugs.map((bug) => {
      const bugVector: number[] = bug.embedding || [];

      const dotProduct = queryVector.reduce(
        (sum: number, val: number, i: number) =>
          sum + val * (bugVector[i] || 0),
        0
      );
      const magnitudeA = Math.sqrt(
        queryVector.reduce((sum, val) => sum + val * val, 0)
      );
      const magnitudeB =
        Math.sqrt(bugVector.reduce((sum, val) => sum + val * val, 0)) || 1;

      const similarity = dotProduct / (magnitudeA * magnitudeB);

      return {
        id: bug._id,
        title: bug.title,
        description: bug.description,
        similarity,
      };
    });

    const duplicates = similarities
      .filter((s) => s.similarity >= 0.8)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return NextResponse.json({ success: true, data: duplicates });
  } catch (error: any) {
    console.error("Duplicates POST error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to find duplicates" },
      { status: 500 }
    );
  }
}
