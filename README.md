# KVB Rénovation (vitrine)

Vitrine statique pour **KVB Rénovation** (multi-services bâtiment).

## URLs

- Domaine de production: `https://kvb-renovation.fr/`
- GitHub Pages actuel: `https://dfilabs.github.io/kevin-bendjelloul-multiservices/`
- Dépôt: `https://github.com/DfiLabs/kevin-bendjelloul-multiservices`

## Modifier le contenu

- `content.json` contient le nom, la zone, les services, les photos, les avis, etc.
- Le fichier `main.js` charge `content.json` au chargement de la page.

## Design (version artisan)

- `styles.css`: base (structure + composants)
- `artisan.css`: surcouche “artisan / artistique” (textures papier, collage, style distinct)

## Prévisualiser en local

Sur macOS, depuis le dossier `websites/kevin_multiservices_site`:

```bash
python3 -m http.server 5173
```

Puis ouvrir `http://localhost:5173`.

## Valider

```bash
node ./scripts/validate.mjs
```

La validation vérifie notamment les placeholders, l’email non publié en clair, les liens de contact et la cohérence du domaine `kvb-renovation.fr`.

## Déploiement GitHub Pages

Le site est prévu pour GitHub Pages depuis la branche `main`, dossier racine `/`.

Pour publier une modification:

```bash
git add index.html content.json main.js styles.css artisan.css assets scripts CNAME .github .cursor README.md
git commit -m "Update KVB Rénovation site"
git push origin main
```

Le fichier `CNAME` configure le domaine personnalisé côté GitHub Pages.

## DNS OVH

Dans OVH, zone DNS de `kvb-renovation.fr`, configurer:

- `A` pour `@` vers `185.199.108.153`
- `A` pour `@` vers `185.199.109.153`
- `A` pour `@` vers `185.199.110.153`
- `A` pour `@` vers `185.199.111.153`
- `CNAME` pour `www` vers `dfilabs.github.io.`

Après propagation DNS, vérifier dans GitHub: `Settings -> Pages -> Custom domain`, puis activer `Enforce HTTPS`.

## Accès GitHub

Pour ajouter quelqu’un au code:

- Aller dans GitHub: `Settings -> Collaborators & teams`
- Ajouter son username ou email GitHub
- Choisir `Read`, `Write` ou `Admin`

Cursor n’a pas de liste d’accès séparée: chaque développeur se connecte à son propre compte GitHub dans Cursor, puis clone le dépôt après avoir été ajouté sur GitHub.

## Cursor AI

Les règles projet sont dans `.cursor/rules/`. Elles donnent le contexte permanent du site aux agents Cursor de l’équipe.

