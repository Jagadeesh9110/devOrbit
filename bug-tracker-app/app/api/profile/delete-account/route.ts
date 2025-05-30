import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db/Connect";
import User from "@/models/userModel";
import { Team } from "@/models/teamModel";
import { Project } from "@/models/projectModel";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    const userId = payload.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Team.updateMany(
        { "members.userId": userId },
        { $pull: { members: { userId } } },
        { session }
      );
      await Project.deleteMany({ owner: userId }, { session });

      const deletedUser = await User.findByIdAndDelete(userId, { session });

      if (!deletedUser) {
        await session.abortTransaction();
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await session.commitTransaction();

      const response = NextResponse.json(
        { message: "Account deleted successfully" },
        { status: 200 }
      );

      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");

      return response;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
