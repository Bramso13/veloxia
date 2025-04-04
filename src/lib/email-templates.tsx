import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailTemplateProps {
  userName: string;
  actionUrl?: string;
  actionText?: string;
}

export const WelcomeEmail = ({
  userName,
  actionUrl,
  actionText,
}: EmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Bienvenue sur Sourd-Muet Connect</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Bienvenue sur Sourd-Muet Connect</Heading>
        <Text style={text}>Bonjour {userName},</Text>
        <Text style={text}>
          Nous sommes ravis de vous accueillir sur Sourd-Muet Connect, la
          plateforme qui connecte les personnes sourdes et malentendantes avec
          des interprètes qualifiés.
        </Text>
        {actionUrl && actionText && (
          <Section style={buttonContainer}>
            <Link href={actionUrl} style={button}>
              {actionText}
            </Link>
          </Section>
        )}
        <Text style={text}>
          Si vous avez des questions, n'hésitez pas à nous contacter à{" "}
          <Link href="mailto:support@sourd-muet-connect.fr" style={link}>
            support@sourd-muet-connect.fr
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export const BookingConfirmationEmail = ({
  userName,
  actionUrl,
  actionText,
}: EmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Confirmation de votre réservation</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirmation de réservation</Heading>
        <Text style={text}>Bonjour {userName},</Text>
        <Text style={text}>
          Votre réservation a été confirmée. Vous pouvez consulter les détails
          de votre rendez-vous en cliquant sur le bouton ci-dessous.
        </Text>
        {actionUrl && actionText && (
          <Section style={buttonContainer}>
            <Link href={actionUrl} style={button}>
              {actionText}
            </Link>
          </Section>
        )}
        <Text style={text}>
          Si vous avez des questions, n'hésitez pas à nous contacter à{" "}
          <Link href="mailto:support@sourd-muet-connect.fr" style={link}>
            support@sourd-muet-connect.fr
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export const PasswordResetEmail = ({
  userName,
  actionUrl,
  actionText,
}: EmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Réinitialisation de votre mot de passe</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Réinitialisation de mot de passe</Heading>
        <Text style={text}>Bonjour {userName},</Text>
        <Text style={text}>
          Vous avez demandé la réinitialisation de votre mot de passe. Cliquez
          sur le bouton ci-dessous pour créer un nouveau mot de passe.
        </Text>
        {actionUrl && actionText && (
          <Section style={buttonContainer}>
            <Link href={actionUrl} style={button}>
              {actionText}
            </Link>
          </Section>
        )}
        <Text style={text}>
          Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer
          cet email.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.25",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};
