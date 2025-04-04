import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Créer des utilisateurs
    const adminPassword = await hash("Admin123", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@example.com",
        password: adminPassword,
        role: "ADMIN",
      },
    });

    const interpreterPassword = await hash("Interpreter123", 10);
    const interpreter1 = await prisma.user.create({
      data: {
        name: "Sophie Martin",
        email: "sophie@example.com",
        password: interpreterPassword,
        role: "INTERPRETER",
        image: "https://randomuser.me/api/portraits/women/1.jpg",
        interpreter: {
          create: {
            bio: "Interprète en langue des signes française (LSF) avec 5 ans d'expérience. Spécialisée dans les domaines médical et juridique.",
            experience: 5,
            certifications: "Diplôme d'interprète LSF, Certification médicale",
            hourlyRate: 45.0,
            languages: JSON.stringify(["LSF", "ASL"]),
            specializations: JSON.stringify(["Médical", "Juridique"]),
            rating: 4.8,
            reviewCount: 24,
            isVerified: true,
          },
        },
      },
    });

    const interpreter2 = await prisma.user.create({
      data: {
        name: "Thomas Dubois",
        email: "thomas@example.com",
        password: interpreterPassword,
        role: "INTERPRETER",
        image: "https://randomuser.me/api/portraits/men/2.jpg",
        interpreter: {
          create: {
            bio: "Interprète professionnel en LSF et langue des signes internationale (LSI). Expérience dans l'éducation et les conférences.",
            experience: 8,
            certifications:
              "Master en interprétation LSF, Certification internationale",
            hourlyRate: 50.0,
            languages: JSON.stringify(["LSF", "LSI"]),
            specializations: JSON.stringify([
              "Éducation",
              "Conférences",
              "Événements culturels",
            ]),
            rating: 4.9,
            reviewCount: 36,
            isVerified: true,
          },
        },
      },
    });

    const clientPassword = await hash("Client123", 10);
    const client1 = await prisma.user.create({
      data: {
        name: "Marie Dupont",
        email: "marie@example.com",
        password: clientPassword,
        role: "CLIENT",
        image: "https://randomuser.me/api/portraits/women/3.jpg",
        client: {
          create: {},
        },
      },
    });

    const client2 = await prisma.user.create({
      data: {
        name: "Jean Bernard",
        email: "jean@example.com",
        password: clientPassword,
        role: "CLIENT",
        image: "https://randomuser.me/api/portraits/men/4.jpg",
        client: {
          create: {},
        },
      },
    });

    // Créer des réservations
    const booking1 = await prisma.booking.create({
      data: {
        startTime: new Date("2024-03-10T10:00:00Z"),
        endTime: new Date("2024-03-10T12:00:00Z"),
        status: "CONFIRMED",
        paymentStatus: "PAID",
        totalAmount: 90.0,
        notes: "Rendez-vous médical à l'hôpital Saint-Antoine",
        client: {
          connect: {
            id: (await prisma.client.findUnique({
              where: { userId: client1.id },
            }))!.id,
          },
        },
        interpreter: {
          connect: {
            id: (await prisma.interpreter.findUnique({
              where: { userId: interpreter1.id },
            }))!.id,
          },
        },
      },
    });

    const booking2 = await prisma.booking.create({
      data: {
        startTime: new Date("2024-03-15T14:00:00Z"),
        endTime: new Date("2024-03-15T16:00:00Z"),
        status: "PENDING",
        paymentStatus: "UNPAID",
        totalAmount: 100.0,
        notes: "Conférence sur l'accessibilité numérique",
        client: {
          connect: {
            id: (await prisma.client.findUnique({
              where: { userId: client2.id },
            }))!.id,
          },
        },
        interpreter: {
          connect: {
            id: (await prisma.interpreter.findUnique({
              where: { userId: interpreter2.id },
            }))!.id,
          },
        },
      },
    });

    // Créer des avis
    const review1 = await prisma.review.create({
      data: {
        rating: 5,
        comment:
          "Excellente interprétation, très professionnelle et ponctuelle.",
        booking: {
          connect: {
            id: booking1.id,
          },
        },
        client: {
          connect: {
            id: (await prisma.client.findUnique({
              where: { userId: client1.id },
            }))!.id,
          },
        },
        interpreter: {
          connect: {
            id: (await prisma.interpreter.findUnique({
              where: { userId: interpreter1.id },
            }))!.id,
          },
        },
      },
    });

    console.log("Base de données initialisée avec succès !");
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de la base de données:",
      error
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
