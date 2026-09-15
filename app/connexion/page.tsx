"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ConnexionForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setPending(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push("/tableau-de-bord");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-14">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Connexion</h1>

      {params.get("inscrit") && (
        <p className="mt-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Compte créé avec succès. Vous pouvez vous connecter.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-black/15 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Mot de passe</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border border-black/15 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-brand px-4 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-4 text-sm text-foreground/60">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-brand hover:underline">
          S&apos;inscrire
        </Link>
      </p>

      <div className="mt-8 rounded border border-black/10 bg-white p-4 text-xs text-foreground/60">
        <p className="font-medium text-foreground/80">Comptes de démonstration</p>
        <p className="mt-1">etudiant@siralex.sn · enseignant@siralex.sn · admin@siralex.sn</p>
        <p>Mot de passe : demo1234</p>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}
