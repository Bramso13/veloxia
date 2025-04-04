import { db } from "@/lib/db";

export async function getInterpreter(id: string) {
  const interpreter = await db.interpreter.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
  return interpreter;
}
