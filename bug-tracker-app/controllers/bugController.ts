import mongoose from "mongoose";
import Bug, { IBug } from "@/models/bugModel";
import { Project } from "@/models/projectModel";
import User from "@/models/userModel";
import connectDB from "@/lib/db/Connect";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { aiService } from "@/lib/services/AiService";
import { NextRequest, NextResponse } from "next/server";
import { PopulatedBug } from "@/types/bug";

let featureExtractor: any = null;

async function getFeatureExtractor() {
  if (!featureExtractor) {
    const { pipeline } = await import("@xenova/transformers");
    featureExtractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return featureExtractor;
}

interface BugInput {
  title: string;
  description: string;
  severity: "Minor" | "Major" | "Critical";
  priority: "Low" | "Medium" | "High" | "Critical";
  environment: "Development" | "Staging" | "Production";
  assigneeId?: string;
  dueDate?: Date;
  labels?: string[];
  attachments?: { buffer: Buffer; name: string; type: string }[];
}

export const createBug = async (request: NextRequest, userId: string) => {
  await connectDB();

  try {
    const formData = await request.formData();
    const projectId = formData.get("projectId") as string;
    const data: BugInput = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      severity: formData.get("severity") as BugInput["severity"],
      priority: formData.get("priority") as BugInput["priority"],
      environment: formData.get("environment") as BugInput["environment"],
      assigneeId: formData.get("assigneeId") as string,
      dueDate: formData.get("dueDate")
        ? new Date(formData.get("dueDate") as string)
        : undefined,
      labels: formData.get("labels")
        ? JSON.parse(formData.get("labels") as string)
        : [],
      attachments: [],
    };

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    if (data.assigneeId) {
      const assignee = await User.findById(data.assigneeId);
      if (!assignee) {
        return NextResponse.json(
          { success: false, message: "Assignee not found" },
          { status: 404 }
        );
      }
    }

    // Handle attachments
    const files = formData.getAll("attachments") as File[];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await uploadImage(buffer, userId, {
            folder: `${process.env.CLOUDINARY_FOLDER}/bugs/${projectId}`,
            public_id: `bug_${Date.now()}_${file.name}`,
          });
          data.attachments!.push({
            buffer,
            name: result.secure_url,
            type: file.type.startsWith("image") ? "image" : "other",
          });
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
        }
      }
    }

    // Optional AI Tagging/Assignment
    let aiAnalysis = null;
    try {
      aiAnalysis = await aiService.analyzeBug(data);
      if (aiAnalysis) {
        data.labels = [...(data.labels || []), ...aiAnalysis.tags];
        if (
          aiAnalysis.assignee !== "Auto-assign based on workload" &&
          !data.assigneeId
        ) {
          const assignee = await User.findOne({ name: aiAnalysis.assignee });
          if (assignee) data.assigneeId = assignee._id.toString();
        }
      }
    } catch (aiError) {
      console.error("AI analysis failed:", aiError);
    }

    // Generate embedding vector
    let embedding: number[] = [];
    try {
      const extractor = await getFeatureExtractor();
      const output = await extractor(data.description);
      embedding = Array.from(output[0].data as number[]);
    } catch (embedError) {
      console.error("Error generating embedding:", embedError);
    }

    const bug = new Bug({
      ...data,
      createdBy: userId,
      projectId,
      status: "Open",
      attachments: data.attachments?.map((att) => ({
        url: att.name,
        type: att.type,
        uploadedAt: new Date(),
      })),
      embedding,
    });

    await bug.save();
    return NextResponse.json({ success: true, data: bug }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating bug:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create bug" },
      { status: 500 }
    );
  }
};

export const getAllBugs = async (userId: string) => {
  await connectDB();

  try {
    const bugs = await Bug.find({ createdBy: userId })
      .populate("createdBy", "name email")
      .populate("assigneeId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: bugs });
  } catch (error: any) {
    console.error("Error fetching bugs:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch bugs" },
      { status: 500 }
    );
  }
};

export const getBugById = async (bugId: string, userId: string) => {
  await connectDB();

  try {
    const bug = await Bug.findOne({ _id: bugId })
      .populate("createdBy", "name email")
      .populate("assigneeId", "name email")
      .populate("comments.author", "name email");

    if (!bug) {
      return NextResponse.json(
        { success: false, message: "Bug not found" },
        { status: 404 }
      );
    }

    await bug.updateViewer(new mongoose.Types.ObjectId(userId));
    return NextResponse.json({ success: true, data: bug });
  } catch (error: any) {
    console.error("Error fetching bug:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch bug" },
      { status: 500 }
    );
  }
};

export const updateBug = async (
  request: NextRequest,
  bugId: string,
  userId: string
) => {
  await connectDB();

  try {
    const data = await request.json();
    const bug = await Bug.findById(bugId);

    if (!bug) {
      return NextResponse.json(
        { success: false, message: "Bug not found" },
        { status: 404 }
      );
    }

    // Validate assignee if provided
    if (data.assigneeId) {
      const assignee = await User.findById(data.assigneeId);
      if (!assignee) {
        return NextResponse.json(
          { success: false, message: "Assignee not found" },
          { status: 404 }
        );
      }
    }

    // Update fields
    Object.assign(bug, {
      ...data,
      updatedAt: new Date(),
      ...(data.status === "Resolved" && { resolvedBy: userId }),
      ...(data.status === "Closed" && { closedBy: userId }),
    });

    await bug.save();
    return NextResponse.json({ success: true, data: bug });
  } catch (error: any) {
    console.error("Error updating bug:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update bug" },
      { status: 500 }
    );
  }
};

export const deleteBug = async (bugId: string) => {
  await connectDB();

  try {
    const bug = await Bug.findByIdAndDelete(bugId);
    if (!bug) {
      return NextResponse.json(
        { success: false, message: "Bug not found" },
        { status: 404 }
      );
    }

    if (bug.attachments && bug.attachments.length > 0) {
      for (const attachment of bug.attachments) {
        try {
          await deleteImage(attachment.url);
        } catch (deleteError) {
          console.error("Error deleting attachment:", deleteError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Bug deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting bug:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete bug" },
      { status: 500 }
    );
  }
};

export const addComment = async (
  request: NextRequest,
  bugId: string,
  userId: string
) => {
  await connectDB();

  try {
    const { text, mentions, timeSpent } = await request.json();
    const bug = await Bug.findById(bugId);

    if (!bug) {
      return NextResponse.json(
        { success: false, message: "Bug not found" },
        { status: 404 }
      );
    }

    await bug.addComment(
      text,
      new mongoose.Types.ObjectId(userId),
      mentions?.map((id: string) => new mongoose.Types.ObjectId(id)),
      timeSpent
    );

    return NextResponse.json({ success: true, data: bug });
  } catch (error: any) {
    console.error("Error adding comment:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add comment" },
      { status: 500 }
    );
  }
};
