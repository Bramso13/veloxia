import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import { getInterpreter } from "@/lib/interpreter";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un interprète
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { interpreter: true },
    });

    if (user?.interpreter) {
      return NextResponse.json(
        { error: "Les interprètes ne peuvent pas faire de réservations" },
        { status: 403 }
      );
    }

    const { interpreterId, date, time, duration } = await req.json();

    const interpreter = await getInterpreter(interpreterId);

    if (!interpreter) {
      return NextResponse.json(
        { error: "Interprète non trouvé" },
        { status: 404 }
      );
    }

    const amount = Math.round(interpreter.hourlyRate * duration * 100); // Conversion en centimes

    // Créer la réservation
    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000); // Ajoute la durée en heures

    // Vérifier si le créneau est déjà réservé
    const existingBooking = await db.booking.findFirst({
      where: {
        interpreterId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        OR: [
          {
            // Vérifie si une réservation existe qui chevauche le créneau demandé
            AND: [
              { startTime: { lte: endTime } },
              { endTime: { gte: startTime } },
            ],
          },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Ce créneau n'est pas disponible pour cet interprète" },
        { status: 409 }
      );
    }

    const booking = await db.booking.create({
      data: {
        clientId: session.user.id,
        interpreterId,
        startTime,
        endTime,
        totalAmount: amount / 100, // Convertir les centimes en euros
        status: "PENDING",
        paymentStatus: "UNPAID",
      },
    });

    // Créer une session de paiement Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Réservation avec ${interpreter.user.name || "Interprète"}`,
              description: `Interprétation le ${new Date(date).toLocaleDateString("fr-FR")} pendant ${duration}h`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      customer_email: session.user.email || undefined,
      metadata: {
        bookingId: booking.id,
        interpreterId,
        date,
        time,
        duration: duration.toString(),
      },
    });

    // Mettre à jour la réservation avec l'ID de session Stripe
    await db.booking.update({
      where: { id: booking.id },
      data: {
        stripeSessionId: stripeSession.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
