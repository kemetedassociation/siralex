"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(8, "8 caractères minimum."),
  role: z.enum(["ETUDIANT", "ENSEIGNANT", "PROFESSIONNEL"]),
  niveau: z.enum(["L1", "L2", "L3", "M1", "M2"]).optional(),
  universite: z.string().optional(),
});

export type RegisterState = { error?: string } | null;

export async function registerUser(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    niveau: formData.get("niveau") || undefined,
    universite: formData.get("universite") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const { name, email, password, role, niveau, universite } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      niveau: role === "ETUDIANT" ? niveau ?? "L1" : undefined,
      universite,
      subscription: { create: { plan: "GRATUITE", status: "ACTIF" } },
    },
  });

  redirect("/connexion?inscrit=1");
}
