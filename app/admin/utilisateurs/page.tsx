import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { ROLE_LABELS } from "@/lib/labels";
import { PLANS, type FormuleKey } from "@/lib/access";

export default async function AdminUtilisateursPage() {
  await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    include: { subscription: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Utilisateurs</h1>
      <p className="mt-1 text-sm text-foreground/60">{users.length} comptes.</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.02] text-left text-xs uppercase text-foreground/50">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rôle</th>
              <th className="px-4 py-2">Formule</th>
              <th className="px-4 py-2">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-black/10">
                <td className="px-4 py-2 font-medium text-brand-dark">{u.name}</td>
                <td className="px-4 py-2 text-foreground/60">{u.email}</td>
                <td className="px-4 py-2">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-2">{PLANS[(u.subscription?.plan ?? "GRATUITE") as FormuleKey].label}</td>
                <td className="px-4 py-2 text-foreground/50">{u.createdAt.toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
