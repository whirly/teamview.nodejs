import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

if (process.env.NODE_ENV === 'production') {
    enableProdMode();
}

export const platformRef = platformBrowserDynamic();

export function main() {
    // tslint:disable-next-line:no-console
    return platformRef.bootstrapModule(AppModule).catch(err => console.error(err));
}

switch (document.readyState) {
    case 'interactive':
    case 'complete':
        main();
        break;
    case 'loading':
    default:
        document.addEventListener('DOMContentLoaded', () => main());
}
