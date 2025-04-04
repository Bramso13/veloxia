import { useState } from "react";
import type { EmailTemplate } from "@/lib/email-service";

interface UseEmailReturn {
  sendEmail: (params: {
    to: string;
    template: EmailTemplate;
    userName: string;
    actionUrl?: string;
    actionText?: string;
  }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useEmail(): UseEmailReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (params: {
    to: string;
    template: EmailTemplate;
    userName: string;
    actionUrl?: string;
    actionText?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de l'email");
      }

      await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendEmail, isLoading, error };
}
