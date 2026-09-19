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
- **Contenus juridiques** : 18 textes réels intégralement chargés (voir
  ci-dessous « Corpus juridique ») ; seule la jurisprudence reste illustrative
  (aucune vraie décision fournie).
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
## Corpus juridique

`prisma/legal-texts/*.json` contient le texte intégral, extrait et nettoyé,
de 18 textes officiels (chargés par `prisma/seed.ts`) :

- **Sénégal** — COCC, Code de la famille, Code de procédure civile, Code de
  procédure pénale, Code du travail, Code des douanes, Code des
  investissements, Constitution, Code général des collectivités
  territoriales.
- **OHADA** — 9 actes uniformes (droit commercial général, sociétés
  commerciales et GIE, sûretés, procédures collectives, droit comptable,
  transport de marchandises par route, arbitrage, médiation, sociétés
  coopératives).

Textes demandés mais **non disponibles** dans les sources fournies — à
réinsérer dès qu'une meilleure source existe (`prisma/legal-texts/`, même
format JSON) :

| Texte | Raison |
|---|---|
| Code pénal | Seul un PDF d'amendement (loi n°2016-29) était fourni, et il est scanné (image), sans texte extractible |
| Code de la sécurité sociale | PDF avec police sans table d'encodage — extraction illisible même avec plusieurs outils |
| Code général des Impôts | Même problème d'encodage |
| Code électoral | PDF entièrement scanné (176 pages), nécessite une OCR non réalisée ici |
| Code des marchés publics | Aucun fichier fourni |
| Acte uniforme OHADA — procédures simplifiées de recouvrement (AUPSRVE) | PDF scanné (images), texte non extractible |

Les fichiers PDF sources (dossier `Siri docs/`) ne sont pas versionnés
(volumineux, non nécessaires au runtime une fois le contenu importé en base).

## Structure

```
app/                 Routes (App Router) — pages publiques, espace étudiant,
                      espace enseignant (/enseignant), back-office (/admin)
lib/actions/          Server Actions par domaine (cours, examens, communauté,
                      carrières, abonnement, documentation, auth)
lib/access.ts         Formules d'abonnement et règles d'accès par niveau
prisma/schema.prisma  Modèle de données complet
prisma/seed.ts        Comptes de démo, cours, examens, corpus juridique réel
prisma/legal-texts/   Textes juridiques réels (JSON), chargés par seed.ts
```
