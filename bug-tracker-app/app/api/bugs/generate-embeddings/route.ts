// app/api/bugs/generate-embeddings/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import BugModel from "@/models/bugModel";
import { getFeatureExtractor } from "@/lib/ai/featureExtractor";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authentication check
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get feature extractor
    const featureExtractor = await getFeatureExtractor();

    // Parse request body for optional parameters
    const body = await request.json().catch(() => ({}));
    const {
      userId = payload.userId, // Default to current user
      batchSize = 10, // Process in batches to avoid memory issues
      forceRegenerate = false, // Option to regenerate existing embeddings
    } = body;

    // Build query based on parameters
    const query: any = {};

    // If not force regenerating, only process bugs without embeddings
    if (!forceRegenerate) {
      query.$or = [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
        { embedding: null },
      ];
    }

    // Filter by user if specified (admin feature)
    if (userId && userId !== "all") {
      query.createdBy = userId;
    }

    const bugs = await BugModel.find(query)
      .select("_id title description")
      .limit(batchSize * 10); // Get more than batch size for processing

    if (bugs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No bugs found that need embedding generation",
        processed: 0,
        total: 0,
      });
    }

    console.log(`Found ${bugs.length} bugs to process embeddings`);

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process bugs in batches
    for (let i = 0; i < bugs.length; i += batchSize) {
      const batch = bugs.slice(i, i + batchSize);

      try {
        const batchPromises = batch.map(async (bug) => {
          try {
            // Combine title and description for better embeddings
            const textToEmbed = `${bug.title} ${bug.description}`;
            const embedding = Array.from(
              (await featureExtractor(textToEmbed))[0].data
            );

            // Update the bug with embedding
            await BugModel.updateOne(
              { _id: bug._id },
              {
                $set: {
                  embedding,
                  embeddingUpdatedAt: new Date(),
                },
              }
            );

            processed++;
            return { success: true, bugId: bug._id };
          } catch (error: any) {
            failed++;
            const errorMsg = `Bug ${bug._id}: ${error.message}`;
            errors.push(errorMsg);
            console.error("Error processing bug embedding:", errorMsg);
            return { success: false, bugId: bug._id, error: error.message };
          }
        });

        // Wait for batch to complete
        await Promise.all(batchPromises);

        console.log(
          `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            bugs.length / batchSize
          )}`
        );

        // Small delay between batches to avoid overwhelming the system
        if (i + batchSize < bugs.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error: any) {
        console.error("Batch processing error:", error.message);
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        failed += batch.length;
      }
    }

    const response = {
      success: true,
      message: `Embedding generation completed`,
      processed,
      failed,
      total: bugs.length,
      ...(errors.length > 0 && { errors: errors.slice(0, 5) }), // Limit errors in response
      timestamp: new Date().toISOString(),
    };

    console.log("Embedding generation summary:", response);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Generate embeddings error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to generate embeddings",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check embedding status
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authentication check
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || payload.userId;

    // Build query for user's bugs
    const query: any = {};
    if (userId !== "all") {
      query.createdBy = userId;
    }

    // Count total bugs
    const totalBugs = await BugModel.countDocuments(query);

    // Count bugs with embeddings
    const bugsWithEmbeddings = await BugModel.countDocuments({
      ...query,
      embedding: { $exists: true, $ne: [] },
    });

    // Count bugs without embeddings
    const bugsWithoutEmbeddings = await BugModel.countDocuments({
      ...query,
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
        { embedding: null },
      ],
    });

    // Get recent embedding updates
    const recentEmbeddings = await BugModel.find({
      ...query,
      embeddingUpdatedAt: { $exists: true },
    })
      .select("_id title embeddingUpdatedAt")
      .sort({ embeddingUpdatedAt: -1 })
      .limit(5);

    const completionPercentage =
      totalBugs > 0 ? Math.round((bugsWithEmbeddings / totalBugs) * 100) : 0;

    const status = {
      totalBugs,
      bugsWithEmbeddings,
      bugsWithoutEmbeddings,
      completionPercentage,
      recentEmbeddings: recentEmbeddings.map((bug) => ({
        id: bug._id,
        title: bug.title,
        updatedAt: bug.embeddingUpdatedAt,
      })),
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error("Get embedding status error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get embedding status",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
