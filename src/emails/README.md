# Emails transactionnels Alto

Flow Resend + Guesty pour les emails liés au cycle de réservation.

## Templates disponibles

Dans `src/emails/` :

| Template                     | Déclencheur                                      | Envoyé par                                                              |
| ---------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| `booking-confirmation.tsx`   | Paiement reçu et réservation confirmée           | Webhook Guesty `payments.received`                                      |
| `inquiry-received.tsx`       | Template legacy, non utilisé dans le flow actuel | Réservé si le mode demande revient                                      |
| `inquiry-confirmed.tsx`      | Template legacy, non utilisé dans le flow actuel | Réservé si on veut distinguer validation inquiry et confirmation finale |
| `inquiry-refused.tsx`        | Guesty refuse une inquiry (webhook)              | `/api/webhooks/guesty`                                                  |
| `cancellation-confirmed.tsx` | Annulation confirmée, avec ou sans remboursement | Webhook Guesty `payments.refunded` ou route cancel si remboursement nul |
| `pre-arrival.tsx`            | Check-in dans 3 jours                            | Cron `/api/cron/reservation-emails`                                     |
| `post-stay.tsx`              | Check-out hier                                   | Cron `/api/cron/reservation-emails`                                     |

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

## Flow réservation instantanée Guesty

Le site crée uniquement des réservations instantanées. Le paiement doit être capturé par Guesty avant confirmation.

1. Récupère le Stripe account du listing via `GET /api/guesty/payment-provider`
2. Affiche le `PaymentElement` Stripe sur le compte connecté du listing
3. Crée un `confirmationToken` Stripe côté front
4. Envoie ce `confirmationToken` à `/api/guesty/reservation`
5. La route appelle `POST /reservations/quotes/{quoteId}/instant-charge`
6. Le `confirmationToken` Stripe est créé avec `setupFutureUsage: 'off_session'`, car Guesty confirme le paiement avec un PaymentIntent configuré ainsi
7. Le site ne demande pas `reuse` à Guesty, car Alto veut charger cette réservation maintenant plutôt que réutiliser la carte sur de futurs séjours
8. Si Guesty retourne un paiement payé, la réservation est acceptée côté site
9. Si Guesty retourne `PENDING_AUTH`, le front termine l’authentification bancaire via Stripe puis appelle `/api/guesty/reservation/verify`
10. Si Guesty retourne `FAILED`, ou si la vérification échoue, la route annule la réservation non payée via OpenAPI avec une raison valide pour libérer les dates
11. Guesty envoie ses webhooks signés Svix vers `/api/webhooks/guesty`
12. `payments.received` déclenche `booking-confirmation`, `payments.refunded` gère les annulations remboursées
13. Une caution Swikly peut être demandée avant l’arrivée. Alto peut annuler la réservation si la caution n’est pas complétée dans les délais indiqués.

Le template `booking-confirmation` embarque aussi un lien d’annulation signé, construit côté serveur avec `CANCEL_TOKEN_SECRET`.

## Table Supabase

Schema dans `supabase/migrations/`. La table `inquiries` stocke un miroir léger des réservations instantanées, avec tracking du statut et des emails envoyés pour éviter les doublons. La table `guesty_webhook_events` déduplique les webhooks Svix.

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
- `GUESTY_WEBHOOK_SECRET` au format Svix (`whsec_...`)
- `CRON_SECRET` pour protéger la route cron
- `CANCEL_TOKEN_SECRET` pour signer les liens d’annulation
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `GUESTY_BEAPI_CLIENT_ID` + `GUESTY_BEAPI_CLIENT_SECRET`
- `GUESTY_OPENAPI_CLIENT_ID` + `GUESTY_OPENAPI_CLIENT_SECRET`

## Tests

Tests Vitest dans `src/__tests__/` :

- `formatters.test.ts` : dates / currency / nights
- `email-dictionary.test.ts` : translate + interpolation
- `guesty-webhook.test.ts` : signature Svix
- `cancellation-policy.test.ts` : règles de remboursement

```bash
bun test
```
