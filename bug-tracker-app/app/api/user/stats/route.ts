export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import Bug from "@/models/bugModel";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";

export async function GET(request: NextRequest) {
  await connectDB();
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.userId;

    const assignedBugs = await Bug.countDocuments({
      assigneeId: userId,
      status: { $ne: "Closed" },
    });

    const resolvedBugs = await Bug.countDocuments({ resolvedBy: userId });

    const resolutionTimes = await Bug.find(
      { resolvedBy: userId },
      { createdAt: 1, updatedAt: 1 }
    ).lean();

    let totalResolutionTime = 0;
    for (const bug of resolutionTimes) {
      const createdAtDate = new Date(bug.createdAt);
      const updatedAtDate = new Date(bug.updatedAt);
      const diffTime = updatedAtDate.getTime() - createdAtDate.getTime();
      totalResolutionTime += diffTime;
    }

    const avgResolutionTime =
      resolutionTimes.length > 0
        ? totalResolutionTime / resolutionTimes.length / (1000 * 60 * 60 * 24)
        : 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthResolved = await Bug.countDocuments({
      resolvedBy: userId,
      updatedAt: { $gte: startOfMonth },
    });

    const stats = {
      assignedBugs,
      resolvedBugs,
      avgResolutionTime: `${avgResolutionTime.toFixed(2)} days`,
      thisMonthResolved,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching stats" },
      { status: 500 }
    );
  }
}
