import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { Plan } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;

        if (!workspaceId) {
          throw new Error("Missing workspaceId in metadata");
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        await prisma.subscription.upsert({
          where: { workspaceId },
          create: {
            workspaceId,
            stripeCustomerId: session.customer as string,
            stripeSubId: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            // Default to PRO for now, can map specific price IDs later
            plan: Plan.PRO,
          },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubId: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            plan: Plan.PRO,
          },
        });
        
        await prisma.workspace.update({
          where: { id: workspaceId },
          data: { plan: Plan.PRO }
        });

        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.subscription.updateMany({
          where: { stripeSubId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubId: subscription.id }
        });
        
        if (sub) {
          await prisma.subscription.update({
            where: { stripeSubId: subscription.id },
            data: {
              status: subscription.status,
              plan: Plan.FREE
            },
          });
          
          await prisma.workspace.update({
            where: { id: sub.workspaceId },
            data: { plan: Plan.FREE }
          });
        }
        
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
