import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import Bug from "@/models/bugModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const bugs = await Bug.find(query)
      .populate("createdBy", "name")
      .populate("projectId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bugs });
  } catch (error) {
    console.error("Error fetching bugs:", error);
    return NextResponse.json(
      { error: "Failed to fetch bugs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, description, projectId } = body;

    const userId = "user_id_from_session";

    const bug = await Bug.create({
      title,
      description,
      projectId,
      createdBy: userId,
      status: "Open",
    });

    return NextResponse.json({ bug }, { status: 201 });
  } catch (error) {
    console.error("Error creating bug:", error);
    return NextResponse.json(
      { error: "Failed to create bug" },
      { status: 500 }
    );
  }
}
