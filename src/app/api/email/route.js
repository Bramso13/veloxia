import { NextResponse } from "next/server";
import { sendWelcomeEmail, sendBookingConfirmationEmail, sendPasswordResetEmail } from "@/lib/email-service";
import { z } from "zod";

const emailSchema = z.object({
  to: z.string().email(),
  template: z.enum(["welcome", "bookingConfirmation", "resetPassword"]),
  userName: z.string(),
  actionUrl: z.string().url().optional(),
  actionText: z.string().optional(),
  interpreterName: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  duration: z.number().optional(),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = emailSchema.parse(body);

    switch (validatedData.template) {
      case "welcome":
        await sendWelcomeEmail(validatedData.to, validatedData.userName);
        break;
      case "bookingConfirmation":
        if (!validatedData.interpreterName || !validatedData.date || !validatedData.time || !validatedData.duration) {
          throw new Error("Données manquantes pour la confirmation de réservation");
        }
        await sendBookingConfirmationEmail(
          validatedData.to,
          validatedData.userName,
          validatedData.interpreterName,
          validatedData.date,
          validatedData.time,
          validatedData.duration
        );
        break;
      case "resetPassword":
        if (!validatedData.actionUrl) {
          throw new Error("URL de réinitialisation manquante");
        }
        await sendPasswordResetEmail(validatedData.to, validatedData.actionUrl);
        break;
      default:
        throw new Error("Template d'email non reconnu");
    }

    return NextResponse.json(
      { message: "Email envoyé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
