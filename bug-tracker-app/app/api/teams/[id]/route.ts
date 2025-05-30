import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import { Team } from "@/models/teamModel";
import User from "@/models/userModel";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    const userId = payload.userId;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const team = await Team.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(params.id) } },
      {
        $lookup: {
          from: "users",
          localField: "members.userId",
          foreignField: "_id",
          as: "memberDetails",
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projects",
          foreignField: "_id",
          as: "projectDetails",
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          members: {
            $map: {
              input: "$members",
              as: "member",
              in: {
                $mergeObjects: [
                  "$$member",
                  {
                    user: {
                      $arrayElemAt: [
                        "$memberDetails",
                        {
                          $indexOfArray: [
                            "$memberDetails._id",
                            "$$member.userId",
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          projects: "$projectDetails",
        },
      },
    ]);

    if (!team || team.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isMember = team[0].members.some(
      (member: any) => member.user._id.toString() === userId
    );

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(team[0]);
  } catch (error: any) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch team" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    const userId = payload.userId;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, members } = body;

    const team = await Team.findById(params.id);

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const userRole = team.members.find(
      (member: any) => member.userId.toString() === userId
    )?.role;

    if (!["Project Manager", "Team Lead", "Admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (name) team.name = name;
    if (description) team.description = description;

    if (members) {
      const users = await User.find({
        _id: { $in: members.map((m: any) => m.userId) },
      });

      if (users.length !== members.length) {
        return NextResponse.json(
          { error: "One or more users not found" },
          { status: 400 }
        );
      }

      team.members = members.map((member: any) => ({
        userId: member.userId,
        role: member.role || "Developer",
        joinedAt: new Date(),
      }));

      await User.updateMany(
        { _id: { $in: members.map((m: any) => m.userId) } },
        { $addToSet: { teamIds: team._id } }
      );
    }

    await team.save();

    return NextResponse.json(team);
  } catch (error: any) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    const userId = payload.userId;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const team = await Team.findById(params.id);

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const userRole = team.members.find(
      (member: any) => member.userId.toString() === userId
    )?.role;

    if (!["Project Manager", "Team Lead", "Admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await User.updateMany(
      { _id: { $in: team.members.map((m: any) => m.userId) } },
      { $pull: { teamIds: team._id } }
    );

    await team.deleteOne();

    return NextResponse.json({ message: "Team deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete team" },
      { status: 500 }
    );
  }
}
