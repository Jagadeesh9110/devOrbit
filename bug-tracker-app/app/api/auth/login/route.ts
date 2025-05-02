import { NextResponse } from "next/server";
import { loginUser } from "../../../../controllers/authController";

export async function POST(req: Request) {
  try {
    const result = await loginUser(req);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
