import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import { Team } from "@/models/teamModel";
import User from "@/models/userModel";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    const userId = payload.userId;

    const teams = await Team.aggregate([
      { $match: { "members.userId": new mongoose.Types.ObjectId(userId) } },
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

    return NextResponse.json(teams);
  } catch (error: any) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    const userId = payload.userId;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    const newTeam = new Team({
      name,
      description,
      members: [
        {
          userId,
          role: "Project Manager",
          joinedAt: new Date(),
        },
      ],
      projects: [],
    });

    await newTeam.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { teamIds: newTeam._id },
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error: any) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create team" },
      { status: 500 }
    );
  }
}
