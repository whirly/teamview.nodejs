# How to graphql

## Notes

Le serveur d'exemple comprend une API GraphQL,  un standard créé par Facebook pour créer des APIs faciles à faire évoluer, auto-documentées et donnant plus de contrôle au client.

### Recherche préalable

Il a été choisi d'utiliser [graphql-compose](https://github.com/nodkz/graphql-compose) pour composer facilement l'API (le faire entièrement à la main est plutôt fastidieux), et [graphql-compose-mongoose](https://github.com/nodkz/graphql-compose-mongoose) est utilisé pour auto-générer le schéma et l'API GraphQL à partir des schémas Mongoose.

La piste [https://github.com/RisingStack/graffiti-mongoose](graffiti-mongoose) a été également explorée, mais abandonnée car, bien que cette librairie génère un excellent schéma GraphQL, elle n'est ni très générique (contrairement à graphql-compose), ni extensible ou configurable.

Pour servir l'API elle-même sur HTTP, [graphql-server](https://github.com/apollographql/graphql-server) d'Apollo est utilisé. Il a l'avantage d'être un peu plus complet que l'implémentation de référence de Facebook, et est écrit en TypeScript.

## Utilisation générale

### Comment requêter l'API pour la tester ?

N'importe quel client GraphQL générique peut faire l'affaire, mais il faudra que celui-ci supporte la modification des headers HTTP envoyés à l'API si l'on veut tester l'API en tant qu'utilisateur inscrit. Autrement, l'API est ouverte aux utilisateurs anonymes également.

Le plus simple (à la date de rédaction), est d'utiliser l'intégration dans l'application de GraphiQL, le client web officiel.

Il est accessible à l'adresse http://localhost:3001/graphiql. Si vous n'avez jamais utilisé GraphiQL ou simplement GraphQL, vous verrez que vous pouvez avoir accès à la documentation "introspectée" de l'API et l’auto-complétion.

### Comment requêter l'API depuis l'application Angular ?

Ici, on utilisera encore la stack Apollo avec [apollo-angular](https://github.com/apollographql/apollo-angular).

Pour parser les requêtes, on utilisera [graphql-tag](https://github.com/apollographql/graphql-tag) qui fournit un tag de parsage des requêtes GraphQL pour les littéraux de gabarit, ainsi qu'un loader Webpack pour pré-compiler les requêtes.

## Authentification à l'API

Pour s'authentifier à l'API en tant qu'utilisateur enregistré, il existe deux méthodes :

### Sur l'outil graphique GraphiQL

À la date de rédaction, [GraphiQL ne supporte pas nativement l'authentification par HTTP](https://github.com/graphql/graphiql/issues/59), mais grâce à [un hack dans l'intégration Apollo](https://github.com/apollographql/graphql-server/pull/133), cette limitation a été (sauvagement) contournée. Il est probable que dans le futur, l'outil supporte l'authentification par HTTP, auquel cas l'on supprimera le hack présent dans ce projet (celui lisant le token depuis le localStorage, pas les mutations de login...).

1) Ouvrir GraphiQL à l'adresse http://localhost:3001/graphiql

2) Entrer la requête suivante et récupérer le token dans la réponse :

```
mutation {
  loginWithPassword(email: "admin@admin.com", password: "admin") { token }
}
```

3) Ouvrir la console JavaScript du navigateur, et y entrer :

```js
localStorage.jwt = "TOKEN_JWT_ICI";
```

### Via GraphQL

Cette méthode est utile si on ne veut pas récupérer le token depuis l'API HTTP (cf. plus bas, /auth/local). Cela permet de n'avoir côté client qu'une seule implémentation pour l'accès à l'API.

Pour s'authentifier la première fois, on utilisera la mutation **`loginWithPassword()`** :

```
mutation {
  loginWithPassword(email: "admin@admin.com", password: "admin") { token }
}
```

On récupère le token, puis ensuite l'on pourra lancer de nouvelles requêtes à l'API avec **`loginWithToken()`** :

```
mutation {
  loginWithToken(token: "...") { user { email } }
  removeUserById(_id: "...") { recordId }
  etc()
}
```

Le login via token est infiniment plus rapide que la vérification du hash bcrypt du mot de passe de l'utilisateur, déclenchée par `loginWithPassword()`.

Cela dit, `loginWithToken()` a l'inconvénient d'être une mutation. Cela signifie que les queries ne peuvent être authentifiées de cette manière. En réalité, il serait plutôt recommandé de s'authentifier en GraphQL de la manière suivante :

1) Requête anonyme avec `loginWithPassword()`, récupération du token
2) Utilisation du header `Authorization` comme expliqué plus bas dans la partie HTTP.

### Via HTTP

1) On récupère un token JWT :

```
POST /auth/local
Content-Type: application/json

{
    "email": "admin@admin.com",
    "password": "admin"
}
```

2) Puis commencer à requêter l'API en injectant le token dans le header Authorization :

```
POST /graphql
Authorization: Bearer JWT_TOKEN_ICI
Content-Type: application/json

{
	"query": "query { ... }"
}
```

## Créer des mutations et des queries

Il suffira de s'inspirer de ce qui a été fait avec les modèles User et UserRole.

Il faudra rester dans le dossier `/server/graphql` pour la logique GraphQL (excepté ce qui se rapporte à l'authentification).

### Restreindre des mutations/queries à certains rôles/permissions

GraphQL ne proposant rien à propos de l'authentification, il a été choisi de fournir quelques fonctions utilitaires d'authentification qui vont wrapper les resolvers.

Ces fonctions sont trouvables dans le module `/server/auth/graphql-resolver-wrappers.ts`, et s'utilisent, par exemple, de cette manière :

```ts
import { requireUser, requirePermission } from '../auth/graphql-resolver-wrappers';

export const MUTATIONS = {
    createUser: type.get('$createOne'),
    ...requireUser({
        updateUser: type.get('$updateById'),
    }),
    ...requirePermission('manage-users', {
        removeUserById: type.get('$removeById'),
        grantUserById: type.get('$grantUserById'),
    }),
};
```

Il existe d'autres fonctions de ce type dans le module, documentées avec un header JSDoc.
