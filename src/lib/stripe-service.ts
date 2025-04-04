import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function createPaymentSession(
  bookingId: string,
  amount: number,
  customerEmail: string,
  customerName: string,
  interpreterName: string,
  date: Date,
  duration: number
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Réservation avec ${interpreterName}`,
              description: `Interprétation le ${date.toLocaleDateString("fr-FR")} pendant ${duration} heure(s)`,
            },
            unit_amount: Math.round(amount * 100), // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/reservations/${bookingId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/reservations/${bookingId}?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        bookingId,
        interpreterName,
        date: date.toISOString(),
        duration: duration.toString(),
      },
    });

    if (!session.url) {
      throw new Error("URL de paiement non générée");
    }

    return session;
  } catch (error) {
    console.error(
      "Erreur lors de la création de la session de paiement:",
      error
    );
    throw error;
  }
}
