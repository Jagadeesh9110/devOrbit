import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import TestimonialModel from "@/models/testimonialModel";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const testimonials = await TestimonialModel.find()
      .sort({ createdAt: -1 })
      .limit(6);

    return NextResponse.json({ testimonials });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
