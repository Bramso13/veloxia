import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "@/lib/db";
import { z } from "zod";

// Enum pour les rôles d'utilisateur
enum UserRole {
  ADMIN = "ADMIN",
  INTERPRETER = "INTERPRETER",
  CLIENT = "CLIENT",
}

// Schéma de validation pour les données d'inscription
const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["CLIENT", "INTERPRETER"]),
  // Champs optionnels pour les interprètes
  languages: z.string().optional(),
  specializations: z.string().optional(),
  hourlyRate: z.number().optional(),
  city: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Données reçues:", body);

    // Validation des données
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      console.error("Erreurs de validation:", result.error.format());
      return NextResponse.json(
        {
          message: "Données d'inscription invalides",
          errors: result.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      role,
      languages,
      specializations,
      hourlyRate,
      city,
    } = result.data;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // Hachage du mot de passe
    const hashedPassword = await hash(password, 10);

    // Création de l'utilisateur
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any, // Conversion du type pour correspondre à l'enum de Prisma
      },
    });

    // Création du profil client ou interprète selon le rôle
    if (role === "CLIENT") {
      await db.client.create({
        data: {
          userId: user.id,
        },
      });
    } else if (role === "INTERPRETER") {
      try {
        await db.interpreter.create({
          data: {
            userId: user.id,
            hourlyRate: hourlyRate || 0, // Valeur par défaut ou celle fournie
            languages: languages || JSON.stringify(["LSF"]), // Langue des signes française par défaut
            specializations: specializations || JSON.stringify(["Général"]), // Spécialisation générale par défaut
            city,
          },
        });
      } catch (error) {
        console.error(
          "Erreur lors de la création du profil interprète:",
          error
        );
        // Supprimer l'utilisateur si la création du profil interprète échoue
        await db.user.delete({ where: { id: user.id } });
        throw error;
      }
    }

    return NextResponse.json(
      { message: "Utilisateur créé avec succès", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
