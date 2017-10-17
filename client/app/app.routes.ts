import { Routes } from '@angular/router';
import {PlayersViewerComponent} from "./playersviewer-component/playersviewer-component";
import {PlayerViewerComponent} from "./playerviewer-component/playerviewer-component";

export const APP_ROUTES: Routes = [
    {
        path: '', component: PlayersViewerComponent, pathMatch: 'full'
    },
    {
        path: 'player/:id', component: PlayerViewerComponent
    }
];
