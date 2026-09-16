# SiraLex

MVP fonctionnel de la plateforme SiraLex, construit à partir du cahier des
charges (juillet 2026). Next.js 16 (App Router, Server Actions) + Prisma +
PostgreSQL (Neon) + NextAuth.

**Démo en ligne :** https://siralex-iota.vercel.app
**Dépôt :** https://github.com/kemetedassociation/siralex

## Démarrer en local

Nécessite une base PostgreSQL (le plus simple : réutiliser la base Neon du
projet Vercel via `vercel env pull`, ou en créer une autre gratuite sur
[neon.tech](https://neon.tech)).

```bash
npm install
cp .env.example .env     # puis renseigner DATABASE_URL / DATABASE_URL_UNPOOLED
npx prisma db push       # synchronise le schéma
npx tsx prisma/seed.ts   # données de démonstration
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Comptes de démonstration (mot de passe `demo1234`)

| Rôle | Email |
|---|---|
| Étudiant (L2) | `etudiant@siralex.sn` |
| Enseignant | `enseignant@siralex.sn` |
| Professionnel | `professionnel@siralex.sn` |
| Administrateur | `admin@siralex.sn` |

## Ce qui est implémenté

Les cinq piliers du cahier des charges (section 4), avec circuits de
validation par rôle :

- **Formation** — catalogue filtrable, lecture de cours, suivi de
  progression, accès gradué par formule (Licence/Master/Professionnel),
  circuit enseignant → comité scientifique → publication, historique de
  versions.
- **Examens** — QCM chronométrés (correction et note automatiques),
  cas pratiques/dissertations avec minuteur, enregistrement automatique
  de la copie, soumission automatique à l'expiration du temps, interface
  de correction manuelle avec annotations.
- **Documentation juridique** — recherche de textes et de jurisprudence,
  favoris, alertes de mise à jour, copie de référence, export PDF (impression).
- **Communauté** — fils de discussion par matière/promotion, signalement
  et modération.
- **Professionnalisation** — offres de stage/emploi/mentorat avec
  validation, candidatures.
- **Comptes & abonnements** — formules Gratuite/Licence/Master/Professionnel,
  changement de formule à tout moment, historique de paiement, suspension
  en cas d'échec de paiement.
- **Back-office admin** — validation des cours et épreuves, modération,
  validation des offres, liste des utilisateurs, statistiques globales.

## Ce qui est simulé ou hors périmètre de ce MVP

Le cahier des charges couvre un produit complet (web + mobile natif,
partenariats institutionnels, intégrations réelles). Dans cette première
version :

- **Paiement Mobile Money / carte** : simulé (`lib/actions/subscription.ts`).
  Toute transaction réussit, sauf le code `0000` qui démontre le parcours
  d'échec (suspension d'abonnement). Aucune intégration Orange Money / Wave /
  carte bancaire réelle.
- **Contenus juridiques** (Constitution, COCC, actes uniformes OHADA,
  jurisprudence) : résumés illustratifs à but pédagogique, clairement
  annotés comme tels — pas le texte officiel consolidé. À remplacer par un
  sourcing réel (Journal officiel, CCJA, éditeurs juridiques) avant toute
  mise en production.
- **Application mobile native** : non développée. L'interface web est
  responsive (mobile/tablette/desktop) mais il n'y a pas d'app iOS/Android
  ni de mode hors-ligne.
- **Recherche sémantique / assistant IA** (module Innovation, section 4.4) :
  non implémenté — la recherche est un filtre/`contains` classique.
- **SSO institutionnel, authentification réseaux sociaux** : seule
  l'authentification email/mot de passe est en place.
- **Télésurveillance des examens** : volontairement absente, comme
  précisé au cahier des charges pour cette phase (outil formatif, non
  certifiant).
- **Base de données** : SQLite en local pour tourner sans dépendance
  externe. Basculer sur PostgreSQL pour la production (`prisma/schema.prisma`,
  `datasource db`).

## Structure

```
app/                 Routes (App Router) — pages publiques, espace étudiant,
                      espace enseignant (/enseignant), back-office (/admin)
lib/actions/          Server Actions par domaine (cours, examens, communauté,
                      carrières, abonnement, documentation, auth)
lib/access.ts         Formules d'abonnement et règles d'accès par niveau
prisma/schema.prisma  Modèle de données complet
prisma/seed.ts        Jeu de données de démonstration
```
