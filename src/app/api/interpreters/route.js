import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Fonction utilitaire pour parser les chaînes JSON
function parseJsonField(field) {
  if (!field) return [];
  try {
    return JSON.parse(field);
  } catch (error) {
    console.error("Erreur lors du parsing JSON:", error);
    return [];
  }
}

export async function GET(request) {
  try {
    // Récupérer les paramètres de recherche
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");

    // Construire la requête avec les filtres
    const whereClause = {
      // isVerified: true, // Décommenté si vous voulez filtrer uniquement les interprètes vérifiés
    };

    // Ajouter le filtre de ville si présent
    if (city) {
      whereClause.city = {
        contains: city,
        // Pas de mode nécessaire pour la recherche
      };
    }

    const interpreters = await db.interpreter.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        rating: "desc",
      },
    });

    // Convertir les champs JSON en tableaux
    const parsedInterpreters = interpreters.map((interpreter) => ({
      ...interpreter,
      languages: parseJsonField(interpreter.languages),
      specializations: parseJsonField(interpreter.specializations),
    }));

    return NextResponse.json(parsedInterpreters);
  } catch (error) {
    console.error("Erreur lors de la récupération des interprètes:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des interprètes" },
      { status: 500 }
    );
  }
}
