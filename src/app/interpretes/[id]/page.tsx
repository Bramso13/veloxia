import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { StarIcon } from "@heroicons/react/20/solid";
import {
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import BookingForm from "./booking-form";
import React from "react";

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

// Type pour un interprète avec ses détails
type InterpreterWithDetails = {
  id: string;
  userId: string;
  bio: string | null;
  experience: number | null;
  certifications: string | null;
  hourlyRate: number;
  availability: any;
  languages: string;
  specializations: string;
  rating: number | null;
  reviewCount: number;
  user: {
    name: string | null;
    image: string | null;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    client: {
      user: {
        name: string | null;
        image: string | null;
      };
    };
  }>;
};

// Type pour l'interprète avec les champs parsés
type ParsedInterpreter = Omit<
  InterpreterWithDetails,
  "languages" | "specializations"
> & {
  languages: string[];
  specializations: string[];
};

interface PageProps {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}

// Fonction pour récupérer les détails d'un interprète
async function getInterpreter(id: string): Promise<ParsedInterpreter | null> {
  const interpreter = await db.interpreter.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      reviews: {
        include: {
          client: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!interpreter) return null;

  // Convertir les champs JSON en tableaux
  return {
    ...interpreter,
    languages: parseJsonField(interpreter.languages),
    specializations: parseJsonField(interpreter.specializations),
  } as ParsedInterpreter;
}

export default async function InterpreterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const interpreter = await getInterpreter((await params).id);

  if (!interpreter) {
    notFound();
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Informations sur l'interprète */}
          <div className="lg:col-span-2">
            <div className="flex items-center">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200">
                {interpreter.user.image ? (
                  <img
                    src={interpreter.user.image}
                    alt={interpreter.user.name || "Interprète"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600 text-2xl font-bold">
                    {interpreter.user.name
                      ? interpreter.user.name.charAt(0).toUpperCase()
                      : "I"}
                  </div>
                )}
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  {interpreter.user.name || "Interprète"}
                </h1>
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

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">À propos</h2>
              <p className="mt-4 text-gray-600">
                {interpreter.bio || "Aucune biographie disponible."}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="ml-2 text-lg font-medium text-gray-900">
                    Expérience
                  </h3>
                </div>
                <p className="mt-2 text-gray-600">
                  {interpreter.experience
                    ? `${interpreter.experience} ans d'expérience`
                    : "Expérience non spécifiée"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center">
                  <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="ml-2 text-lg font-medium text-gray-900">
                    Certifications
                  </h3>
                </div>
                <p className="mt-2 text-gray-600">
                  {interpreter.certifications ||
                    "Aucune certification spécifiée"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center">
                  <LanguageIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="ml-2 text-lg font-medium text-gray-900">
                    Langues des signes
                  </h3>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
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

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="ml-2 text-lg font-medium text-gray-900">
                    Spécialisations
                  </h3>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {interpreter.specializations.map((specialization, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                    >
                      {specialization}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Avis */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-900">
                Avis des clients ({interpreter.reviews.length})
              </h2>

              {interpreter.reviews.length > 0 ? (
                <div className="mt-6 space-y-6">
                  {interpreter.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-gray-200 bg-white p-6"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                          {review.client.user.image ? (
                            <img
                              src={review.client.user.image}
                              alt={review.client.user.name || "Client"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600">
                              {review.client.user.name
                                ? review.client.user.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "C"}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            {review.client.user.name || "Client"}
                          </h4>
                          <div className="mt-1 flex items-center">
                            {[0, 1, 2, 3, 4].map((rating) => (
                              <StarIcon
                                key={rating}
                                className={`h-4 w-4 ${
                                  rating < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                aria-hidden="true"
                              />
                            ))}
                            <span className="ml-2 text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-4 text-sm text-gray-600">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-gray-600">Aucun avis pour le moment.</p>
              )}
            </div>
          </div>

          {/* Formulaire de réservation */}
          <div className="mt-12 lg:mt-0">
            <div className="sticky top-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">
                Réserver une prestation
              </h2>
              <p className="mt-2 text-gray-600">
                Tarif horaire :{" "}
                <span className="font-semibold">{interpreter.hourlyRate}€</span>
              </p>
              <div className="mt-6">
                <BookingForm
                  interpreterId={interpreter.id}
                  hourlyRate={interpreter.hourlyRate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
