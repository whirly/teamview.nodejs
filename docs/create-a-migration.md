# Créer une migration

## 1) Créer une classe `IMigration`

(sans jeu de mot recherché)

Dans `server/migrations/`, créer un fichier de nom `xx_ma_nouvelle_migration.ts`, où `xx` est le numéro de la migration. 

Structure de base d'un tel fichier :

```typescript
export const name = 'create_base_users';

export async function migrate(): Promise<void> {
    // Implémenter le code de migration
}

export async function rollback(): Promise<void> {
    // Implémenter le code de rollback de cette migration
}
```

## 2) Enregistrer la migration

Dans `server/migrations/index.ts`, modifier l'export `Migrations` de cette façon :

```
import * Migration00MaNouvelleMigration from './00_ma_nouvelle_migration';

export const Migrations: IMigration[] = [
    MaNouvelleMigration
];
```

## 3) Tester/jouer la migration

Lancer `yarn cli db:migrate`. La méthode `migrate()` de la migration sera appelé, et en base de données, un marqueur sera ajouté pour signaler que cette migration a été appliquée.

Lancer `yarn cli db:rollback -n 1` pour exécuter la méthode `rollback()` et effacer ce marqueur.

Si vos méthodes sont bien implémentées, on peut ainsi rejouer à l'infini la migration.
