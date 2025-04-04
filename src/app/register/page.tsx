"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { searchCities } from "@/services/cities";
import { ComboboxItem } from "@/components/ui/combobox";

// Schéma de validation pour le formulaire d'inscription
const registerSchema = z
  .object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Veuillez entrer une adresse email valide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    role: z.enum(["CLIENT", "INTERPRETER"]),
    hourlyRate: z.number().optional(),
    languages: z.string().optional(),
    specializations: z.string().optional(),
    city: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "INTERPRETER") {
        return data.city && data.city.length > 0;
      }
      return true;
    },
    {
      message: "Veuillez sélectionner une ville",
      path: ["city"],
    }
  );

// Types pour le formulaire
type RegisterFormValues = z.infer<typeof registerSchema>;

// Options pour les langues
const languageOptions = [
  { value: "LSF", label: "Langue des Signes Française (LSF)" },
  { value: "ASL", label: "American Sign Language (ASL)" },
  { value: "BSL", label: "British Sign Language (BSL)" },
  { value: "LIS", label: "Lingua dei Segni Italiana (LIS)" },
  { value: "DGS", label: "Deutsche Gebärdensprache (DGS)" },
];

// Options pour les spécialisations
const specializationOptions = [
  { value: "Général", label: "Général" },
  { value: "Médical", label: "Médical" },
  { value: "Juridique", label: "Juridique" },
  { value: "Éducation", label: "Éducation" },
  { value: "Conférence", label: "Conférence" },
  { value: "Culturel", label: "Culturel" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<
    string[]
  >([]);
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<ComboboxItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CLIENT",
      hourlyRate: 30, // Taux horaire par défaut
    },
  });

  const selectedRole = watch("role");

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

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);

    try {
      // Si c'est un interprète, ajouter les langues, spécialisations et la ville
      if (data.role === "INTERPRETER") {
        data.languages = JSON.stringify(
          selectedLanguages.length > 0 ? selectedLanguages : ["LSF"]
        );
        data.specializations = JSON.stringify(
          selectedSpecializations.length > 0
            ? selectedSpecializations
            : ["Général"]
        );
        data.city = city;
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Une erreur est survenue lors de l'inscription"
        );
      }

      toast.success(
        "Inscription réussie ! Vous pouvez maintenant vous connecter."
      );
      router.push("/login");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'inscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: "CLIENT" | "INTERPRETER") => {
    setValue("role", role, { shouldValidate: true });
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(language)) {
        return prev.filter((l) => l !== language);
      } else {
        return [...prev, language];
      }
    });
  };

  const toggleSpecialization = (specialization: string) => {
    setSelectedSpecializations((prev) => {
      if (prev.includes(specialization)) {
        return prev.filter((s) => s !== specialization);
      } else {
        return [...prev, specialization];
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Créer un compte
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Inscrivez-vous pour accéder à la plateforme
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rôle
              </label>
              <div className="mt-2 flex space-x-4">
                <div
                  className={`flex cursor-pointer items-center rounded-md border px-4 py-2 ${
                    selectedRole === "CLIENT"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  onClick={() => handleRoleChange("CLIENT")}
                >
                  <input
                    type="radio"
                    id="client"
                    value="CLIENT"
                    checked={selectedRole === "CLIENT"}
                    onChange={() => handleRoleChange("CLIENT")}
                    className="mr-2"
                  />
                  <label htmlFor="client" className="cursor-pointer">
                    Client
                  </label>
                </div>
                <div
                  className={`flex cursor-pointer items-center rounded-md border px-4 py-2 ${
                    selectedRole === "INTERPRETER"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  onClick={() => handleRoleChange("INTERPRETER")}
                >
                  <input
                    type="radio"
                    id="interpreter"
                    value="INTERPRETER"
                    checked={selectedRole === "INTERPRETER"}
                    onChange={() => handleRoleChange("INTERPRETER")}
                    className="mr-2"
                  />
                  <label htmlFor="interpreter" className="cursor-pointer">
                    Interprète
                  </label>
                </div>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            {selectedRole === "INTERPRETER" && (
              <>
                <div>
                  <label
                    htmlFor="hourlyRate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Taux horaire (€)
                  </label>
                  <input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="1"
                    {...register("hourlyRate", { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {errors.hourlyRate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.hourlyRate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Langues maîtrisées
                  </label>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {languageOptions.map((language) => (
                      <div
                        key={language.value}
                        className={`flex cursor-pointer items-center rounded-md border px-3 py-2 ${
                          selectedLanguages.includes(language.value)
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        onClick={() => toggleLanguage(language.value)}
                      >
                        <input
                          type="checkbox"
                          id={`language-${language.value}`}
                          checked={selectedLanguages.includes(language.value)}
                          onChange={() => toggleLanguage(language.value)}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`language-${language.value}`}
                          className="cursor-pointer text-sm"
                        >
                          {language.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.languages && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.languages.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Spécialisations
                  </label>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {specializationOptions.map((specialization) => (
                      <div
                        key={specialization.value}
                        className={`flex cursor-pointer items-center rounded-md border px-3 py-2 ${
                          selectedSpecializations.includes(specialization.value)
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        onClick={() =>
                          toggleSpecialization(specialization.value)
                        }
                      >
                        <input
                          type="checkbox"
                          id={`specialization-${specialization.value}`}
                          checked={selectedSpecializations.includes(
                            specialization.value
                          )}
                          onChange={() =>
                            toggleSpecialization(specialization.value)
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor={`specialization-${specialization.value}`}
                          className="cursor-pointer text-sm"
                        >
                          {specialization.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.specializations && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.specializations.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ville où vous exercez
                  </label>
                  <div className="relative mt-1">
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
                          setValue("city", e.target.value);
                        }}
                        placeholder="Entrez une ville (ex: Paris, Lyon, Marseille)"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    {showSuggestions && cities.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                        {cities.map((city) => (
                          <div
                            key={city.label}
                            onMouseDown={() => {
                              setCity(city.label);
                              setValue("city", city.label);
                              setShowSuggestions(false);
                            }}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {city.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Déjà inscrit ? Connectez-vous
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
