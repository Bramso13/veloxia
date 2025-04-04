import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function PATCH(
  request,
  context
) {
  try {
    // Récupérer l'ID de la réservation de manière sûre
    const bookingId = context.params.id;

    // Vérifier l'authentification
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un interprète
    const user = await db.user.findUnique({
      where: { id: token.sub },
      include: { interpreter: true },
    });

    if (!user || !user.interpreter || token.role !== "INTERPRETER") {
      return NextResponse.json(
        { message: "Seuls les interprètes peuvent rejeter les réservations" },
        { status: 403 }
      );
    }

    // Vérifier que la réservation existe et appartient à l'interprète
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    if (booking.interpreterId !== user.interpreter.id) {
      return NextResponse.json(
        { message: "Cette réservation ne vous appartient pas" },
        { status: 403 }
      );
    }

    // Vérifier que la réservation peut être rejetée
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { message: "Seules les réservations en attente peuvent être rejetées" },
        { status: 400 }
      );
    }

    // Rejeter la réservation
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    // TODO: Envoyer une notification au client

    return NextResponse.json({
      message: "Réservation rejetée avec succès",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Erreur lors du rejet de la réservation:", error);
    return NextResponse.json(
      {
        message: "Une erreur est survenue lors du rejet de la réservation",
      },
      { status: 500 }
    );
  }
}
