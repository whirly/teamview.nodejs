import { Routes } from '@angular/router';
import {TeamViewerComponent} from "./teamviewer-component/teamviewer-component";
import {PlayersViewerComponent} from "./playersviewer-component/playersviewer-component";

export const APP_ROUTES: Routes = [
    {
        path: 'team/:name', component: TeamViewerComponent
    },
    {
        path: 'players', component: PlayersViewerComponent
    },
    {
        path: '',
        redirectTo: 'team/Strasbourg',
        pathMatch: 'full'
    },
    {
        path: 'team',
        redirectTo: 'team/Strasbourg',
        pathMatch: 'full'
    }
];
