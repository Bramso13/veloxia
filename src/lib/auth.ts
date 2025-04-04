import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { compare } from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

// Définition des types personnalisés
export type UserRole = "ADMIN" | "INTERPRETER" | "CLIENT";

export interface CustomUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string | null;
  interpreterId?: string | null;
  clientId?: string | null;
}

// Configuration de NextAuth
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: "/login",
    error: "/login", // Page d'erreur personnalisée
  },
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email as string,
            },
            include: {
              interpreter: true,
              client: true,
            },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Retourner un objet utilisateur personnalisé
          return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            role: user.role as UserRole,
            image: user.image,
            interpreterId: user.interpreter?.id || null,
            clientId: user.client?.id || null,
          };
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.interpreterId = user.interpreterId;
        token.clientId = user.clientId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.interpreterId = token.interpreterId as string | null;
        session.user.clientId = token.clientId as string | null;
      }
      return session;
    },
  },
};

// Déclaration pour étendre les types de NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole;
      interpreterId?: string | null;
      clientId?: string | null;
    };
  }

  interface User {
    role?: UserRole;
    interpreterId?: string | null;
    clientId?: string | null;
  }

  interface JWT {
    id?: string;
    role?: UserRole;
    interpreterId?: string | null;
    clientId?: string | null;
  }
}
