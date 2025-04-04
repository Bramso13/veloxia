"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const updateBooking = async () => {
      try {
        const response = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            "Erreur lors de la confirmation de la réservation: " +
              errorData.error
          );
        }

        toast.success("Réservation confirmée !");
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la confirmation de la réservation");
      }
    };

    if (sessionId) {
      console.log("sessionId", sessionId);
      updateBooking();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Réservation confirmée !
          </h1>
          <p className="mt-2 text-gray-600">
            Votre réservation a été effectuée avec succès.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push("/client/reservations")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Voir mes réservations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
