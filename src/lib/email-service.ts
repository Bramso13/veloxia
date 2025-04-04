import nodemailer from "nodemailer";

interface EmailTemplateProps {
  welcome: {
    name: string;
  };
  bookingConfirmation: {
    clientName: string;
    interpreterName: string;
    date: string;
    time: string;
    duration: number;
  };
  resetPassword: {
    resetLink: string;
  };
}

export type EmailTemplateType = keyof EmailTemplateProps;

const TEMPLATES = {
  WELCOME: "welcome",
  BOOKING_CONFIRMATION: "bookingConfirmation",
  RESET_PASSWORD: "resetPassword",
} as const;

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Templates d'emails
const emailTemplates = {
  [TEMPLATES.WELCOME]: (props: EmailTemplateProps["welcome"]) => ({
    subject: "Bienvenue sur SignLink !",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Bienvenue sur SignLink !</h1>
        <p>Bonjour ${props.name},</p>
        <p>Nous sommes ravis de vous accueillir sur SignLink, la plateforme qui facilite la mise en relation entre personnes sourdes et interprètes en langue des signes.</p>
        <p>N'hésitez pas à explorer notre plateforme et à nous contacter si vous avez des questions.</p>
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Accéder à SignLink
          </a>
        </div>
        <p style="margin-top: 20px;">À bientôt sur SignLink !</p>
      </div>
    `,
  }),

  [TEMPLATES.BOOKING_CONFIRMATION]: (
    props: EmailTemplateProps["bookingConfirmation"]
  ) => ({
    subject: "Confirmation de votre réservation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Votre réservation est confirmée !</h1>
        <p>Bonjour ${props.clientName},</p>
        <p>Votre réservation avec ${props.interpreterName} a été confirmée.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #1f2937; margin-top: 0;">Détails de la réservation :</h2>
          <p><strong>Date :</strong> ${props.date}</p>
          <p><strong>Heure :</strong> ${props.time}</p>
          <p><strong>Durée :</strong> ${props.duration}h</p>
        </div>
        <p>Vous recevrez un rappel 24h avant votre rendez-vous.</p>
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/reservations" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Voir mes réservations
          </a>
        </div>
      </div>
    `,
  }),

  [TEMPLATES.RESET_PASSWORD]: (props: EmailTemplateProps["resetPassword"]) => ({
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
        <div style="margin-top: 20px;">
          <a href="${props.resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="margin-top: 20px;">Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      </div>
    `,
  }),
};

// Fonction générique pour envoyer un email
async function sendEmail<T extends EmailTemplateType>(
  templateName: T,
  to: string,
  props: EmailTemplateProps[T]
) {
  try {
    const template = emailTemplates[templateName](props as any);
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: template.subject,
      html: template.html,
    });
    console.log("Email envoyé avec succès");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
}

// Fonctions d'envoi d'emails spécifiques
export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail(TEMPLATES.WELCOME, to, { name });
}

export async function sendBookingConfirmationEmail(
  to: string,
  clientName: string,
  interpreterName: string,
  date: string,
  time: string,
  duration: number
) {
  await sendEmail(TEMPLATES.BOOKING_CONFIRMATION, to, {
    clientName,
    interpreterName,
    date,
    time,
    duration,
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  await sendEmail(TEMPLATES.RESET_PASSWORD, to, { resetLink });
}
