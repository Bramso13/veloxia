import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Log pour le débogage
    console.log(
      "Middleware - Token:",
      token ? "Token présent" : "Pas de token"
    );
  } catch (error) {
    console.error("Erreur dans le middleware:", error);
  }

  return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    "/api/client/:path*",
    "/api/interpreter/:path*",
    "/api/bookings/:path*",
  ],
};
