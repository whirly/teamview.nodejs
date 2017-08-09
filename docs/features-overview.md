# Aperçu des fonctionnalités

## Webpack / TypeScript

La compilation est basée sur Webpack, et le build est découpé en quatre bundles :

 - Client
    - `main` : Application avec ses dépendances tierces ;
    - `polyfills` : Polyfills pour ES 6/7, etc.
 - Serveur
    - `main` : Point d'entrée du serveur Express ;
    - `cli` : Point d'entrée d'une application CLI yargs contenant des utilitaires.

webpack-dev-{middleware, server} n'étant pas assez extensibles et hackables pour le moment, on a du séparer le serveur du client, qui en dév est géré par une instance d'un webpack-dev-server.

Cela signifie que le serveur et le client n'utilisent pas le même port en mode dév, le client étant par défaut sur http://localhost:3000 et le serveur sur http://localhost:3001.

## Angular

La structure minimale d'un projet Angular est disponible dans client/.

Aucun framework front-end de design et layout n'a été installé, pour laisser l'utilisateur choisir ce qui est adapté en fonction du projet (angular-material, bootstrap, etc).

## Application CLI

Une application CLI est également disponible, dont le point d'entrée est dans server/cli/.

Elle possède déjà deux commandes très pratiques, et servant également d'exemple de structure :

  - `yarn cli db:migrate` Pour appliquer des migrations ;
  - `yarn cli db:rollback` Pour annuler des migrations appliquées.

Pour accéder à la documentation, on saisira `yarn cli help` pour l'aide globale et `yarn cli help <command name>` pour... on vous laisse deviner.

## Serveur Express

Le serveur s'est vu donner quelques fonctionnalités utiles et/ou généralement retrouvables dans toute application :

  - Logging (winston) + logging des requêtes HTTP (morgan) + logging des requêtes MongoDB (debug) ;
  - Distribution de l'app Angular compilée "en dur" (`yarn build`), avec compression gzip "ahead of time" grâce à Webpack ;
  - Authentification JWT avec quelques middlewares d'authentification côté HTTP et GraphQL ;
  - Une base d'API GraphQL facilement extensible (autant que possible vu l'état de l'art en GraphQL début 2017).
