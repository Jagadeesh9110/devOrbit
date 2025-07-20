export const dynamic = 'force-dynamic';
// app/api/landing/testimonials/seed/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import TestimonialModel from "@/models/testimonialModel";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check if testimonials already exist
    const existingCount = await TestimonialModel.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json(
        { message: "Testimonials already exist", count: existingCount },
        { status: 200 }
      );
    }

    // Sample testimonials data
    const sampleTestimonials = [
      {
        quote:
          "devOrbit has revolutionized how our team handles bug tracking. The AI-powered insights have reduced our debugging time by 60%.",
        author: "Sarah Chen",
        role: "Lead Developer at TechCorp",
        rating: 5,
      },
      {
        quote:
          "The seamless integration with our existing workflow and the intelligent bug categorization make devOrbit indispensable for our development process.",
        author: "Michael Rodriguez",
        role: "Engineering Manager at StartupXYZ",
        rating: 5,
      },
      {
        quote:
          "Finally, a bug tracker that understands developers. The collaborative features and real-time updates have transformed our team productivity.",
        author: "Emma Thompson",
        role: "Senior Software Engineer at InnovateLabs",
        rating: 5,
      },
      {
        quote:
          "devOrbit's analytics dashboard gives us unprecedented visibility into our development bottlenecks. It's like having a crystal ball for project health.",
        author: "David Kim",
        role: "CTO at CloudVentures",
        rating: 4,
      },
      {
        quote:
          "The automated bug assignment and priority detection have made our sprint planning so much more efficient. Highly recommended!",
        author: "Lisa Wang",
        role: "Product Manager at AgileTeam",
        rating: 5,
      },
      {
        quote:
          "We've tried many bug tracking tools, but devOrbit's AI-powered approach and intuitive interface make it stand out from the crowd.",
        author: "James Wilson",
        role: "DevOps Engineer at ScaleUp",
        rating: 4,
      },
      {
        quote:
          "The real-time collaboration features and smart notifications ensure our team stays on top of critical issues without getting overwhelmed.",
        author: "Anna Martinez",
        role: "Frontend Developer at WebStudio",
        rating: 5,
      },
      {
        quote:
          "devOrbit's integration capabilities are fantastic. It seamlessly connects with our GitHub workflow and provides valuable insights.",
        author: "Robert Taylor",
        role: "Full Stack Developer at CodeCrafters",
        rating: 5,
      },
      {
        quote:
          "The time tracking and workflow automation features have streamlined our development process beyond our expectations.",
        author: "Jennifer Lee",
        role: "Scrum Master at AgileDev",
        rating: 4,
      },
      {
        quote:
          "With devOrbit, we've significantly improved our bug resolution time and team communication. It's a game-changer for development teams.",
        author: "Alex Johnson",
        role: "Software Architect at TechSolutions",
        rating: 5,
      },
    ];

    // Insert sample testimonials
    const insertedTestimonials = await TestimonialModel.insertMany(
      sampleTestimonials
    );

    return NextResponse.json(
      {
        message: "Testimonials seeded successfully",
        count: insertedTestimonials.length,
        testimonials: insertedTestimonials,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error seeding testimonials:", error);
    return NextResponse.json(
      { error: "Failed to seed testimonials" },
      { status: 500 }
    );
  }
}
