import { Resend } from "resend";
import {
  WelcomeEmail,
  BookingConfirmationEmail,
  PasswordResetEmail,
} from "./email-templates";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailTemplate =
  | "welcome"
  | "booking-confirmation"
  | "password-reset";

interface SendEmailParams {
  to: string;
  template: EmailTemplate;
  userName: string;
  actionUrl?: string;
  actionText?: string;
}

export async function sendEmail({
  to,
  template,
  userName,
  actionUrl,
  actionText,
}: SendEmailParams) {
  try {
    let emailContent: string;
    let subject: string;

    switch (template) {
      case "welcome":
        emailContent = await render(
          WelcomeEmail({
            userName,
            actionUrl,
            actionText,
          })
        );
        subject = "Bienvenue sur Sourd-Muet Connect";
        break;
      case "booking-confirmation":
        emailContent = await render(
          BookingConfirmationEmail({
            userName,
            actionUrl,
            actionText,
          })
        );
        subject = "Confirmation de votre réservation";
        break;
      case "password-reset":
        emailContent = await render(
          PasswordResetEmail({
            userName,
            actionUrl,
            actionText,
          })
        );
        subject = "Réinitialisation de votre mot de passe";
        break;
      default:
        throw new Error("Template d'email non reconnu");
    }

    const { data, error } = await resend.emails.send({
      from: "Sourd-Muet Connect <noreply@sourd-muet-connect.fr>",
      to,
      subject,
      html: emailContent,
    });

    if (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
}
