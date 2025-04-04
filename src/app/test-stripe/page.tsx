"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function TestStripePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestPayment = async () => {
    try {
      setIsLoading(true);

      // Créer une session de test
      const response = await fetch("/api/test-stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 1000, // 10€ en centimes
          customerEmail: session?.user?.email,
          customerName: session?.user?.name || "Test Client",
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la session de paiement");
      }

      const { url } = await response.json();

      // Rediriger vers la page de paiement Stripe
      window.location.href = url;
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de la création du paiement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Test de paiement Stripe
          </h1>

          <div className="space-y-4">
            <p className="text-gray-600">
              Cette page permet de tester l'intégration de Stripe. Cliquez sur
              le bouton ci-dessous pour créer un paiement test de 10€.
            </p>

            <button
              onClick={handleTestPayment}
              disabled={isLoading || !session}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Chargement..." : "Tester le paiement"}
            </button>

            {!session && (
              <p className="text-red-600">
                Vous devez être connecté pour tester le paiement.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
