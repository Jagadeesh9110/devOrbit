export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import BugModel from "@/models/bugModel";
import { getFeatureExtractor } from "@/lib/ai/featureExtractor";
import { aiService } from "@/lib/services/AiService";

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
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, message: "Query is required" },
        { status: 400 }
      );
    }

    await aiService.initialize();

    // Use AiService for smart search with userId
    const searchResult = await aiService.searchWithAI(query, payload.userId);

    // If AiService search fails or returns no results, fall back to embedding search
    if (!searchResult.results || searchResult.results.length === 0) {
      console.log("Falling back to direct embedding search");

      try {
        const featureExtractor = await getFeatureExtractor();
        const queryVector: number[] = Array.from(
          (await featureExtractor(query))[0].data
        );

        // Search in user's bugs with enhanced filtering
        const bugs = await BugModel.find({
          createdBy: payload.userId,
          embedding: { $exists: true, $ne: [] },
        }).select("embedding title description status priority createdAt tags");

        // Calculate similarity and enhance results
        const results = bugs
          .map((bug) => {
            const similarity = computeCosineSimilarity(
              queryVector,
              bug.embedding
            );

            return {
              _id: bug._id,
              title: bug.title,
              description: bug.description,
              status: bug.status,
              priority: bug.priority,
              createdAt: bug.createdAt,
              tags: bug.tags,
              similarity: similarity,
              relevanceScore: similarity * 100,
              isHighPriority: bug.priority === "Critical",
              isRecent:
                new Date(bug.createdAt) >
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            };
          })
          .filter((result) => result.similarity > 0.3)
          .sort((a, b) => {
            if (Math.abs(a.similarity - b.similarity) < 0.1) {
              if (a.isHighPriority !== b.isHighPriority) {
                return a.isHighPriority ? -1 : 1;
              }
              return b.isRecent ? 1 : -1;
            }
            return b.similarity - a.similarity;
          })
          .slice(0, 10);

        // Update search result with fallback data
        searchResult.results = results;
        searchResult.confidence =
          results.length > 0
            ? Math.round(
                (results.reduce((sum, r) => sum + r.similarity, 0) /
                  results.length) *
                  100
              )
            : 0;
      } catch (embeddingError) {
        console.error("Embedding search fallback failed:", embeddingError);
        // Return AiService result even if empty
      }
    }

    // Enhance search results with additional metadata
    const enhancedResults = searchResult.results.map((result: any) => ({
      ...result,
      // Add AI-powered enhancements
      aiRelevanceScore: result.similarity
        ? result.similarity * 100
        : result.relevanceScore || 0,
      searchContext: {
        matchedQuery: query,
        searchTimestamp: new Date().toISOString(),
        confidenceLevel: searchResult.confidence,
      },
    }));

    // Generate enhanced metadata
    const metadata = {
      totalResults: enhancedResults.length,
      avgSimilarity: searchResult.confidence / 100,
      hasHighPriorityResults: enhancedResults.some(
        (r: any) => r.isHighPriority
      ),
      searchSuggestions: searchResult.suggestions,
      processingTime: searchResult.processingTime,
      aiServiceUsed: true,
      searchQuality:
        searchResult.confidence > 70
          ? "High"
          : searchResult.confidence > 40
          ? "Medium"
          : "Low",
    };

    return NextResponse.json({
      success: true,
      data: enhancedResults,
      metadata,
      searchInsights: {
        query: searchResult.query,
        confidence: searchResult.confidence,
        suggestions: searchResult.suggestions,
        processingTime: searchResult.processingTime,
      },
    });
  } catch (error: any) {
    console.error("AI Search POST error:", error.message, error.stack);

    // Fallback error response
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to perform search",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
        fallbackSuggestions: [
          "Try a simpler search term",
          "Search for 'critical bugs'",
          "Search for 'recent issues'",
          "Search by component name",
        ],
      },
      { status: 500 }
    );
  }
}
