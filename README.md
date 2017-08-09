# ng-express-base

Une seed pour un serveur Express, avec une API GraphQL et un front Angular2. TypeScript partout, Justine nulle part.

## Création d'un nouveau projet

La méthode recommandée est de créer un nouveau dépôt Git non pas vide mais en important le dépôt de la seed via une remote Git. Cela permettra éventuellement de merger des modifications de ce projet vers ses fils, en plus de garder la précieuse historique Git de ce repo. Voici les instructions :

 1. Créer le dépot git du projet en faisant **Import project from > Repo by URL**.
 2. **Cloner** le dépôt du projet en local
 3. Initialiser **git-flow** (GitKraken supporte également nativement GitFlow).
 4. Remplacer les occurences de `projname` par le `nom-du-projet` (effectuer un *"find in path"* à la racine).
 5. Mettre à jour le **README** : enlever cet encart et mettre le nom et la description du projet à la place. Lire la dernière instruction avant de l'enlever (ce serait bête).
 6. C'est bon, tu peux attaquer le développement sur **develop**.

## Requis

  - Node v.7+, yarn.
  - Une base MongoDB en local.

## Installation en local

Une fois le dépot git cloné, on exécutera à la racine du projet :

 - `yarn install`
 - `yarn cli db:migrate` Préremplit la base de données, en exécutant toutes les migrations.

Puis, ouvrir deux terminaux, lancer respectivement :

 - `yarn watch` Lance un webpack-dev-server pour le front Angular, et un webpack pour la compilation du serveur ;
 - `yarn nodemon-server` Lance le serveur avec relance automatique quand le build est modifié.

 Enfin, ouvrir le client sur http://localhost:3000.

## Déployer sur Scalingo

1. Demander à Stéphane de créer les noeuds Scalingo `nom-du-projet-staging` et, dès que c'est nécessaire, `nom-du-projet-production`. Il faut éviter de payer un noeud inutilisé.

2. Sur [Scalingo](https://my.scalingo.com/), pour chaque noeud, ajouter les variables (onglet *Environment*) et **penser à changer le secret !** :
```
NODE_ENV=production
SERVER_PORT=$PORT
SERVER_URL=/
SERVER_SECRET=correcthorsebatterystaple
NPM_CONFIG_PRODUCTION=false
```

3. Sur le dépot git en local, ajouter les remotes **en changeant le nom du projet** :
```
git remote add scalingo-staging git@scalingo.com:nom-du-projet-staging.git
git remote add scalingo-production git@scalingo.com:nom-du-projet-production.git
```

4. Pour lancer une nouvelle build, push sur les branches :
```
yarn deploy-staging
yarn deploy-production
```
5. Redimensionner les Containers sur [my.scalingo.com](https://my.scalingo.com/). Un conteneur S peut suffire pour du staging, et en production, il faut penser à prendre le premier tier payant pour les add-ons de base de données pour bénéficier des sauvegardes.

**Notes** :
 - En temps normal, seule l'étape 4 est nécessaire pour lancer une build.
 - `NPM_CONFIG_PRODUCTION=false` est nécessaire pour que scalingo installe les dépendances requises pour construire la build.

### Initialiser la base de données : une fois seulement !
1. Pour créer la base de données : installer [scalingo-cli](http://cli.scalingo.com/) et lancer la commande :
```
scalingo db-tunnel -a proclip-staging SCALINGO_MONGO_URL
```

2. Sur [Scalingo](https://my.scalingo.com/), aller dans *Add-on*, *Dashboard MongoDB*, *User* et créer un utilisateur.

3. Dans une autre console, lancer les commandes suivante en **remplaçant** le nom d'utilisateur, le mot de passe et l'identifiant de base de données (disponible dans Environment et dans le Dashboard MongoDB) :
```
cd "C:\\Dossier\\Du\\Projet"
set MONGO_URL=mongodb://LOGIN:PASSWORD@localhost:10000/BDD-ID-1337
yarn cli db:seed
```

## Autres guides

 - [Aperçu des fonctionnalités](docs/features-overview.md)
 - [Créer une migration](docs/create-a-migration.md)
 - [How to GraphQL](docs/how-to-graphql.md)

### API GraphQL

Le serveur comprend une base d'API GraphQL avec authentification. Voir le guide [How to GraphQL](docs/how-to-graphql.md).
