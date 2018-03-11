import { Routes } from '@angular/router';
import {PlayersViewerComponent} from "./playersviewer-component/playersviewer-component";
import {PlayerViewerComponent} from "./playerviewer-component/playerviewer-component";
import {MercatoAnalyserComponent} from "./mercato-analyser-component/mercato-analyser-component";
import {AboutComponent} from "./about-component/about-component";

export const APP_ROUTES: Routes = [
    {
        path: '', redirectTo: '/players', pathMatch: 'full'
    },
    {
        path: 'mercato', component: MercatoAnalyserComponent, pathMatch: 'full'
    },
    {
        path: 'players', component: PlayersViewerComponent, pathMatch: 'full'
    },
    {
        path: 'player/:id', component: PlayerViewerComponent
    },
    {
        path: 'about', component: AboutComponent
    }
];
