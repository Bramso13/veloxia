import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

// Définir un type local pour les réservations
type BookingStats = {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
};

export async function GET(req: Request) {
  try {
    // Vérifier l'authentification
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un interprète
    if (token.role !== "INTERPRETER" || !token.interpreterId) {
      return NextResponse.json(
        {
          error:
            "Accès refusé. Seuls les interprètes peuvent voir leurs statistiques.",
        },
        { status: 403 }
      );
    }

    // Récupérer toutes les réservations de l'interprète
    const bookings = (await db.booking.findMany({
      where: {
        interpreterId: token.interpreterId as string,
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
      },
    })) as BookingStats[];

    // Calculer les statistiques
    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
      (booking: BookingStats) => booking.status === "PENDING"
    ).length;

    const completedBookings = bookings.filter(
      (booking: BookingStats) => booking.status === "COMPLETED"
    ).length;

    const totalEarnings = bookings
      .filter(
        (booking: BookingStats) =>
          booking.status === "COMPLETED" && booking.paymentStatus === "PAID"
      )
      .reduce(
        (sum: number, booking: BookingStats) => sum + booking.totalAmount,
        0
      );

    return NextResponse.json({
      totalBookings,
      pendingBookings,
      completedBookings,
      totalEarnings,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
