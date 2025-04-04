import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { sessionId } = await req.json();
    console.log("sessionId", sessionId);

    if (!sessionId) {
      return NextResponse.json(
        { error: "ID de session manquant" },
        { status: 400 }
      );
    }

    // Récupérer la session Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Le paiement n'a pas été effectué" },
        { status: 400 }
      );
    }
    console.log("stripeSession", stripeSession);

    const bookingId = stripeSession.metadata?.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { error: "ID de réservation manquant" },
        { status: 400 }
      );
    }

    // Mettre à jour le statut de la réservation
    await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la confirmation de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la confirmation de la réservation" },
      { status: 500 }
    );
  }
}
