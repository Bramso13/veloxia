"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

// Type pour une réservation
type Booking = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  totalAmount: number;
  notes: string | null;
  interpreter: {
    id: string;
    user: {
      name: string | null;
      image: string | null;
    };
  };
};

export default function ClientReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/client/reservations");
      return;
    }

    // Charger les réservations si l'utilisateur est connecté
    if (status === "authenticated") {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/client/bookings");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des réservations");
      }

      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger vos réservations");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/client/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'annulation de la réservation");
      }

      toast.success("Réservation annulée avec succès");
      fetchBookings(); // Recharger les réservations
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible d'annuler la réservation");
    }
  };

  // Fonction pour afficher le statut de la réservation
  const renderStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            <ClockIcon className="mr-1 h-3 w-3" />
            En attente
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <CheckCircleIcon className="mr-1 h-3 w-3" />
            Confirmée
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <CheckCircleIcon className="mr-1 h-3 w-3" />
            Terminée
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            <XCircleIcon className="mr-1 h-3 w-3" />
            Annulée
          </span>
        );
      default:
        return status;
    }
  };

  // Fonction pour afficher le statut du paiement
  const renderPaymentStatus = (status: string) => {
    switch (status) {
      case "UNPAID":
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            Non payé
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Payé
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
            Remboursé
          </span>
        );
      default:
        return status;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Chargement de vos réservations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Mes réservations
            </h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/interpretes"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Réserver un interprète
            </Link>
          </div>
        </div>

        <div className="mt-8">
          {bookings.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {booking.interpreter.user.image ? (
                              <img
                                src={booking.interpreter.user.image}
                                alt={
                                  booking.interpreter.user.name || "Interprète"
                                }
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <span className="text-blue-600 font-medium">
                                {booking.interpreter.user.name
                                  ? booking.interpreter.user.name
                                      .charAt(0)
                                      .toUpperCase()
                                  : "I"}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <h2 className="text-lg font-medium text-gray-900">
                              {booking.interpreter.user.name || "Interprète"}
                            </h2>
                            <div className="flex items-center mt-1">
                              <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                {format(
                                  new Date(booking.startTime),
                                  "EEEE d MMMM yyyy",
                                  { locale: fr }
                                )}
                              </p>
                            </div>
                            <div className="flex items-center mt-1">
                              <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                {format(new Date(booking.startTime), "HH:mm", {
                                  locale: fr,
                                })}{" "}
                                -{" "}
                                {format(new Date(booking.endTime), "HH:mm", {
                                  locale: fr,
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-lg font-medium text-gray-900">
                            {booking.totalAmount.toFixed(2)}€
                          </p>
                          <div className="mt-2 flex space-x-2">
                            {renderStatus(booking.status)}
                            {renderPaymentStatus(booking.paymentStatus)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <Link
                          href={`/client/reservations/${booking.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Voir les détails
                        </Link>
                        {booking.status === "PENDING" && (
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
              <p className="text-gray-500 mb-4">
                Vous n'avez pas encore de réservations.
              </p>
              <Link
                href="/interpretes"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Réserver un interprète
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
