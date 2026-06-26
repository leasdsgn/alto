# Storyblok Full CMS — Design Doc

> Date : 2026-06-26
> Auteur : Léa (validation décisions) + Claude (implémentation)
> Branche cible : `feature/storyblok-full-cms`
> Livrable : 1 PR finale, ~14 commits atomiques

---

## Objectif

Rendre **toutes les pages** du site Alto pilotables via le Visual Editor Storyblok, avec une architecture pensée pour des éditeurs newbies (labels FR clairs, descriptions, fallbacks silencieux) et un maximum de customisation (bloks composables drag & drop).

État actuel : `@storyblok/react` v6 est wiré, mais seul le blog + l'éditorial appart + une story `site-images` (refs d'images flat) sont réellement CMS-driven. Toutes les autres pages portent leur contenu en `*_COPY` consts hardcodés.

Objectif post-implémentation :
- 1 story par page (`pages/home`, `pages/lyon`, etc.) avec body composable
- Bloks réutilisables pour patterns récurrents (hero, CTA, FAQ, services...)
- Globals pour Header / Footer / Sticky CTA / FAQ commune
- Visual Editor fonctionnel sur **chaque URL** (pas juste `/`)
- i18n split : Storyblok pour le contenu (translatable fields FR/EN), `next-intl` pour strings techniques
- Apartment editorial supprimé (Guesty est source), FAQ commune via `globals/apartment-faq`

---

## Décisions validées

| Décision | Réponse Léa | Conséquence |
|----------|-------------|-------------|
| Périmètre | Toutes les pages | 10 pages : home, lyon, appartements, notre-histoire, investir, contact, blog, cgv, confidentialite, annulation + globals |
| Philosophie bloks | Pertinence + max customisation pour newbies | Bloks réutilisables (hero, cta, faq...) + bloks dédiés pour sections uniques (lyon_quartiers, invest_model) |
| Structure stories | Reco validée | `pages/*` (content type `page` avec `body: bloks[]`) + `globals/*` (singletons) |
| i18n | Split | Champs Storyblok translatable FR/EN + `next-intl` pour strings techniques |
| Credentials | Ne pas écraser, lire + créer OK | Lecture `.env.local`, scripts seed avec mode `dry-run` puis `apply`, snapshot avant write |
| Preview | Prod uniquement + secret en place | Pas de tunnel local, Visual Editor branché sur `alto-collection.com/preview` |
| Fallbacks | Reco validée | Champs core en `required` côté schema + fallback hardcoded silencieux ; bloks optionnels = fallback A (rien si vide) |
| Apartment detail | Tout Guesty | Suppression `apartment_editorial` content type, FAQ via `globals/apartment-faq`, témoignages dans `globals/shared-testimonials` |
| Blog | On ne touche pas à `blog/[slug]` | Article view inchangé, seule la story `pages/blog` (index) est créée |
| Workflow | Branche dédiée, 1 setup + N par page, sans interruption | `feature/storyblok-full-cms`, ~14 commits atomiques, 1 PR finale |

### Décisions par inférence (à confirmer rapidement)

| Inférence | Choix retenu | Possibilité de revert |
|-----------|--------------|------------------------|
| `/about` vs `/notre-histoire` | `/about` → `redirect()` Next.js vers `/notre-histoire` (1 source) | Trivial à recréer comme story séparée si besoin |
| Avatars partagés (location/traveler) | Conservés dans `globals/shared-assets` (story dédiée) | Migration trivial |
| Story `site-images` | DEPRECATED progressivement, images migrées vers stories de page concernées | Phase 11 du plan |
| Témoignages | Story `globals/shared-testimonials` (utilisée sur home + apartment detail) | OK |
| Pages légales | Bloks : `hero_compact_section` + `rich_text_section` (Storyblok richtext field) | OK |

---

## Architecture Storyblok

### 1. Content types (root types)

| Type | Slug pattern | Rôle |
|------|--------------|------|
| `page` | `pages/*` | Page composable avec `body: bloks[]` + `seo: meta` |
| `header_global` | `globals/header` | Singleton — config nav, logo, mobile menu |
| `footer_global` | `globals/footer` | Singleton — CTA, nav links, contact, copyright |
| `sticky_cta_global` | `globals/sticky-cta` | Singleton — config CTA flottant (search bar) |
| `shared_assets_global` | `globals/shared-assets` | Singleton — avatars partagés, gradients |
| `shared_testimonials_global` | `globals/shared-testimonials` | Singleton — pool de témoignages |
| `faq_global` | `globals/apartment-faq` | Singleton — FAQ commune à toutes les pages appart (existe déjà) |
| `article` | `articles/*` | Inchangé (blog existant) |

