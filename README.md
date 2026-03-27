# Alto

Site d'hôtellerie de luxe pour Alto, location courte durée haut de gamme à Paris et Lyon.

## Stack

Next.js 16 (App Router) | Tailwind v4 | Storyblok | GSAP + Lenis + OGL | Vercel

## Démarrage

```bash
bun install
bun dev
```

Le serveur tourne sur `http://localhost:3000`.

## Scripts

| Commande | Action |
|----------|--------|
| `bun dev` | Dev server (Turbopack) |
| `bun run build` | Build production |
| `bun run lint` | ESLint |
| `bun run typecheck` | Vérification TypeScript |
| `bun run format` | Prettier (écriture) |
| `bun run format:check` | Prettier (vérification) |

## Variables d'environnement

Copier `.env.example` vers `.env.local` et remplir les valeurs.

## Branches

- `main` : production (déploiement auto Vercel)
- `develop` : staging
- `feature/*` : développement

PR obligatoire pour merger dans `main`.
