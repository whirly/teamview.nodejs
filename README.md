# TeamView

Teamview est une petite application dont l'objectif est de permettre de naviguer plus facilement dans les informations du jeu "mon petit gazon".

A force de devoir faire des mercatos qui se tranformaient en championnat du monde de click pour se faire une idée si un joueur était titulaire, s'il tirait les penaltys ou encore s'il avait une bonne moyenne à domicile, j'en suis venu à me dire qu'il y avait plus simple.

Ca c'est la solution plus simple.


# Déploiement

Le site est actuellement déployé sur [son site](https://www.mespetitesstats.com), mais si cela vous tente vous pouvez facilement le déployer sur un PaaS (si vous lisez ceci on part du principe que vous savez).

Le logiciel utilise node.js pour le back end et angular 2 pour le front. Il utilise aussi abondamment GraphQL en place de l'API rest. C'était en effet l'occasion pour moi de tester ce genre de technogolie.

Pour initialiser la base de données vous devez faire un
```
  yarn cli db:sync
```

Cette commande s'occupera de récupérer les informations sur le site de MPG pour abreuver la base et éviter que l'on bourrine comme des sacs leur API.  