### 2. Bloks atomiques (nested, non-root)

| Blok | Champs |
|------|--------|
| `meta` | `title` (text, translatable), `description` (textarea, translatable), `og_image` (asset), `no_index` (bool) |
| `link` | `label` (text, translatable), `link` (Storyblok link field — story / url / email), `opens_in_new_tab` (bool) |
| `cta_button` | `label` (text, translatable), `link` (Storyblok link), `variant` (select: primary, outline, ghost), `size` (select: small, default, large) |
| `faq_item` | `question` (text, translatable), `answer` (richtext, translatable) |
| `service_card` | `icon` (asset, SVG), `title` (text, translatable), `description` (textarea, translatable) |
| `feature` | `icon` (asset), `title` (text, translatable), `description` (textarea, translatable) |
| `stat` | `value` (text, translatable), `label` (text, translatable), `icon` (asset, optionnel) |
| `testimonial` | `quote` (textarea, translatable), `name` (text), `apartment` (text), `stay` (text, translatable) |
| `quartier` | `name` (text), `slug` (text), `description` (textarea, translatable), `image` (asset) |
| `panel` | `image` (asset), `label` (text, translatable), `title` (text, translatable) |
| `founder` | `name` (text), `role` (text, translatable), `image` (asset), `alt` (text, translatable) |
| `concept_point` | `title` (text, translatable), `description` (textarea, translatable) |
| `subject_option` | `value` (text), `label` (text, translatable) |
| `social_link` | `platform` (select: instagram, facebook, x, linkedin, tiktok, youtube), `url` (text) |

### 3. Bloks de section (composables dans `page.body[]`)

