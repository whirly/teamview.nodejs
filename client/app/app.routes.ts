import { Routes } from '@angular/router';
import {TeamViewerComponent} from "./teamviewer-component/teamviewer-component";

export const APP_ROUTES: Routes = [
    {
        path: 'team/:name', component: TeamViewerComponent
    },
    {
        path: '',
        redirectTo: 'team/Strasbourg',
        pathMatch: 'full'
    }
];
