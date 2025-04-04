"use client";

import Link from "next/link";
import {
  UserIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export default function HowItWorks() {
  const steps = [
    {
      title: "Créez votre compte",
      description:
        "Inscrivez-vous gratuitement en tant que client ou interprète. Remplissez votre profil avec vos informations personnelles.",
      icon: UserIcon,
    },
    {
      title: "Trouvez un interprète",
      description:
        "Recherchez un interprète qualifié dans votre ville. Consultez leurs profils, disponibilités, tarifs et avis.",
      icon: MagnifyingGlassIcon,
    },
    {
      title: "Réservez un créneau",
      description:
        "Sélectionnez une date et une durée qui vous conviennent. L'interprète sera notifié de votre demande.",
      icon: CalendarIcon,
    },
    {
      title: "Effectuez le paiement",
      description:
        "Payez en ligne de manière sécurisée. Le paiement n'est débité qu'une fois la prestation confirmée.",
      icon: CreditCardIcon,
    },
    {
      title: "Profitez du service",
      description:
        "Rencontrez votre interprète et bénéficiez d'une interprétation professionnelle en langue des signes.",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      title: "Donnez votre avis",
      description:
        "Après la prestation, partagez votre expérience en laissant un avis pour aider la communauté.",
      icon: StarIcon,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Comment ça marche ?
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Découvrez comment SignLink facilite la mise en relation entre
              personnes sourdes et interprètes en langue des signes.
            </p>
          </div>
        </div>
      </div>

      {/* Steps section */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <step.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {step.title}
              </h2>
              <p className="mt-4 flex-grow text-base text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ section */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
              Questions fréquentes
            </h2>
            <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
              <div className="pt-6">
                <dt className="text-lg font-semibold leading-7 text-gray-900">
                  Comment sont sélectionnés les interprètes ?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Nos interprètes sont des professionnels qualifiés en langue
                  des signes. Chaque interprète passe par un processus de
                  vérification avant de rejoindre la plateforme.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg font-semibold leading-7 text-gray-900">
                  Quels sont les délais de réservation ?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Vous pouvez réserver un interprète jusqu'à 24 heures avant la
                  prestation, sous réserve de disponibilité. Pour les demandes
                  urgentes, contactez-nous directement.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg font-semibold leading-7 text-gray-900">
                  Comment fonctionne le paiement ?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Le paiement s'effectue en ligne de manière sécurisée via
                  Stripe. Le montant est réservé lors de la réservation mais
                  n'est débité qu'après la prestation.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg font-semibold leading-7 text-gray-900">
                  Que faire en cas d'annulation ?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  L'annulation est gratuite jusqu'à 48h avant la prestation.
                  Passé ce délai, des frais peuvent s'appliquer. Consultez nos
                  conditions générales pour plus de détails.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Prêt à commencer ?
            <br />
            Inscrivez-vous gratuitement dès maintenant.
          </h2>
          <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <Link
              href="/register"
              className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-blue-600 shadow-sm hover:bg-gray-100"
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
    </div>
  );
}
