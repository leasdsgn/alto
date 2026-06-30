# Alto

Site d'hôtellerie de luxe pour Alto, location courte durée haut de gamme à Paris et Lyon.

## Stack

Next.js 16 (App Router) | Tailwind v4 | Guesty BEAPI + Open API | Stripe.js | Storyblok | Vercel

## Démarrage

```bash
bun install
bun dev
```

Le serveur tourne sur `http://localhost:3000`.

## Scripts

| Commande               | Action                  |
| ---------------------- | ----------------------- |
| `bun dev`              | Dev server (Turbopack)  |
| `bun run build`        | Build production        |
| `bun run lint`         | ESLint                  |
| `bun run typecheck`    | Vérification TypeScript |
| `bun run format`       | Prettier (écriture)     |
| `bun run format:check` | Prettier (vérification) |
| `bun run storyblok:seed-blog` | Crée ou met à jour le modèle blog dans Storyblok |
| `bun run storyblok:seed-apartments` | Crée le modèle éditorial des appartements dans Storyblok |

## Variables d'environnement

Copier `.env.example` vers `.env.local` et remplir les valeurs.

Variables minimales pour le flow de réservation :

- `NEXT_PUBLIC_STORYBLOK_TOKEN`
- `STORYBLOK_PREVIEW_TOKEN`
- `STORYBLOK_PREVIEW_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `GUESTY_BEAPI_CLIENT_ID`
- `GUESTY_BEAPI_CLIENT_SECRET`
- `GUESTY_OPENAPI_CLIENT_ID`
- `GUESTY_OPENAPI_CLIENT_SECRET`
- `CRON_SECRET`

## Storyblok

Le site lit les contenus Storyblok en `published` par défaut et passe en `draft` quand le mode preview Next.js est activé.

URL de preview à configurer dans Storyblok :

```txt
https://alto-collection.com/preview
```

Pour la story `site-images`, renseigner `/` dans le champ `Real path` du Visual Editor.

La route manuelle suivante reste disponible pour activer le draft mode depuis un lien sécurisé :

```txt
https://alto-collection.com/api/storyblok/preview?secret=STORYBLOK_PREVIEW_SECRET&slug=/
```

### Appartements

Guesty reste la source de vérité pour les données opérationnelles : prix, disponibilités, capacité, adresse, photos et réservation.

Storyblok sert de couche éditoriale :

- `global-faq` : FAQ commune à toutes les pages appartement
- `apartments/{slug}` : contenu éditorial optionnel d’un appartement

Chaque story appartement doit utiliser le composant `apartment_editorial` et renseigner au minimum :

- `guesty_id` : ID Guesty de l’appartement
- `slug` : slug front, par exemple `voltaire-iii`

Les champs texte des modèles blog et appartements sont marqués comme traduisibles dans Storyblok pour gérer FR/EN.

## Architecture réservation

Flow actuel : réservation instantanée Guesty avec paiement immédiat.

1. Le front récupère le payment provider Guesty du listing.
2. Stripe.js crée un `confirmationToken` côté navigateur.
3. Le `confirmationToken` est envoyé à Guesty BEAPI via le endpoint instant-charge.
4. Si Guesty retourne un paiement confirmé, la réservation est affichée comme confirmée.
5. Si Guesty retourne `PENDING_AUTH`, le front lance le 3DS avec Stripe.js, puis vérifie l’état Guesty.
6. Si le paiement échoue ou reste non finalisé, le site tente uniquement de fermer la réservation impayée dans Guesty.
7. Les emails transactionnels, rappels, annulations opérationnelles et cautions Swikly sont gérés côté Guesty/Alto, pas par le site.

Le site ne gère plus de miroir Supabase, de webhooks Guesty entrants, d’emails Resend, ni de refunds déclenchés depuis une route publique.

## Branches

- `main` : production (déploiement auto Vercel)
- `develop` : staging
- `feature/*` : développement

PR obligatoire pour merger dans `main`.
