import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {HttpClientModule} from "@angular/common/http";

import { NgReduxModule } from '@angular-redux/store';
import { NgReduxRouterModule } from '@angular-redux/router';

import { ApolloModule } from 'apollo-angular';
import { SuiModule } from 'ng2-semantic-ui';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app.routes';
import { ApolloInitializer } from './apollo-client';

import { TeamSelectorComponent } from './team-selector-component/team-selector-component';
import {TeamService} from "./services/team.service";
import {PlayersViewerComponent} from "./playersviewer-component/playersviewer-component";
import {PlayerService} from "./services/player.service";
import {PlayerViewerComponent} from "./playerviewer-component/playerviewer-component";
import {ChartistModule} from "ng-chartist";
import {PelouseService} from "./services/pelouse.service";
import {HttpLinkModule} from "apollo-angular-link-http";

@NgModule({
    declarations: [
        // Les miens
        AppComponent,
        PlayerViewerComponent,
        PlayersViewerComponent,
        TeamSelectorComponent
    ],
    imports: [
        //=> Angular official modules
        BrowserModule,
        RouterModule.forRoot(APP_ROUTES),
        FormsModule, HttpClientModule,

        //=> Third-party modules
        NgReduxModule, NgReduxRouterModule, HttpLinkModule,
        ApolloModule,
        SuiModule,
        ChartistModule
    ],
    providers: [TeamService, PlayerService, PelouseService, ApolloInitializer],
    bootstrap: [AppComponent]
})

export class AppModule {
    constructor(
        apollo: ApolloInitializer
    ) {
        apollo.init();
    }
}
