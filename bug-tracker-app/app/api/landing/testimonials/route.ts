export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import TestimonialModel from "@/models/testimonialModel";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get testimonials
    const testimonials = await TestimonialModel.find()
      .sort({ createdAt: -1 })
      .limit(6);

    // Get aggregate data for the rating display
    const totalTestimonials = await TestimonialModel.countDocuments();

    // Calculate average rating
    const ratingStats = await TestimonialModel.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const averageRating =
      ratingStats.length > 0 ? ratingStats[0].averageRating : 0;
    const totalCount = ratingStats.length > 0 ? ratingStats[0].totalCount : 0;

    return NextResponse.json({
      testimonials,
      stats: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalCount,
        displayRating: `${
          Math.round(averageRating * 10) / 10
        }/5 from ${totalCount}+ reviews`,
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST route to add new testimonials (for admin or authenticated users)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { quote, author, role, rating } = body;

    // Validate required fields
    if (!quote || !author || !role) {
      return NextResponse.json(
        { error: "Quote, author, and role are required" },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const newTestimonial = new TestimonialModel({
      quote,
      author,
      role,
      rating: rating || 5,
    });

    await newTestimonial.save();

    return NextResponse.json(
      {
        message: "Testimonial created successfully",
        testimonial: newTestimonial,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
