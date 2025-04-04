import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schéma de validation pour la mise à jour du profil
const profileUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email invalide"),
});

// GET: Récupérer le profil de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request as any });

    if (!token) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH: Mettre à jour le profil de l'utilisateur
export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request as any });

    if (!token) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: token.sub },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer et valider les données
    const body = await request.json();
    const validationResult = profileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Données invalides",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { message: "Cet email est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: token.sub },
      data: {
        name: data.name,
        email: data.email,
        // Ne pas mettre à jour le mot de passe ici
      },
    });

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
