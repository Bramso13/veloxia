"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

// Schéma de validation pour le formulaire de réservation
const bookingSchema = z
  .object({
    date: z.string().min(1, "La date est requise"),
    startTime: z.string().min(1, "L'heure de début est requise"),
    endTime: z.string().min(1, "L'heure de fin est requise"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(`${data.date}T${data.startTime}`);
      const end = new Date(`${data.date}T${data.endTime}`);
      return end > start;
    },
    {
      message: "L'heure de fin doit être après l'heure de début",
      path: ["endTime"],
    }
  );

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  interpreterId: string;
  hourlyRate: number;
}

export default function BookingForm({
  interpreterId,
  hourlyRate,
}: BookingFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      notes: "",
    },
  });

  // Surveiller les changements d'heure pour calculer la durée et le montant
  const watchDate = watch("date");
  const watchStartTime = watch("startTime");
  const watchEndTime = watch("endTime");

  // Calculer la durée et le montant total lorsque les heures changent
  const calculateDurationAndAmount = () => {
    try {
      const start = new Date(`${watchDate}T${watchStartTime}`);
      const end = new Date(`${watchDate}T${watchEndTime}`);

      if (end > start) {
        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        setDuration(durationHours);
        setTotalAmount(durationHours * hourlyRate);
      } else {
        setDuration(0);
        setTotalAmount(0);
      }
    } catch (error) {
      setDuration(0);
      setTotalAmount(0);
    }
  };

  // Mettre à jour la durée et le montant lorsque les valeurs changent
  useEffect(() => {
    calculateDurationAndAmount();
  }, [watchDate, watchStartTime, watchEndTime]);

  const onSubmit = async (data: BookingFormValues) => {
    if (status !== "authenticated") {
      toast.error("Vous devez être connecté pour réserver un interprète");
      router.push(
        "/login?callbackUrl=" + encodeURIComponent(window.location.href)
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interpreterId,
          date: data.date,
          time: data.startTime,
          duration,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Une erreur est survenue lors de la réservation"
        );
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la réservation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Date
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <CalendarIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="date"
            id="date"
            {...register("date")}
            min={new Date().toISOString().split("T")[0]}
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onChange={() => calculateDurationAndAmount()}
            disabled={isLoading}
          />
        </div>
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700"
          >
            Heure de début
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="time"
              id="startTime"
              {...register("startTime")}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              onChange={() => calculateDurationAndAmount()}
              disabled={isLoading}
            />
          </div>
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600">
              {errors.startTime.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700"
          >
            Heure de fin
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="time"
              id="endTime"
              {...register("endTime")}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              onChange={() => calculateDurationAndAmount()}
              disabled={isLoading}
            />
          </div>
          {errors.endTime && (
            <p className="mt-1 text-sm text-red-600">
              {errors.endTime.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes (optionnel)
        </label>
        <textarea
          id="notes"
          {...register("notes")}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Précisez vos besoins spécifiques..."
          disabled={isLoading}
        />
      </div>

      <div className="rounded-md bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Durée</span>
          <span className="text-sm font-medium text-gray-900">
            {duration.toFixed(1)} heure{duration !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
          <span className="text-base font-medium text-gray-900">Total</span>
          <span className="text-base font-medium text-gray-900">
            {totalAmount.toFixed(2)}€
          </span>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || status === "loading"}
      >
        {isLoading
          ? "Réservation en cours..."
          : status === "authenticated"
            ? "Réserver maintenant"
            : "Connectez-vous pour réserver"}
      </button>

      {status === "unauthenticated" && (
        <p className="mt-2 text-center text-sm text-gray-500">
          Vous devez être{" "}
          <a
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            connecté
          </a>{" "}
          pour réserver un interprète.
        </p>
      )}
    </form>
  );
}
