export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import BugModel from "@/models/bugModel";
import { getFeatureExtractor } from "@/lib/ai/featureExtractor";
import { aiService } from "@/lib/services/AiService";

function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB || 1);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authentication
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { description, component, title } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { success: false, message: "Description is required" },
        { status: 400 }
      );
    }

    // Initialize AI service if not already done
    await aiService.initialize();

    // Create bug data object for analysis
    const bugData = {
      description,
      component,
      title,
      createdBy: payload.userId,
    };

    // Use AiService for analysis with userId
    const analysis = await aiService.analyzeBug(bugData, payload.userId);

    // Additional duplicate detection using embeddings
    try {
      const featureExtractor = await getFeatureExtractor();
      const newVector: number[] = Array.from(
        (await featureExtractor(description))[0].data
      );

      // Find potential duplicates from database
      const bugs = await BugModel.find({
        status: { $ne: "resolved" },
        createdBy: payload.userId,
        embedding: { $exists: true, $ne: [] },
      }).select("embedding title description status priority createdAt");

      const duplicates = bugs
        .map((bug) => ({
          id: bug._id.toString(),
          title: bug.title,
          description: bug.description.substring(0, 200) + "...",
          status: bug.status,
          priority: bug.priority,
          createdAt: bug.createdAt,
          similarity: computeCosineSimilarity(newVector, bug.embedding),
        }))
        .filter((bug) => bug.similarity > 0.75)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      // Merge duplicates with AiService analysis
      analysis.duplicates = duplicates;

      // Recalculate confidence with embedding data
      analysis.confidence = calculateEnhancedConfidence(analysis, duplicates);

      // Add embedding-based reasoning
      if (duplicates.length > 0) {
        analysis.reasoning.push(
          `Found ${duplicates.length} semantic duplicates with ${
            duplicates[0].similarity > 0.9 ? "high" : "medium"
          } similarity confidence`
        );
      }
    } catch (embeddingError) {
      console.warn(
        "Embedding-based duplicate detection failed:",
        embeddingError
      );
      // Continue with AiService analysis only
    }

    // Add metadata
    const enhancedAnalysis = {
      ...analysis,
      metadata: {
        similarBugsCount: analysis.duplicates?.length || 0,
        highestSimilarity:
          analysis.duplicates?.length > 0
            ? analysis.duplicates[0].similarity
            : 0,
        analysisTimestamp: new Date().toISOString(),
        componentAnalyzed: component || "Not specified",
        aiServiceUsed: true,
      },
    };

    return NextResponse.json({
      success: true,
      data: enhancedAnalysis,
    });
  } catch (error: any) {
    console.error("AI Analyze POST error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to analyze bug",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

function calculateEnhancedConfidence(analysis: any, duplicates: any[]): number {
  let confidence = analysis.confidence || 50;

  // Boost confidence based on embedding similarity
  if (duplicates && duplicates.length > 0) {
    confidence += 15;
    if (duplicates[0].similarity > 0.9) {
      confidence += 10;
    }
  }

  // Boost confidence based on tags and severity
  if (analysis.tags && analysis.tags.length > 2) {
    confidence += 5;
  }

  if (analysis.severity !== "medium") {
    confidence += 10;
  }

  return Math.min(confidence, 100);
}
