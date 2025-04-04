import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email-service";
import { randomBytes } from "crypto";

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Vérifier si l'utilisateur existe
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Pour des raisons de sécurité, on renvoie toujours un succès
      return NextResponse.json(
        {
          message:
            "Si votre email existe dans notre base de données, vous recevrez un lien de réinitialisation",
        },
        { status: 200 }
      );
    }

    // Générer un token unique
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token dans la base de données
    await db.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Construire l'URL de réinitialisation
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Envoyer l'email de réinitialisation
    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (emailError) {
      console.error(
        "Erreur lors de l'envoi de l'email de réinitialisation:",
        emailError
      );
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email de réinitialisation" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Si votre email existe dans notre base de données, vous recevrez un lien de réinitialisation",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la demande de réinitialisation" },
      { status: 500 }
    );
  }
}
