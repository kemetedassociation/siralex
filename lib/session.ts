import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/connexion");
  return session.user;
}

export async function requireRole(roles: string[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/tableau-de-bord");
  return user;
}
