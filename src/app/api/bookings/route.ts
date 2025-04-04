import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email-service";
import { createPaymentSession } from "@/lib/stripe-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { interpreterId, date, time, duration, location, notes } =
      await req.json();

    // Vérifier si l'interprète existe
    const interpreter = await db.interpreter.findUnique({
      where: { id: interpreterId },
      include: {
        user: true,
      },
    });

    if (!interpreter) {
      return NextResponse.json(
        { error: "Interprète non trouvé" },
        { status: 404 }
      );
    }

    // Calculer le montant total en fonction des honoraires de l'interprète
    const hourlyRate = interpreter.hourlyRate || 0;
    const totalAmount = hourlyRate * duration;

    // Créer la réservation
    const booking = await db.booking.create({
      data: {
        clientId: session.user.id,
        interpreterId,
        startTime: new Date(date),
        endTime: new Date(date),
        totalAmount,
        notes,
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
              description: `Interprétation le ${new Date(date).toLocaleDateString("fr-FR")} pendant ${duration} heure(s)`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/test-stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/test-stripe/cancel`,
      customer_email: session.user.email!,
      metadata: {
        bookingId: booking.id,
        interpreterName: interpreter.user.name || "Interprète",
        date: date,
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

    // Envoyer l'email de confirmation au client
    try {
      await sendEmail({
        to: session.user.email!,
        template: "booking-confirmation",
        userName: session.user.name || "Client",
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}`,
        actionText: "Voir les détails de la réservation",
      });
    } catch (emailError) {
      console.error(
        "Erreur lors de l'envoi de l'email de confirmation:",
        emailError
      );
      // On continue même si l'email échoue
    }

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    let bookings;

    if (role === "INTERPRETER") {
      // Récupérer les réservations de l'interprète
      bookings = await db.booking.findMany({
        where: {
          interpreter: {
            userId: session.user.id,
          },
        },
        include: {
          client: true,
          interpreter: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    } else {
      // Récupérer les réservations du client
      bookings = await db.booking.findMany({
        where: {
          clientId: session.user.id,
        },
        include: {
          client: true,
          interpreter: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    );
  }
}
