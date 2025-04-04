import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    // Vérifier l'authentification
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un interprète
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      include: { interpreter: true },
    });

    if (!user || !user.interpreter) {
      return NextResponse.json(
        {
          error:
            "Accès refusé. Seuls les interprètes peuvent voir leurs réservations.",
        },
        { status: 403 }
      );
    }

    // Récupérer les réservations de l'interprète avec les informations du client
    const bookings = await prisma.booking.findMany({
      where: {
        interpreterId: user.interpreter.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    );
  }
}
