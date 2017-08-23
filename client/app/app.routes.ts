import { Routes } from '@angular/router';
import {TeamViewerComponent} from "./teamviewer-component/teamviewer-component";
import {PlayersViewerComponent} from "./playersviewer-component/playersviewer-component";
import {PlayerViewerComponent} from "./playerviewer-component/playerviewer-component";

export const APP_ROUTES: Routes = [
    {
        path: 'team/:name', component: TeamViewerComponent
    },
    {
        path: 'players', component: PlayersViewerComponent
    },
    {
        path: 'player/:id', component: PlayerViewerComponent
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
