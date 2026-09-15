"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/actions/auth";

const ROLES = [
  { value: "ETUDIANT", label: "Étudiant" },
  { value: "ENSEIGNANT", label: "Enseignant" },
  { value: "PROFESSIONNEL", label: "Professionnel" },
];

const NIVEAUX = ["L1", "L2", "L3", "M1", "M2"];

export default function InscriptionPage() {
  const [state, formAction, pending] = useActionState(registerUser, null);
  const [role, setRole] = useState("ETUDIANT");

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Créer un compte</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Choisissez votre profil pour accéder aux contenus adaptés.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <label
              key={r.value}
              className={`cursor-pointer rounded border px-2 py-2 text-center text-sm ${
                role === r.value ? "border-brand bg-brand/5 font-medium text-brand" : "border-black/15"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={role === r.value}
                onChange={() => setRole(r.value)}
                className="sr-only"
              />
              {r.label}
            </label>
          ))}
        </div>

        {role === "ETUDIANT" && (
          <div>
            <label className="block text-sm font-medium text-foreground/80">Niveau</label>
            <select
              name="niveau"
              defaultValue="L1"
              className="mt-1 w-full rounded border border-black/15 px-3 py-2"
            >
              {NIVEAUX.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground/80">Nom complet</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded border border-black/15 px-3 py-2"
            placeholder="Aïssatou Diallo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80">Université / structure</label>
          <input
            name="universite"
            className="mt-1 w-full rounded border border-black/15 px-3 py-2"
            placeholder="UCAD, cabinet, entreprise…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-black/15 px-3 py-2"
            placeholder="vous@exemple.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80">Mot de passe</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded border border-black/15 px-3 py-2"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-brand px-4 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Création…" : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-4 text-sm text-foreground/60">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="text-brand hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
