"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { format, differenceInMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  CurrencyEuroIcon,
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// Fonction utilitaire pour parser les chaînes JSON
function parseJsonField(field: string | null): string[] {
  if (!field) return [];
  try {
    return JSON.parse(field);
  } catch (error) {
    console.error("Erreur lors du parsing JSON:", error);
    return [];
  }
}

// Type pour une réservation détaillée
type BookingDetails = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  totalAmount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  interpreter: {
    id: string;
    bio: string | null;
    hourlyRate: number;
    languages: string; // Stocké comme JSON
    user: {
      name: string | null;
      image: string | null;
      email: string | null;
    };
  };
};

// Type pour les données traitées
type ProcessedBookingDetails = Omit<BookingDetails, "interpreter"> & {
  interpreter: Omit<BookingDetails["interpreter"], "languages"> & {
    languages: string[];
  };
};

export default function BookingDetailsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté
    if (sessionStatus === "unauthenticated") {
      router.push(`/login?callbackUrl=/client/reservations/${bookingId}`);
      return;
    }

    // Charger les détails de la réservation si l'utilisateur est connecté
    if (sessionStatus === "authenticated") {
      fetchBookingDetails();
    }
  }, [sessionStatus, router, bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/client/bookings/${bookingId}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Réservation non trouvée");
          router.push("/client/reservations");
          return;
        }
        throw new Error(
          "Erreur lors du chargement des détails de la réservation"
        );
      }

      const data = await response.json();
      setBooking(data.booking);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les détails de la réservation");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async () => {
    if (!booking) return;

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
      fetchBookingDetails(); // Recharger les détails de la réservation
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible d'annuler la réservation");
    }
  };

  // Fonction pour calculer la durée en heures et minutes
  const calculateDuration = (start: Date, end: Date) => {
    const minutes = differenceInMinutes(new Date(end), new Date(start));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
    } else if (remainingMinutes === 0) {
      return `${hours} heure${hours > 1 ? "s" : ""}`;
    } else {
      return `${hours} heure${
        hours > 1 ? "s" : ""
      } et ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
    }
  };

  // Fonction pour afficher le statut de la réservation
  const renderStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
            <ClockIcon className="mr-1.5 h-4 w-4" />
            En attente
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            <CheckCircleIcon className="mr-1.5 h-4 w-4" />
            Confirmée
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            <CheckCircleIcon className="mr-1.5 h-4 w-4" />
            Terminée
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            <XCircleIcon className="mr-1.5 h-4 w-4" />
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
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
            <CurrencyEuroIcon className="mr-1.5 h-4 w-4" />
            Non payé
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            <CurrencyEuroIcon className="mr-1.5 h-4 w-4" />
            Payé
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
            <CurrencyEuroIcon className="mr-1.5 h-4 w-4" />
            Remboursé
          </span>
        );
      default:
        return status;
    }
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Chargement des détails de la réservation...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow sm:rounded-lg p-6 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              Réservation non trouvée
            </h1>
            <p className="text-gray-500 mb-4">
              La réservation que vous recherchez n'existe pas ou vous n'avez pas
              les droits pour y accéder.
            </p>
            <Link
              href="/client/reservations"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
              Retour à mes réservations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/client/reservations"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
            Retour à mes réservations
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Détails de la réservation
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Réservation #{booking.id.slice(0, 8)}
              </p>
            </div>
            <div className="flex space-x-2">
              {renderStatus(booking.status)}
              {renderPaymentStatus(booking.paymentStatus)}
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {booking.interpreter.user.image ? (
                      <img
                        src={booking.interpreter.user.image}
                        alt={booking.interpreter.user.name || "Interprète"}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <span className="text-blue-600 font-medium text-lg">
                        {booking.interpreter.user.name
                          ? booking.interpreter.user.name
                              .charAt(0)
                              .toUpperCase()
                          : "I"}
                      </span>
                    )}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-medium text-gray-900">
                      {booking.interpreter.user.name || "Interprète"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {parseJsonField(booking.interpreter.languages).join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 flex items-center text-sm text-gray-900">
                  <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {format(new Date(booking.startTime), "EEEE d MMMM yyyy", {
                    locale: fr,
                  })}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Horaire</dt>
                <dd className="mt-1 flex items-center text-sm text-gray-900">
                  <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {format(new Date(booking.startTime), "HH:mm", { locale: fr })}{" "}
                  - {format(new Date(booking.endTime), "HH:mm", { locale: fr })}
                  <span className="ml-2 text-gray-500">
                    ({calculateDuration(booking.startTime, booking.endTime)})
                  </span>
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Tarif</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p>
                        {booking.interpreter.hourlyRate.toFixed(2)}€ / heure
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Durée:{" "}
                        {calculateDuration(booking.startTime, booking.endTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium">
                        {booking.totalAmount.toFixed(2)}€
                      </p>
                      <p className="text-gray-500 text-xs mt-1">Total TTC</p>
                    </div>
                  </div>
                </dd>
              </div>

              {booking.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <ChatBubbleLeftIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    Notes
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {booking.notes}
                  </dd>
                </div>
              )}

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Informations de réservation
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">
                          Réservation créée le
                        </span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {format(
                          new Date(booking.createdAt),
                          "d MMMM yyyy à HH:mm",
                          { locale: fr }
                        )}
                      </div>
                    </li>
                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">
                          Dernière mise à jour
                        </span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {format(
                          new Date(booking.updatedAt),
                          "d MMMM yyyy à HH:mm",
                          { locale: fr }
                        )}
                      </div>
                    </li>
                  </ul>
                </dd>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex justify-between">
              <Link
                href={`/interpretes/${booking.interpreter.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Voir le profil de l'interprète
              </Link>

              {booking.status === "PENDING" && (
                <button
                  onClick={cancelBooking}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XCircleIcon className="mr-1.5 h-4 w-4" />
                  Annuler la réservation
                </button>
              )}

              {booking.status === "CONFIRMED" &&
                booking.paymentStatus === "UNPAID" && (
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <CurrencyEuroIcon className="mr-1.5 h-4 w-4" />
                    Procéder au paiement
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
