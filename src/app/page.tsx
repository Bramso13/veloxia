"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Combobox, ComboboxItem } from "@/components/ui/combobox";
import { searchCities } from "@/services/cities";

// Type pour les interprètes
type Interpreter = {
  id: string;
  user: {
    name: string | null;
    image: string | null;
  };
  bio: string | null;
  hourlyRate: number;
  rating: number | null;
  reviewCount: number;
  city: string | null;
  languages: string[];
  specializations: string[];
};

export default function Home() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<ComboboxItem[]>([]);
  const [interpreters, setInterpreters] = useState<Interpreter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fonction pour rechercher les villes
  const handleCitySearch = async (query: string) => {
    if (query.length < 2) {
      setCities([]);
      setShowSuggestions(false);
      return;
    }
    const results = await searchCities(query);
    setCities(results);
    setShowSuggestions(true);
  };

  // Fonction pour sélectionner une ville
  const handleCitySelect = async (city: ComboboxItem) => {
    console.log("value", city);
    setCity(city.label);
    await searchInterpreters(city.label);
  };

  // Fonction pour rechercher les interprètes
  const searchInterpreters = async (selectedCity: string) => {
    console.log("selectedCity", selectedCity);
    if (!selectedCity) return;

    setIsLoading(true);
    setShowPopup(true);

    try {
      const response = await fetch(
        `/api/interpreters?city=${encodeURIComponent(selectedCity)}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }
      const data = await response.json();
      setInterpreters(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour naviguer vers la page de détails d'un interprète
  const viewInterpreterDetails = (id: string) => {
    router.push(`/interpretes/${id}`);
  };

  // Fermer le pop-up
  const closePopup = () => {
    setShowPopup(false);
  };

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white">
      {/* Hero section avec barre de recherche */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 to-white" />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Connectez-vous avec des interprètes en langue des signes
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              SignLink facilite la mise en relation entre personnes sourdes et
              interprètes professionnels pour une communication sans barrière.
            </p>

            {/* Barre de recherche d'interprètes par ville */}
            <div className="mt-10">
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <div className="relative flex-grow">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        handleCitySearch(e.target.value);
                      }}
                      placeholder="Entrez une ville (ex: Paris, Lyon, Marseille)"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {showSuggestions && cities.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                        {cities.map((city) => (
                          <div
                            key={city.value}
                            onMouseDown={() => {
                              setCity(city.label);
                              setShowSuggestions(false);
                              setShowPopup(true);
                              searchInterpreters(city.label);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none cursor-pointer"
                          >
                            {city.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => searchInterpreters(city)}
                  disabled={isLoading || !city}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Recherche...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                      Rechercher
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/interpretes"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Voir tous les interprètes
              </Link>
              <Link
                href="/comment-ca-marche"
                className="text-lg font-semibold leading-6 text-gray-900"
              >
                Comment ça marche <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up des résultats de recherche */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Recherche en cours...
                    </div>
                  ) : interpreters.length > 0 ? (
                    <div className="flex items-center">
                      <MapPinIcon className="h-6 w-6 text-blue-600 mr-2" />
                      Interprètes trouvés à {city} ({interpreters.length})
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <MapPinIcon className="h-6 w-6 text-blue-600 mr-2" />
                      Aucun interprète trouvé à {city}
                    </div>
                  )}
                </h2>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {!isLoading && interpreters.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {interpreters.map((interpreter) => (
                    <div
                      key={interpreter.id}
                      className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
                      onClick={() => viewInterpreterDetails(interpreter.id)}
                    >
                      <div className="p-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {interpreter.user.image ? (
                              <Image
                                src={interpreter.user.image}
                                alt={interpreter.user.name || "Interprète"}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {interpreter.user.name?.charAt(0) || "I"}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {interpreter.user.name || "Interprète"}
                            </h3>
                            {interpreter.city && (
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {interpreter.city}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>
                                  {interpreter.rating &&
                                  star <= Math.round(interpreter.rating) ? (
                                    <StarIconSolid className="h-5 w-5 text-yellow-400" />
                                  ) : (
                                    <StarIcon className="h-5 w-5 text-gray-300" />
                                  )}
                                </span>
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              ({interpreter.reviewCount} avis)
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {interpreter.bio || "Aucune description disponible"}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {interpreter.languages
                            .slice(0, 3)
                            .map((language, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {language}
                              </span>
                            ))}
                          {interpreter.languages.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{interpreter.languages.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {interpreter.hourlyRate}€/heure
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              viewInterpreterDetails(interpreter.id);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Voir le profil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && interpreters.length === 0 && (
                <div className="text-center py-8 bg-gray-50 bg-opacity-80 backdrop-blur-sm rounded-lg border border-gray-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <MapPinIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun interprète trouvé à {city}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Essayez avec une autre ville ou consultez tous nos
                    interprètes disponibles.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/interpretes"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Voir tous les interprètes
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Features section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              Communication facilitée
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Une plateforme conçue pour tous
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Notre mission est de rendre la communication accessible à tous, en
              connectant les personnes sourdes avec des interprètes qualifiés.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  Interprètes qualifiés
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Accédez à un réseau d'interprètes professionnels certifiés,
                    spécialisés dans différents domaines.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                    />
                  </svg>
                  Réservation simplifiée
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Réservez un interprète en quelques clics selon vos besoins
                    et disponibilités.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                    />
                  </svg>
                  Paiement sécurisé
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Système de paiement sécurisé avec règlement à l'interprète
                    uniquement après la prestation.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Prêt à faciliter votre communication ?
            <br />
            Inscrivez-vous dès aujourd'hui.
          </h2>
          <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <Link
              href="/register"
              className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-blue-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Créer un compte
            </Link>
            <Link
              href="/interpretes"
              className="text-lg font-semibold leading-6 text-white"
            >
              Voir les interprètes <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-blue-600">
              Témoignages
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ils nous font confiance
            </p>
          </div>
          <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-8">
                <div className="flex gap-x-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-gray-300" />
                  <div>
                    <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">
                      Sophie M.
                    </h3>
                    <p className="text-sm font-semibold leading-6 text-blue-600">
                      Cliente
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "SignLink a changé ma vie. Je peux maintenant participer à des
                  réunions professionnelles avec un interprète qualifié. Le
                  processus de réservation est simple et rapide."
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-8">
                <div className="flex gap-x-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-gray-300" />
                  <div>
                    <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">
                      Thomas L.
                    </h3>
                    <p className="text-sm font-semibold leading-6 text-blue-600">
                      Interprète
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "En tant qu'interprète, SignLink me permet de gérer facilement
                  mon emploi du temps et de trouver de nouveaux clients. La
                  plateforme est intuitive et professionnelle."
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-8">
                <div className="flex gap-x-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-gray-300" />
                  <div>
                    <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">
                      Marie D.
                    </h3>
                    <p className="text-sm font-semibold leading-6 text-blue-600">
                      Cliente
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "J'apprécie particulièrement la qualité des interprètes
                  disponibles sur SignLink. Le système de notation aide à
                  choisir le bon professionnel pour chaque situation."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
