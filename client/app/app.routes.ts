import { Routes } from '@angular/router';
import {PlayersViewerComponent} from "./playersviewer-component/playersviewer-component";
import {PlayerViewerComponent} from "./playerviewer-component/playerviewer-component";
import {MercatoAnalyserComponent} from "./mercato-analyser-component/mercato-analyser-component";

export const APP_ROUTES: Routes = [
    {
        path: 'mercato', component: MercatoAnalyserComponent, pathMatch: 'full'
    },
    {
        path: '', component: PlayersViewerComponent, pathMatch: 'full'
    },
    {
        path: 'player/:id', component: PlayerViewerComponent
    }
];
