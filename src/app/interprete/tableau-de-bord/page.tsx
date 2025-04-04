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
  UserIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  Cog6ToothIcon,
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
  client: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
};

export default function InterpreterDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/interprete/tableau-de-bord");
      return;
    }

    // Vérifier si l'utilisateur est un interprète
    if (status === "authenticated" && session?.user?.role !== "INTERPRETER") {
      toast.error("Accès réservé aux interprètes");
      router.push("/");
      return;
    }

    // Charger les réservations si l'utilisateur est un interprète
    if (status === "authenticated" && session?.user?.role === "INTERPRETER") {
      fetchBookings();
      fetchStats();
    }
  }, [status, session, router]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/interpreter/bookings");

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

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/interpreter/stats");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des statistiques");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger vos statistiques");
    }
  };

  const confirmBooking = async (bookingId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir confirmer cette réservation ?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/interpreter/bookings/${bookingId}/confirm`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la confirmation de la réservation");
      }

      toast.success("Réservation confirmée avec succès");
      fetchBookings(); // Recharger les réservations
      fetchStats(); // Mettre à jour les statistiques
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de confirmer la réservation");
    }
  };

  const rejectBooking = async (bookingId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir rejeter cette réservation ?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/interpreter/bookings/${bookingId}/reject`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du rejet de la réservation");
      }

      toast.success("Réservation rejetée avec succès");
      fetchBookings(); // Recharger les réservations
      fetchStats(); // Mettre à jour les statistiques
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de rejeter la réservation");
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
            Chargement de votre tableau de bord...
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
              Tableau de bord
            </h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/profile"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Cog6ToothIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Gérer mon profil
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Aperçu</h2>
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Carte: Total des réservations */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total des réservations
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {stats.totalBookings}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte: Réservations en attente */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        En attente
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {stats.pendingBookings}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte: Réservations terminées */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Terminées
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {stats.completedBookings}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte: Revenus totaux */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyEuroIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Revenus totaux
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {stats.totalEarnings.toFixed(2)}€
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des réservations */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Réservations récentes
            </h2>
            <Link
              href="/interprete/reservations"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Voir toutes les réservations
            </Link>
          </div>

          <div className="mt-4">
            {bookings && bookings.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {bookings.slice(0, 5).map((booking) => (
                    <li key={booking.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {booking.client.image ? (
                                <img
                                  src={booking.client.image}
                                  alt={booking.client.name || "Client"}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <span className="text-blue-600 font-medium">
                                  {booking.client.name
                                    ? booking.client.name
                                        .charAt(0)
                                        .toUpperCase()
                                    : "C"}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900">
                                {booking.client.name || "Client"}
                              </h3>
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
                                  {format(
                                    new Date(booking.startTime),
                                    "HH:mm",
                                    { locale: fr }
                                  )}{" "}
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
                            href={`/interprete/reservations/${booking.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                          >
                            Voir les détails
                          </Link>
                          {booking.status === "PENDING" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => confirmBooking(booking.id)}
                                className="text-sm font-medium text-green-600 hover:text-green-500"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => rejectBooking(booking.id)}
                                className="text-sm font-medium text-red-600 hover:text-red-500"
                              >
                                Rejeter
                              </button>
                            </div>
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
                <p className="text-sm text-gray-500">
                  Les réservations apparaîtront ici lorsque des clients
                  réserveront vos services.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