| Blok | Usage | Champs principaux |
|------|-------|-------------------|
| `hero_section` | Home, Lyon (variants riches avec search bar) | `background_image` (asset), `overlay_image` (asset, opt), `eyebrow` (text), `title_parts` (3 champs OU `title` rich), `subtitle` (textarea), `ctas` (bloks `cta_button`), `show_search_bar` (bool), `height` (select: svh / fixed-442 / auto) |
| `hero_compact_section` | Investir, Contact, Appartements, Blog, CGV | `background_image` (asset), `eyebrow` (text), `title` (text), `body` (textarea), `height` (select) |
| `text_section` | Sections intro/explication | `eyebrow` (text), `title` (text), `body` (richtext), `max_width` (select: prose, full), `alignment` (select: left, center) |
| `image_text_section` | About concept, Lyon services, Investir model | `image` (asset), `image_position` (select: left, right), `eyebrow`, `title`, `body` (richtext), `points` (bloks `concept_point`, opt), `ctas` (bloks `cta_button`) |
| `feature_grid_section` | Investir model points, About concept | `eyebrow`, `title`, `intro` (textarea), `columns` (select: 2, 3, 4), `features` (bloks `feature`), `variant` (select: icons, numbered, plain) |
| `stats_section` | Lyon stats, Investir stats, About stats | `items` (bloks `stat`), `logos` (multi-asset), `logo_label` (text), `variant` (select: dark, light, sand) |
| `cta_section` | Footer contact CTA, Investir contact | `eyebrow`, `title`, `body` (textarea), `ctas` (bloks `cta_button`), `variant` (select: cream, coffee, sand, gradient) |
| `testimonials_section` | Home, About | `eyebrow`, `title`, `items` (bloks `testimonial`) OR `source` (select: inline, global → utilise `globals/shared-testimonials`) |
| `services_section` | Home, Blog, About | `eyebrow`, `title`, `intro`, `items` (bloks `service_card`), `variant` (select: grid, list, gradient-cards) |
| `faq_section` | Lyon, Investir, About | `eyebrow`, `title`, `items` (bloks `faq_item`) OR `source` (select: inline, global → ref `globals/apartment-faq`) |
| `apartments_grid_section` | Home, About, Lyon, Blog, Appartements (mode complet) | `eyebrow`, `paris_title`, `lyon_title`, `city_filter` (select: all, paris, lyon), `max_per_city` (number, 0=tous), `show_search_bar` (bool), `display_mode` (select: carousel, grid, lyon-3-cards) |
| `blog_grid_section` | Home, Lyon, Blog index | `eyebrow`, `title`, `intro`, `max_items` (number), `section_filter` (select: all, lyon, paris), `cta_label`, `cta_link` (Storyblok link), `fallback_subtitle`, `reading_time_label`, `pagination_previous_label`, `pagination_next_label` |
| `quartiers_section` | Lyon | `eyebrow`, `title`, `items` (bloks `quartier`) |
| `panels_section` | Home experience | `eyebrow`, `button_label`, `button_link` (link), `panels` (bloks `panel`, max 3) |
| `founders_section` | Notre-histoire | `eyebrow`, `title`, `body`, `link_label`, `link_url` (link), `founders` (bloks `founder`) |
| `about_reality_section` | Notre-histoire | `title`, `paragraphs` (textarea, repeatable) |
| `concept_section` | Notre-histoire | `title`, `image`, `image_alt`, `points` (bloks `concept_point`) |
| `guarantees_section` | Notre-histoire (AboutGuarantees) | `image`, `eyebrow`, `title`, `items` (bloks `feature`) |
| `invest_model_section` | Investir | `eyebrow`, `title`, `image`, `image_alt`, `points` (bloks `feature`) |
| `invest_stats_section` | Investir | `line_one` (text), `line_two` (text), `body` (textarea), `seen_on_label` (text), `logos` (multi-asset) |
| `contact_form_section` | Contact | `eyebrow`, `title`, `intro`, `firstname_label`, `lastname_label`, `email_label`, `subject_label`, `subjects` (bloks `subject_option`), `message_label`, `submit_label`, `success_message`, `sidebar_email`, `sidebar_phone_label`, `sidebar_phone`, `sidebar_address_label`, `sidebar_address_lines` (multi-text), `sidebar_socials_label`, `sidebar_socials` (bloks `social_link`) |
| `rich_text_section` | CGV, Confidentialité, Annulation | `body` (richtext, translatable), `max_width` (select) |
| `divider_section` | Spacer entre sections | `variant` (select: line, spacer-sm, spacer-lg, sand-block) |

### 4. Globals (singletons)

#### `header_global` (slug: `globals/header`)
```
logo_light (asset), logo_dark (asset)
nav_primary (bloks link, max 4) — Apartments / Blog / Story (chacun avec description pour mobile menu)
nav_secondary (bloks link, max 4) — Paris / Lyon / Contact
book_label (text, translatable) — défaut "Réserver"
map_label (text, translatable) — défaut "Voir la carte"
mobile_open_label, mobile_close_label (text, translatable)
mobile_navigation_label, mobile_quick_access_label (text, translatable)
mobile_footer_text (textarea, translatable)
mobile_footer_button_label (text, translatable)
mobile_footer_button_link (Storyblok link)
```

#### `footer_global` (slug: `globals/footer`)
```
logo (asset), logo_aria_label (text, translatable)
cta_title (text, translatable)
cta_body (textarea, translatable)
cta_button (blok cta_button)
nav_links (bloks link)
copyright (text, translatable)
nav_aria_label (text, translatable)
```

#### `sticky_cta_global` (slug: `globals/sticky-cta`)
```
enabled (bool, default true)
threshold_vh (number, 0-100, default 80)
```

#### `shared_assets_global` (slug: `globals/shared-assets`)
```
location_avatars (multi-asset, exactement 3)
location_avatar_alts (multi-text, exactement 3, translatable)
traveler_avatars (multi-asset, exactement 3)
traveler_avatar_alts (multi-text, exactement 3, translatable)
footer_background (asset)
```

#### `shared_testimonials_global` (slug: `globals/shared-testimonials`)
```
items (bloks testimonial, illimité)
```

#### `faq_global` (slug: `globals/apartment-faq`) — existe déjà, schema enrichi
```
title (text, translatable) — défaut "Questions fréquentes"
eyebrow (text, translatable) — défaut "FAQ"
items (bloks faq_item)
```

### 5. Mapping pages

