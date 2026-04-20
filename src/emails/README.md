# Emails transactionnels Alto

Flow Resend + Supabase pour les emails liés au cycle de réservation.

## Templates disponibles

Dans `src/emails/` :

| Template | Déclencheur | Envoyé par |
|---|---|---|
| `booking-confirmation.tsx` | Résa instant créée via `/api/guesty/reservation` mode=instant | Route reservation après succès Guesty |
| `inquiry-received.tsx` | Demande inquiry créée via `/api/guesty/reservation` mode=inquiry | Route reservation après succès Guesty |
| `inquiry-confirmed.tsx` | Guesty valide une inquiry (webhook) | `/api/webhooks/guesty` après capture Stripe |
| `inquiry-refused.tsx` | Guesty refuse une inquiry (webhook) | `/api/webhooks/guesty` |
| `pre-arrival.tsx` | Check-in dans 3 jours | Cron `/api/cron/reservation-emails` |
| `post-stay.tsx` | Check-out hier | Cron `/api/cron/reservation-emails` |

## Bilingue

Les templates utilisent `src/lib/i18n/email-dictionary.ts` (clés FR/EN typées). La locale est passée en prop dans chaque template.

Pour ajouter une langue : compléter les deux branches `fr` / `en` du dictionary, les types se mettent à jour automatiquement.

## Preview local

```bash
bun x email dev --dir src/emails
```

Ouvre `http://localhost:3001` pour naviguer les templates. Chaque template expose `PreviewProps` pour des données de démo.

## Variables par listing

Pour `pre-arrival.tsx`, les infos (WiFi, code accès, adresse, instructions) viennent de Guesty via `guestyClient.getListing()`. Le client doit remplir ces custom fields côté dashboard Guesty sur chaque listing.

## Flow inquiry hybride

Le mode inquiry ne transmet pas de carte à Guesty (BEAPI n'accepte pas). Le site :

1. Tokenise la carte côté Stripe.js (via SetupIntent pour permettre la ré-utilisation off_session)
2. Envoie le `stripePaymentMethodId` à `/api/guesty/reservation` mode=inquiry
3. La route stocke l'inquiry en Supabase avec le PaymentMethod ID + envoie `inquiry-received`
4. Alto valide ou refuse dans le dashboard Guesty
5. Guesty envoie un webhook `reservation.updated` à `/api/webhooks/guesty`
6. Le webhook crée un PaymentIntent off_session, capture le paiement via le Stripe Connect du listing, et envoie `inquiry-confirmed`

## Table Supabase

Schema dans `supabase/migrations/`. La table `inquiries` stocke les réservations (mode instant et inquiry), avec tracking du statut + des emails envoyés pour éviter les doublons.

Appliquer les migrations :

```bash
# Supabase CLI
supabase db push

# Ou via le dashboard Supabase, exécuter le SQL à la main dans l'ordre des fichiers
```

## Env vars requises

Voir `.env.example`. À minima :

- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` + `RESEND_FROM_NAME`
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- `GUESTY_WEBHOOK_SECRET` pour la verification signature
- `CRON_SECRET` pour protéger la route cron
- `STRIPE_SECRET_KEY` pour la capture off_session

## Tests

Tests Vitest dans `src/__tests__/` :
- `formatters.test.ts` : dates / currency / nights
- `email-dictionary.test.ts` : translate + interpolation
- `guesty-webhook.test.ts` : signature HMAC

```bash
bun test
```
