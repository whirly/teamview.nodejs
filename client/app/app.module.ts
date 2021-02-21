import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {HttpClient, HttpClientModule} from "@angular/common/http";

import {APOLLO_OPTIONS} from 'apollo-angular';
import { SuiModule } from 'ng2-semantic-ui';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app.routes';

import { TeamSelectorComponent } from './team-selector-component/team-selector-component';
import { TeamService } from "./services/team.service";
import { PlayersViewerComponent } from "./playersviewer-component/playersviewer-component";
import { PlayerService } from "./services/player.service";
import { PlayerViewerComponent } from "./playerviewer-component/playerviewer-component";
import { PelouseService } from "./services/pelouse.service";
import { MercatoAnalyserComponent } from "./mercato-analyser-component/mercato-analyser-component";
import { AboutComponent } from "./about-component/about-component";
import {ApolloLink} from "@apollo/client/core";
import {provideApolloClientOptions, provideApolloLink} from "./apollo";

@NgModule({
    declarations: [
        // Les miens
        AppComponent,
        PlayerViewerComponent,
        PlayersViewerComponent,
        TeamSelectorComponent,
        MercatoAnalyserComponent,
        AboutComponent
    ],
    imports: [
        //=> Angular official modules
        BrowserModule,
        RouterModule.forRoot(APP_ROUTES),
        FormsModule, HttpClientModule,

        //=> Third-party modules
        SuiModule
    ],
    providers: [TeamService, PlayerService, PelouseService,
        {
            provide: ApolloLink,
            useFactory: provideApolloLink,
            deps: [HttpClient]
        },
        {
            provide: APOLLO_OPTIONS,
            useFactory: provideApolloClientOptions,
            deps: [ApolloLink],
        },
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
}
