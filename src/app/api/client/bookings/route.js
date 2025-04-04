import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function GET(req) {
  try {
    // Vérifier l'authentification
    const token = await getToken({  
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

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

    // Récupérer les réservations du client
    const bookings = await db.booking.findMany({
      where: {
        clientId: token.sub,
      },
      include: {
        interpreter: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
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
      { message: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    );
  }
}