| URL Next.js | Story Storyblok | Body bloks (proposé) |
|-------------|------------------|----------------------|
| `/` | `pages/home` | hero_section, image_text_section (about), apartments_grid_section, panels_section, testimonials_section, services_section, blog_grid_section |
| `/lyon` | `pages/lyon` | hero_section, stats_section, apartments_grid_section (lyon-3-cards), image_text_section (services), quartiers_section, blog_grid_section, faq_section |
| `/appartements` | `pages/appartements` | hero_compact_section, apartments_grid_section (mode complet + search), blog_grid_section (editorial), services_section |
| `/appartements/[slug]` | **(pas de story)** | Géré par `ApartmentView` : 100% Guesty + `globals/apartment-faq` + `globals/shared-testimonials` |
| `/notre-histoire` | `pages/notre-histoire` | hero_section (avec stats embarquées), about_reality_section, services_section (gradient cards), concept_section, guarantees_section, founders_section, apartments_grid_section |
| `/about` | redirect → `/notre-histoire` | — |
| `/investir` | `pages/investir` | hero_compact_section, text_section (apartments), image_text_section (model), invest_stats_section, cta_section (contact), faq_section |
| `/contact` | `pages/contact` | hero_compact_section, contact_form_section |
| `/blog` | `pages/blog` | hero_compact_section, blog_grid_section, services_section, apartments_grid_section |
| `/blog/[slug]` | **inchangé** | Article view existant (Storyblok déjà) |
| `/cgv` | `pages/cgv` | hero_compact_section, rich_text_section |
| `/confidentialite` | `pages/confidentialite` | hero_compact_section, rich_text_section |
| `/annulation` | `pages/annulation` | hero_compact_section, rich_text_section |

---

## i18n strategy

### Storyblok (translatable fields)
Tous les champs `text`, `textarea`, `richtext` portant du contenu éditorial sont marqués `translatable: true` côté schema. Langue par défaut FR, EN en `translations.en`.

Fetch côté front :
```ts
storyblokApi.get(`cdn/stories/${slug}`, {
  language: locale,
  fallback_lang: 'fr',
})
```

### next-intl (strings techniques)
Conservé pour :
- Messages d'erreur API / validation form (Zod)
- Strings 100% techniques (a11y labels génériques qui ne devraient pas changer)
- Le `useTranslations('nav')` actuel dans Header sera **supprimé** au profit de `globals/header`

`messages/fr.json` et `messages/en.json` allégés au strict minimum (cible : ~20 clés au lieu de ~80).

---

## Preview routing (Visual Editor)

Le fichier `src/app/preview/[[...slug]]/page.tsx` est **complètement réécrit**.

Avant : redirect vers les vraies pages (le Visual Editor ne montre que le rendu HTML routé).
Après : rendu live `<StoryblokStory>` directement dans `/preview/...` avec le bridge JS activé.

```ts
// pseudo-code
export default async function PreviewPage({ params }) {
  draftMode().enable()
  const slug = resolveSlug(params)
  // slug examples:
  //   /pages/home, /pages/lyon, /globals/header...
  const story = await storyblokApi.get(`cdn/stories/${slug}`, {
    version: 'draft',
    language: locale,
    fallback_lang: 'fr',
  })
  return <StoryblokStory story={story} bridgeOptions={{ ... }} />
}
```

URL preview à configurer côté Storyblok : `https://alto-collection.com/preview` (déjà OK).

Real path par story :
| Story | Real path |
|-------|-----------|
| `pages/home` | `/` |
| `pages/lyon` | `/lyon` |
| `pages/appartements` | `/appartements` |
| `pages/notre-histoire` | `/notre-histoire` |
| ... | ... |
| `globals/header` | `/` (le header est rendu partout, on preview sur home) |
| `globals/footer` | `/` |

Configuration auto via script `scripts/storyblok-configure-real-paths.ts`.

---

## Fallbacks

Stratégie :
- **Champs core** (hero title, CTA label, FAQ title) : marqués `required: true` côté schema. Si vide à l'édition Storyblok bloque la publication. Côté front, fallback silencieux vers `defaults.ts` (un fichier par page, contenant les textes actuels).
- **Bloks optionnels** (testimonials items, FAQ extra) : si vide, la section ne s'affiche pas (early return `null` côté React).
- **Assets** : si vide, fallback vers les images actuelles du dossier `public/images/`.

