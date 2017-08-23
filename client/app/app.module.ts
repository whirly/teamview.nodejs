import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { Middleware, combineReducers, applyMiddleware } from 'redux';
import { NgReduxModule, DevToolsExtension, NgRedux } from '@angular-redux/store';
import { NgReduxRouterModule, NgReduxRouter, routerReducer } from '@angular-redux/router';

import { ApolloClient } from 'apollo-client';
import { ApolloModule } from 'apollo-angular';

import { SuiModule } from 'ng2-semantic-ui';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app.routes';
import apolloClient from './apollo-client';

import { TeamViewerComponent } from './teamviewer-component/teamviewer-component';
import { TeamSelectorComponent } from './team-selector-component/team-selector-component';
import {TeamService} from "./services/team.service";
import {PlayersViewerComponent} from "./playersviewer-component/playersviewer-component";
import {PlayerService} from "./services/player.service";
import {PlayerViewerComponent} from "./playerviewer-component/playerviewer-component";

export function provideApolloClient(): ApolloClient {
    return apolloClient;
}

@NgModule({
    declarations: [
        AppComponent,
        TeamViewerComponent,
        PlayerViewerComponent,
        PlayersViewerComponent,
        TeamSelectorComponent
    ],
    imports: [
        //=> Angular official modules
        BrowserModule,
        RouterModule.forRoot(APP_ROUTES),

        //=> Third-party modules
        NgReduxModule, NgReduxRouterModule,
        ApolloModule.forRoot(provideApolloClient),
        SuiModule
    ],
    providers: [TeamService, PlayerService],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(ngRedux: NgRedux<any>,
                ngReduxRouter: NgReduxRouter,
                devTools: DevToolsExtension) {

        const rootReducer = combineReducers({
            router: routerReducer,
            apollo: apolloClient.reducer() as any
        });

        const enhancers = [applyMiddleware(apolloClient.middleware())];

        if (devTools.isEnabled()) {
            enhancers.push(devTools.enhancer());
        }

        const epicMiddlewares: Middleware[] = [];

        ngRedux.configureStore(rootReducer, {}, epicMiddlewares, enhancers);

        ngReduxRouter.initialize();
    }
}
