# Alto

Site d'hôtellerie de luxe pour Alto, location courte durée haut de gamme à Paris et Lyon.

## Stack

Next.js 16 (App Router) | Tailwind v4 | Guesty BEAPI + Open API | Stripe.js | Resend | Supabase | Vercel

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
- `GUESTY_WEBHOOK_SECRET`
- `CANCEL_TOKEN_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CRON_SECRET`

## Storyblok

Le site lit les contenus Storyblok en `published` par défaut et passe en `draft` quand le mode preview Next.js est activé.

URL de preview à configurer dans Storyblok :

```txt
https://alto-collection.com/api/storyblok/preview?secret=STORYBLOK_PREVIEW_SECRET&slug={story.full_slug}
```

Pour la story d'accueil, renseigner `/` dans le champ `Real path` du Visual Editor.

## Architecture réservation

Flow actuel : inquiry Guesty-natif.

1. Le front récupère le payment provider Guesty du listing.
2. Stripe.js crée un PaymentMethod `pm_...` côté navigateur.
3. Le `pm_...` est envoyé comme `ccToken` à Guesty BEAPI pour créer l'inquiry.
4. Guesty pilote ensuite la charge, le refund et les statuts de réservation.
5. Les webhooks Guesty signés Svix déclenchent les emails Resend et mettent à jour le miroir Supabase.
6. Le mail de confirmation contient un lien d’annulation signé vers `/annulation?token=...`.

## Branches

- `main` : production (déploiement auto Vercel)
- `develop` : staging
- `feature/*` : développement

PR obligatoire pour merger dans `main`.
