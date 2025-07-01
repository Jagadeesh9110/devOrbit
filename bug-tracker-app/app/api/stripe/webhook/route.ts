import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { buffer } from "micro";
import User from "@/models/userModel";
import connectDB from "@/lib/db/Connect";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  await connectDB();
  const buf = await buffer(request);
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;
        const user = await User.findById(userId);
        if (user) {
          user.subscriptionId = subscription.id;
          user.subscriptionStatus = subscription.status;
          user.subscriptionPlan = subscription.items.data[0]?.price.id || null;
          user.nextBillingDate = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null;
          await user.save();
          console.log(
            `Updated subscription for user ${userId}: ${subscription.status}`
          );
        }
        break;
      case "invoice.paid":
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceUserId = invoice.customer
          ? (await stripe.customers.retrieve(invoice.customer as string))
              .metadata.userId
          : null;
        if (invoiceUserId) {
          const invoiceUser = await User.findById(invoiceUserId);
          if (invoiceUser) {
            invoiceUser.subscriptionStatus = "active";
            invoiceUser.nextBillingDate = invoice.lines.data[0]?.period.end
              ? new Date(invoice.lines.data[0].period.end * 1000)
              : null;
            await invoiceUser.save();
            console.log(`Processed paid invoice for user ${invoiceUserId}`);
          }
        }
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false },
};
