import { NextRequest, NextResponse } from "next/server";
import { settingsController } from "@/controllers/settingsController";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await settingsController.getBilling(accessToken);
  return NextResponse.json(
    { success: result.success, data: result.data, error: result.error },
    { status: result.status }
  );
}

// The billing API (/api/settings/billing) uses mocked data. If you use Stripe or another provider, update settingsController.getBilling:
// it will be developed based on the selection of the billing provider
/**
 * import { NextRequest, NextResponse } from "next/server";
import { settingsController } from "@/controllers/settingsController";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await settingsController.getBilling(accessToken);
  return NextResponse.json(
    { success: result.success, data: result.data, error: result.error },
    { status: result.status }
  );
}
 */
