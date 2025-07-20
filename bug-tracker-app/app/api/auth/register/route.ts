export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { registerUser } from "../../../../controllers/authController"; // Importing register function

export async function POST(req: Request) {
  try {
    const result = await registerUser(req);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      // Check for specific error messages
      if (error.message === "User already exists") {
        return NextResponse.json(
          {
            success: false,
            message:
              "This email address is already registered. Please use a different email or try logging in.",
          },
          { status: 409 }
        );
      }
      if (error.message === "Invalid role selected") {
        return NextResponse.json(
          {
            success: false,
            message: "Please select a valid role from the provided options.",
          },
          { status: 400 }
        );
      }
      if (error.message === "All fields are required") {
        return NextResponse.json(
          {
            success: false,
            message: "Please fill in all required fields including your role.",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
