# Checklist des retours Mayeul et Benjamin

État au 12 juillet 2026.

## Terminé

- [x] Filtrer les logements avec le custom field Guesty `show_on_website`.
- [x] Appliquer le contrôle de visibilité aux listes, disponibilités, devis, moyens de paiement et réservations.
- [x] Masquer dans Guesty Fontaine du Temple 1 et 2, Impala, Bassinerie, Domaine Sologne et Bonneville.
- [x] Exclure les appartements parisiens du filtre Lyon, avec repli sur l’adresse lorsque le champ ville est absent.
- [x] Permettre une recherche par ville sans dates préremplies.
- [x] Supprimer la note statique `4,9 (113)` des cartes, de la vue carte et des pages appartement.
- [x] Préparer un bloc Storyblok traduisible pour la mention relative à la caution sur la page de réservation.
- [x] Permettre la consultation de toutes les photos Guesty lorsqu’un appartement en contient plus de cinq.
- [x] Afficher tous les appartements sur la page Lyon, sans limite arbitraire à trois.
- [x] Supprimer la hauteur vide imposée sous la vue liste des appartements.
- [x] Ramener automatiquement le nombre de voyageurs à la capacité du logement sélectionné.
- [x] Traduire le panneau de réservation, ses dates, ses messages et les champs Stripe en anglais.
- [x] Ajouter le contact par e-mail vers `contact@alto-collection.com`.
- [x] Afficher une disponibilité WhatsApp tous les jours de 8 h à 20 h dans le bloc de réservation et le contenu de repli du pied de page.
- [x] Rendre le changement FR ou EN accessible depuis le menu.

## Configuration à maintenir

- [ ] Ajouter le custom field `show_on_website` à chaque futur appartement Guesty et l’activer uniquement pour les logements publiés sur le site.
- [ ] Déployer le nouveau schéma Storyblok et créer la story `pages/booking` avec `bun run storyblok:seed-all`.
- [ ] Mettre à jour dans Storyblok le texte du pied de page existant vers « Disponible tous les jours de 8 h à 20 h ».

## Dépendances Guesty ou données métier

- [ ] Corriger le quartier de Constantine I et II, avec « Terreaux » comme libellé public sans détourner le champ ville Guesty.
- [ ] Corriger l’emplacement erroné d’un appartement sur la carte.
- [ ] Diagnostiquer la disponibilité annoncée puis refusée pour Constantine I.
- [ ] Vérifier si le compteur statique « 114 voyages » doit également être supprimé.

## Corrections restant à qualifier

- [ ] Reproduire le déplacement automatique du panneau de réservation lors de la modification des dates après défilement.
- [ ] Identifier précisément la page utilisant encore l’ancien design avant de la reprendre.
- [ ] Identifier précisément le layout signalé comme cassé et son viewport.
- [ ] Compléter la traduction anglaise du reste du site, hors parcours de réservation.
- [ ] Rendre le numéro WhatsApp éditable par l’équipe depuis Storyblok.
- [ ] Définir des options de mise en page contrôlées dans Storyblok. Le déplacement libre des textes et titres n’est pas retenu, car il fragiliserait le responsive.
