import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";
import { z } from "zod";

const emailSchema = z.object({
  to: z.string().email(),
  template: z.enum(["welcome", "booking-confirmation", "password-reset"]),
  userName: z.string(),
  actionUrl: z.string().url().optional(),
  actionText: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = emailSchema.parse(body);

    await sendEmail(validatedData);

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
