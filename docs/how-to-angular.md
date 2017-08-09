# How to Angular

Le projet est basé sur Webpack mais n'a pas été mis en place grâce à angular-cli. Cet outil était trop immature et instable quand la seed a été lancée. Même en v.1, l'outil ne permettait pas de customiser le build (ex. ajouter des loaders) et existait surtout pour contenter les habitués d'ember-cli et pour diminuer la frustration quant à la complexité du système de build et de la configuration.

Même si angular-cli évolue, il est possible qu'une installation custom à base de Webpack et d'npm scripts reste parfaitement justifiable.

En revanche, il existe un fichier `.angular-cli.json` à la racine pour pouvoir utiliser les commandes de scaffolding d'angular-cli (cf. section plus bas).

## Scaffolding

Cas pratique : créer un composant.

Dans la console, lancer la commande `yarn g component nom-du-composant`.
Le composant sera créé et référencé dans l'AppModule.

Petit inconvénient néanmoins, il faudra modifier légèrement le code généré pour qu'il corresponde au code-style en place. Aussi, l'on renommera le fichier .css du composant en .scss.

D'autres éléments sont disponibles :

| Scaffold                                                                    | Usage                               |
| --------------------------------------------------------------------------- | ----------------------------------- |
| [Component](https://github.com/angular/angular-cli/wiki/generate-component) | `yarn g component my-new-component` |
| [Directive](https://github.com/angular/angular-cli/wiki/generate-directive) | `yarn g directive my-new-directive` |
| [Pipe](https://github.com/angular/angular-cli/wiki/generate-pipe)           | `yarn g pipe my-new-pipe`           |
| [Service](https://github.com/angular/angular-cli/wiki/generate-service)     | `yarn g service my-new-service`     |
| [Class](https://github.com/angular/angular-cli/wiki/generate-class)         | `yarn g class my-new-class`         |
| [Guard](https://github.com/angular/angular-cli/wiki/generate-guard)         | `yarn g guard my-new-guard`         |
| [Interface](https://github.com/angular/angular-cli/wiki/generate-interface) | `yarn g interface my-new-interface` |
| [Enum](https://github.com/angular/angular-cli/wiki/generate-enum)           | `yarn g enum my-new-enum`           |
| [Module](https://github.com/angular/angular-cli/wiki/generate-module)       | `yarn g module my-module`           |

