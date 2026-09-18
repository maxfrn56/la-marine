# La Marine — Quiberon

Site vitrine du plus vieux bar-restaurant de Quiberon, avec un back-office
permettant au restaurateur de tenir sa carte à jour lui-même.

## Démarrer

```bash
npm install
npm run dev
```

Deux services se lancent ensemble :

| Service | Adresse | Rôle |
| --- | --- | --- |
| `web` | http://localhost:5173 | le site (Vite) |
| `api` | http://localhost:4000 | l’API et le back-office |

En développement, Vite relaie `/api` et `/uploads` vers le serveur ; aucune
configuration supplémentaire n’est nécessaire.

## Mise en production

```bash
npm run build   # compile le site dans dist/
npm start       # sert l’API et le site compilé sur le port 4000
```

Le serveur sert alors `dist/` et renvoie `index.html` pour les routes React,
ce qui permet d’ouvrir directement `/carte` ou `/admin`.

### Variables d’environnement

| Variable | Rôle |
| --- | --- |
| `DATA_DIR` | dossier de la base et des photos — **doit pointer vers un stockage persistant** |
| `JWT_SECRET` | secret de signature des sessions ; à défaut, un secret aléatoire est généré dans `DATA_DIR/.jwt-secret` |
| `NODE_ENV=production` | passe le cookie de session en `secure` (HTTPS requis) |
| `PORT` | port d’écoute (4000 par défaut ; l’hébergeur le fournit généralement) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | compte du restaurateur, créé au **premier** démarrage uniquement |

### Déploiement sur Railway

1. Créer un projet à partir du dépôt GitHub. Railway détecte Node, exécute
   `npm ci`, `npm run build` puis `npm start` sans configuration.
2. Ajouter un **volume** et le monter sur `/data`. Sans volume, la base et les
   photos sont recréées à zéro à chaque redéploiement.
3. Renseigner les variables :

   ```
   DATA_DIR=/data
   NODE_ENV=production
   JWT_SECRET=<chaîne aléatoire longue>
   ADMIN_EMAIL=<e-mail du restaurateur>
   ADMIN_PASSWORD=<mot de passe solide>
   ADMIN_NAME=David Le Ruyet
   ```

   `ADMIN_*` doit être en place **avant** le premier démarrage : passé ce
   point, le compte existe et ces variables ne sont plus relues. Le mot de
   passe se change ensuite depuis l’onglet « Mon compte ».
4. Générer un domaine dans les réglages du service.

Ne pas renseigner `PORT` : Railway l’injecte lui-même.

## Le back-office

Accessible sur `/admin`, également via « Espace restaurateur » en pied de page.

En local, le compte est créé au premier démarrage avec des identifiants de
démonstration (`lamarine1712@gmail.com` / `LaMarine1915`). En production, ils
proviennent des variables `ADMIN_EMAIL` et `ADMIN_PASSWORD`, et le mot de passe
se change depuis l’onglet « Mon compte ».

Depuis le dashboard, le restaurateur peut :

- ajouter, modifier et supprimer les plats, rangés par rubrique de la carte
- faire de même pour les cocktails du bar
- envoyer une photo pour chaque plat ou cocktail
- masquer temporairement un élément sans le supprimer (rupture, hors saison)
- mettre un élément « en vitrine » pour le faire apparaître sur l’accueil

Toute modification est immédiatement répercutée sur la page concernée **et**
sur la page d’accueil.

## Architecture

```
server/
  index.js     API Express : session, CRUD, envoi de photos, service de dist/
  db.js        SQLite (schéma, amorçage, hachage des mots de passe)
  data/        base, secret de session et photos envoyées (hors dépôt,
               emplacement redéfinissable par DATA_DIR)

src/
  api/         client HTTP et types partagés
  content/     ContentProvider : charge la carte et la diffuse au site
  admin/       connexion et dashboard
  pages/       Accueil, La carte, Cocktails, Histoire
  components/  sections et éléments d’interface du site
```

Les données vivent dans un fichier SQLite (`server/data/la-marine.db`), créé
et amorcé au premier lancement avec la carte et les cocktails de la maison.
Les sessions reposent sur un JWT stocké dans un cookie `httpOnly`, et les mots
de passe sont hachés en scrypt.

## Vérifications

```bash
npm run build            # types + build
node scripts/e2e.mjs     # parcours complet du back-office (dev, port 5173)
node scripts/test-prod.mjs  # envoi de photo et routes en production (port 4000)
```

Ces scripts pilotent Chrome via `puppeteer-core` : ils créent, modifient,
masquent puis suppriment un plat et un cocktail, en vérifiant à chaque étape
que le site public reflète bien le changement. Ils reviennent à l’état initial
en fin de parcours.
