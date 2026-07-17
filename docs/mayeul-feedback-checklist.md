# Checklist des retours Mayeul et Benjamin

État au 12 juillet 2026.

## Terminé

- [x] Filtrer les logements avec le custom field Guesty `show_on_website`.
- [x] Appliquer le contrôle de visibilité aux listes, disponibilités, devis, moyens de paiement et réservations.
- [x] Masquer dans Guesty Fontaine du Temple 1 et 2, Impala, Bassinerie, Domaine Sologne et Bonneville.
- [x] Exclure les appartements parisiens du filtre Lyon, avec repli sur l’adresse lorsque le champ ville est absent.
- [x] Permettre une recherche par ville sans dates préremplies.
- [x] Mettre à jour les résultats immédiatement lors du changement Paris ou Lyon, sans nouveau clic sur « Rechercher ».
- [x] Filtrer et actualiser immédiatement les appartements selon le nombre de voyageurs demandé.
- [x] Supprimer la note statique `4,9 (113)` des cartes, de la vue carte et des pages appartement.
- [x] Préparer un bloc Storyblok traduisible pour la mention relative à la caution sur la page de réservation.
- [x] Permettre la consultation de toutes les photos Guesty lorsqu’un appartement en contient plus de cinq.
- [x] Supprimer la page éditoriale Lyon, rediriger son ancienne URL et conserver l’accès aux appartements via le filtre Lyon.
- [x] Supprimer la hauteur vide imposée sous la vue liste des appartements.
- [x] Ramener automatiquement le nombre de voyageurs à la capacité du logement sélectionné.
- [x] Traduire le panneau de réservation, ses dates, ses messages et les champs Stripe en anglais.
- [x] Synchroniser la barre de recherche desktop et mobile avec la langue choisie par le serveur ou le visiteur.
- [x] Ajouter le contact par e-mail vers `contact@alto-collection.com`.
- [x] Afficher une disponibilité WhatsApp tous les jours de 8 h à 20 h dans le bloc de réservation et le contenu de repli du pied de page.
- [x] Rendre le changement FR ou EN accessible depuis le menu.
- [x] Déployer le schéma Storyblok et publier la story `pages/booking` avec la mention caution.
- [x] Mettre à jour dans Storyblok le pied de page vers « Disponible tous les jours de 8 h à 20 h ».
- [x] Rendre le lien et le numéro WhatsApp éditables depuis le CTA du footer Storyblok.
- [x] Corriger Constantine I, Constantine II et Constantine I et II avec le quartier public « Terreaux ».
- [x] Corriger sur le site les coordonnées de Terreaux IV pour les aligner sur les autres logements du 21 Rue d’Algérie.
- [x] Corriger la fausse disponibilité de Constantine I en appliquant le minimum de nuits dynamique du calendrier Guesty.
- [x] Supprimer le compteur statique « 114 voyages » des fiches appartement.
- [x] Empêcher le calendrier de faire remonter le panneau de réservation sticky lors de son ouverture.
- [x] Vérifier le design et le layout de l’accueil en desktop 1440 × 900 et mobile 390 × 844.
- [x] Synchroniser la locale du rendu serveur avec le cookie FR ou EN.
- [x] Compléter les chaînes anglaises des pages, fiches, cartes, blocs Lyon, navigation et footer.
- [x] Utiliser les contenus anglais maintenus dans le code lorsque les traductions Storyblok EN ne sont pas renseignées.
- [x] Proposer uniquement des options de mise en page contrôlées dans Storyblok : alignement, largeur, hauteur et position d’image.

## Configuration à maintenir

- [ ] Ajouter le custom field `show_on_website` à chaque futur appartement Guesty et l’activer uniquement pour les logements publiés sur le site.
- [ ] Corriger également les coordonnées de Terreaux IV dans Guesty lorsque la limitation OAuth de l’Open API sera levée. Le site applique déjà les coordonnées correctes.

## Contrôles effectués

- [x] Constantine I du 13 au 17 octobre 2026 : disponible, minimum dynamique de 3 nuits respecté.
- [x] Constantine I du 19 au 20 novembre 2026 : une nuit refusée avec un minimum dynamique de 2 nuits affiché avant le devis.
- [x] Ouverture du calendrier après défilement : `scrollY` inchangé et panneau maintenu à 112 px du haut.
- [x] Version anglaise de l’accueil : absence de chaînes françaises résiduelles dans les composants contrôlés.
- [x] Version anglaise de Constantine I : navigation, réservation, FAQ, éditorial, recommandations et footer traduits.
