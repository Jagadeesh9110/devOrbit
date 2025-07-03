// models/testimonialModel.ts

import mongoose, { Document, Schema, Model, models } from "mongoose";

export interface ITestimonial extends Document {
  quote: string;
  author: string;
  role: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema: Schema<ITestimonial> = new Schema(
  {
    quote: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

const TestimonialModel: Model<ITestimonial> =
  models.Testimonial ||
  mongoose.model<ITestimonial>("Testimonial", testimonialSchema);

export default TestimonialModel;
