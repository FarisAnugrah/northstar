import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10" as any,
});

const schema = z.object({
  workspaceId: z.string().uuid(),
  priceId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { workspaceId, priceId } = parsed.data;

    // Verify user owns workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: user.id
      },
      include: {
        subscription: true
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found or unauthorized" }, { status: 403 });
    }

    let customerId = workspace.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          workspaceId: workspace.id,
        },
      });
      customerId = customer.id;
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/settings/workspace?success=true`,
      cancel_url: `${origin}/settings/workspace?canceled=true`,
      metadata: {
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