Un module unique `src/lib/storyblok-defaults.ts` centralise tous les fallbacks par page/section.

---

## Migration & cleanup

### À supprimer
- `src/lib/storyblok-site-images.ts` (après migration des assets vers stories de page) → Phase 11
- `src/lib/storyblok-apartment-editorial.ts` (sauf `getGlobalApartmentFaq` à conserver/migrer dans `src/lib/storyblok-globals.ts`) → Phase 8
- `src/components/storyblok/site-images-story.tsx`
- Tous les `*_COPY` consts dans les pages
- `src/app/(site)/about/page.tsx` → simple `redirect('/notre-histoire')`
- `scripts/seed-storyblok-site-images.ts`, `scripts/seed-storyblok-apartments.ts` (obsolètes)

### À créer
- `src/components/storyblok/bloks/` (dossier complet, 1 fichier par blok)
- `src/lib/storyblok-globals.ts` (header, footer, sticky-cta, shared-assets, shared-testimonials, apartment-faq)
- `src/lib/storyblok-page.ts` (helpers fetch page + render bloks)
- `src/lib/storyblok-defaults.ts` (fallbacks centralisés)
- `src/lib/storyblok-asset.ts` (helpers asset/link normalisation)
- `scripts/storyblok-schema.ts` (définition JSON de tous les composants)
- `scripts/storyblok-seed-all.ts` (orchestrateur : push schema + create stories vides si absentes, **jamais d'écrasement** du contenu existant)
- `scripts/storyblok-configure-real-paths.ts`
- Pages : `src/app/(site)/cgv/page.tsx`, `src/app/(site)/confidentialite/page.tsx`, `src/app/(site)/annulation/page.tsx`

### À conserver
- `src/lib/storyblok-blog.ts` (blog actuel)
- `src/lib/storyblok-preview.ts` (helpers token/version)
- `src/components/providers/storyblok-provider.tsx`
- `globals/apartment-faq` (contenu, schema enrichi)
- Toutes les `articles/*` (blog)
- `apartments/*` stories existantes (Léa a confirmé "ne rien écraser" — on les laisse, simplement plus consommées par le front)

### Safety net (non-écrasement)
Tous les scripts `seed-*` font :
1. `GET` du contenu existant
2. Si la story existe et a du contenu → **skip** (log "already exists, skipping")
3. Si absente → create avec contenu défaut (extrait des `*_COPY` actuels)
4. Schema components : `PUT` (update) toujours OK (schema = structure, pas contenu)

---

## Plan d'implémentation (14 commits)

```
Phase 0 — Setup (1 commit)
  feat(storyblok): setup bloks registry, helpers, preview rewrite
    - src/components/storyblok/bloks/ (atomes : link, cta_button, faq_item, ...)
    - src/lib/storyblok-page.ts, storyblok-asset.ts, storyblok-defaults.ts
    - src/lib/storyblok.ts : registry complet
    - src/app/preview/[[...slug]]/page.tsx : rendu live
    - scripts/storyblok-schema.ts : définitions JSON tous bloks
    - scripts/storyblok-seed-all.ts : orchestrateur
    - package.json : scripts storyblok:schema, storyblok:seed-all

Phase 1 — Globals (1 commit)
  feat(storyblok): bloks et stories globals (header, footer, sticky-cta, shared)
    - bloks header_global, footer_global, sticky_cta_global, shared_assets_global, shared_testimonials_global
    - storyblok-globals.ts
    - Header / Footer / StickyCta consomment les globals
    - faq_global schema enrichi

Phase 2 — Home (1 commit)
  feat(storyblok): page home composable
    - story pages/home (slug `/`)
    - bloks hero_section, image_text_section, panels_section, testimonials_section, services_section, blog_grid_section
    - src/app/page.tsx : fetch + StoryblokStory

Phase 3 — Lyon (1 commit)
  feat(storyblok): page lyon composable
    - story pages/lyon
    - bloks stats_section, quartiers_section, apartments_grid_section (mode lyon-3-cards), faq_section
    - src/app/(site)/lyon/page.tsx : fetch + render

Phase 4 — Notre-histoire (1 commit)
  feat(storyblok): page notre-histoire composable
    - story pages/notre-histoire
    - bloks about_reality_section, concept_section, guarantees_section, founders_section
    - src/app/(site)/notre-histoire/page.tsx : fetch + render
    - src/app/(site)/about/page.tsx : redirect

Phase 5 — Investir (1 commit)
  feat(storyblok): page investir composable
    - story pages/investir
    - bloks invest_model_section, invest_stats_section, cta_section
    - src/app/(site)/investir/page.tsx : fetch + render

Phase 6 — Contact (1 commit)
  feat(storyblok): page contact composable
    - story pages/contact
    - blok contact_form_section
    - src/app/(site)/contact/page.tsx : fetch + render

Phase 7 — Appartements index (1 commit)
  feat(storyblok): page appartements composable
    - story pages/appartements
    - apartments_grid_section mode complet + search
    - src/app/(site)/appartements/page.tsx : fetch + render

Phase 8 — Appartement detail simplification (1 commit)
  refactor(apartments): supprime apartment_editorial, full Guesty + globals
    - ApartmentView consomme uniquement Guesty + globals/apartment-faq + globals/shared-testimonials
    - lib/storyblok-apartment-editorial.ts supprimé
    - lib/storyblok-globals.ts : getGlobalApartmentFaq, getSharedTestimonials

Phase 9 — Blog index (1 commit)
  feat(storyblok): page blog index composable
    - story pages/blog
    - src/app/(site)/blog/page.tsx : fetch + render
    - /blog/[slug] INCHANGÉ

Phase 10 — Pages légales (1 commit)
  feat(storyblok): pages CGV, confidentialité, annulation
    - stories pages/cgv, pages/confidentialite, pages/annulation
    - blok rich_text_section
    - src/app/(site)/{cgv,confidentialite,annulation}/page.tsx

Phase 11 — Cleanup site-images (1 commit)
  refactor(storyblok): migrate site-images assets to per-page stories
    - lib/storyblok-site-images.ts supprimé
    - components/storyblok/site-images-story.tsx supprimé
    - shared-assets passe par globals/shared-assets
    - chaque page contient ses propres assets dans sa story

Phase 12 — i18n cleanup (1 commit)
  refactor(i18n): trim messages files to technical strings only
    - messages/fr.json, messages/en.json : ~20 clés max
    - suppression des *_COPY consts résiduels
    - useTranslations limité aux strings techniques

Phase 13 — Verify (1 commit)
  chore(storyblok): typecheck, lint, build, preview verification
    - bun run typecheck && bun run lint && bun run build OK
    - test manuel preview pour chaque URL
    - update README + .env.example si besoin
```

---

## Risques & mitigations

| Risque | Mitigation |
|--------|------------|
| Écrasement contenu Storyblok existant | Scripts seed font `skip` si story existe, log explicite |
| Visual Editor cassé pendant les phases intermédiaires | Le rendu legacy reste en fallback tant que la phase d'une page n'est pas finie |
| Bugs i18n (clés manquantes après cleanup) | Phase 12 en dernier, après que toutes les pages soient migrées et testées |
| `apartment_editorial` content cassé après Phase 8 | Léa a validé : Guesty source, FAQ + témoignages globaux suffisent |
| Build qui casse à mi-parcours | Chaque commit doit passer typecheck + lint (vérifié avant push) |
| Storyblok Management API rate limit | Scripts seed batch + sleep entre les calls |

---

## Décisions ouvertes (à confirmer avant Phase 0)

1. **`/about` → redirect `/notre-histoire`** : OK pour toi ? Si tu veux conserver `/about` comme page séparée, dis-moi (peut être une story identique ou un alias Storyblok).
2. **Pages légales** : tu as déjà du contenu CGV / Confidentialité ailleurs (Notion, docs juridiques) ou je crée des placeholders "[À remplir]" ?
3. **Sticky CTA** : on garde la même logique (visible après 80% de hauteur viewport) et juste l'enabled/threshold dans Storyblok, ou tu veux aussi pouvoir configurer son contenu (titre / CTA personnalisé par page) ?
4. **PR finale** : draft ou ready for review direct quand j'ai tout fini ?

Si je n'ai pas de blocage sur ces 4 points, je démarre Phase 0 dès que tu valides ce design.

---

## Validation

Réponds simplement :
- **"go"** → je commence Phase 0 immédiatement
- **"modif X"** → je révise et je te re-présente
- Réponses aux 4 points ouverts si tu en as
