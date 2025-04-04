import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 12);

    // Créer l'utilisateur
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Envoyer l'email de bienvenue
    try {
      await sendEmail({
        to: email,
        template: "welcome",
        userName: name,
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
        actionText: "Compléter mon profil",
      });
    } catch (emailError) {
      console.error(
        "Erreur lors de l'envoi de l'email de bienvenue:",
        emailError
      );
      // On continue même si l'email échoue
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
