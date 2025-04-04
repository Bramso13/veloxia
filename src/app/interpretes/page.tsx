"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";

// Type pour un interprète
type Interpreter = {
  id: string;
  userId: string;
  bio: string | null;
  experience: number | null;
  hourlyRate: number;
  city: string | null;
  languages: string[];
  specializations?: string[];
  rating: number | null;
  reviewCount: number;
  user: {
    name: string | null;
    image: string | null;
  };
};

export default function InterpretersPage() {
  const [interpreters, setInterpreters] = useState<Interpreter[]>([]);
  const [searchCity, setSearchCity] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Charger les interprètes au chargement de la page
  useEffect(() => {
    async function fetchInterpreters() {
      try {
        const res = await fetch("/api/interpreters");
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des interprètes");
        }
        const data = await res.json();
        setInterpreters(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInterpreters();
  }, []);

  // Filtrer les interprètes en fonction de la recherche
  const filteredInterpreters = interpreters.filter(
    (interpreter) =>
      !searchCity ||
      (interpreter.city &&
        interpreter.city.toLowerCase().includes(searchCity.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des interprètes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          Nos interprètes
        </h1>

        {/* Input de recherche simple */}
        <div className="relative mb-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Filtrer par ville..."
            className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>

        {/* Affichage des résultats */}
        {searchCity && (
          <p className="text-sm text-gray-500 mb-4">
            {filteredInterpreters.length === 0
              ? `Aucun interprète trouvé à ${searchCity}`
              : `${filteredInterpreters.length} interprète${
                  filteredInterpreters.length > 1 ? "s" : ""
                } trouvé${
                  filteredInterpreters.length > 1 ? "s" : ""
                } à ${searchCity}`}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInterpreters.length > 0 ? (
            filteredInterpreters.map((interpreter) => (
              <Link
                key={interpreter.id}
                href={`/interpretes/${interpreter.id}`}
                className="group relative block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                      {interpreter.user.image ? (
                        <img
                          src={interpreter.user.image}
                          alt={interpreter.user.name || "Interprète"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600">
                          {interpreter.user.name
                            ? interpreter.user.name.charAt(0).toUpperCase()
                            : "I"}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium text-gray-900">
                        {interpreter.user.name || "Interprète"}
                      </h2>
                      <div className="mt-1 flex items-center">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <StarIcon
                            key={rating}
                            className={`h-5 w-5 ${
                              interpreter.rating &&
                              rating < Math.round(interpreter.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          {interpreter.reviewCount} avis
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Affichage de la ville */}
                  {interpreter.city && (
                    <div className="mt-2 flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {interpreter.city}
                      </span>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {interpreter.languages.map((language, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500 line-clamp-3">
                      {interpreter.bio || "Aucune biographie disponible."}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-lg font-medium text-gray-900">
                      {interpreter.hourlyRate}€ / heure
                    </p>
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      Réserver
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-lg text-gray-500">
                {searchCity
                  ? `Aucun interprète disponible à ${searchCity}.`
                  : "Aucun interprète disponible pour le moment."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
