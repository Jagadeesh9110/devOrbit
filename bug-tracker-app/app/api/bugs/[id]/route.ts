import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import { Bug } from "@/models/bugModel";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const bug = await Bug.findById(params.id)
      .populate("createdBy", "name")
      .populate("assigneeId", "name")
      .populate("projectId", "name")
      .lean();

    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    return NextResponse.json({ bug });
  } catch (error) {
    console.error("Error fetching bug:", error);
    return NextResponse.json({ error: "Failed to fetch bug" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { status, priority, severity, environment, assigneeId, labels } =
      body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (severity) updateData.severity = severity;
    if (environment) updateData.environment = environment;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
    if (labels) updateData.labels = labels;

    const bug = await Bug.findByIdAndUpdate(params.id, updateData, {
      new: true,
    })
      .populate("createdBy", "name")
      .populate("assigneeId", "name")
      .populate("projectId", "name")
      .lean();

    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    return NextResponse.json({ bug });
  } catch (error) {
    console.error("Error updating bug:", error);
    return NextResponse.json(
      { error: "Failed to update bug" },
      { status: 500 }
    );
  }
}
