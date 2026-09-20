import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  const dir = path.join(__dirname, "legal-texts");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();

  for (const file of files) {
    const t = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    const existing = await prisma.legalText.findFirst({ where: { title: t.title } });
    if (existing) {
      await prisma.legalText.update({
        where: { id: existing.id },
        data: {
          content: t.content,
          reference: t.reference,
          sourcePdfUrl: t.sourcePdfUrl ?? null,
          ...(t.fiable === false ? { fiable: false } : { fiable: true }),
        },
      });
      console.log(`Mis à jour: ${t.title} (${t.content.length} chars)`);
    } else {
      await prisma.legalText.create({
        data: {
          title: t.title,
          type: t.type,
          matiere: t.matiere,
          juridiction: t.juridiction,
          reference: t.reference,
          datePublication: new Date(t.datePublication),
          content: t.content,
          sourcePdfUrl: t.sourcePdfUrl ?? null,
          ...(t.fiable === false ? { fiable: false } : {}),
        },
      });
      console.log(`Créé: ${t.title}`);
    }
  }

  console.log("\nTerminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
