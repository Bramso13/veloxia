import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Récupérer l'ID de la réservation de manière sûre
    const params = await context.params;
    const bookingId = params.id;

    // Vérifier l'authentification directement avec getToken
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log(
      "Token dans la route client/bookings/[id]:",
      token ? "Token présent" : "Pas de token"
    );

    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un client
    if (token.role !== "CLIENT") {
      return NextResponse.json(
        {
          message:
            "Accès refusé. Seuls les clients peuvent voir leurs réservations.",
        },
        { status: 403 }
      );
    }

    // Récupérer la réservation avec les détails
    const booking = await db.booking.findUnique({
      where: {
        id: bookingId,
        clientId: token.sub, // Utiliser l'ID de l'utilisateur
      },
      include: {
        interpreter: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails de la réservation:",
      error
    );
    return NextResponse.json(
      {
        message: "Erreur lors de la récupération des détails de la réservation",
      },
      { status: 500 }
    );
  }
}
