import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
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

    // Vérifier que l'utilisateur est un client
    if (token.role !== "CLIENT") {
      return NextResponse.json(
        { message: "Seuls les clients peuvent annuler leurs réservations" },
        { status: 403 }
      );
    }

    // Vérifier que la réservation existe et appartient au client
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    if (booking.clientId !== token.sub) {
      return NextResponse.json(
        { message: "Cette réservation ne vous appartient pas" },
        { status: 403 }
      );
    }

    // Vérifier que la réservation peut être annulée
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { message: "Seules les réservations en attente peuvent être annulées" },
        { status: 400 }
      );
    }

    // Annuler la réservation
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        // Si le paiement a été effectué, on pourrait gérer le remboursement ici
        // paymentStatus: booking.paymentStatus === "PAID" ? "REFUNDED" : booking.paymentStatus,
      },
    });

    // TODO: Envoyer une notification à l'interprète

    return NextResponse.json({
      message: "Réservation annulée avec succès",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation de la réservation:", error);
    return NextResponse.json(
      {
        message:
          "Une erreur est survenue lors de l'annulation de la réservation",
      },
      { status: 500 }
    );
  }
}
