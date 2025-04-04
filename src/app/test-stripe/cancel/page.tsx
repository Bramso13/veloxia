"use client";

import { useRouter } from "next/navigation";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <XCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Paiement test annulé
          </h1>
          <p className="mt-2 text-gray-600">
            Votre paiement test a été annulé. Vous pouvez réessayer si vous le
            souhaitez.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push("/test-stripe")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retour au test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
