import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './modules/general/login/login.component';
import { NotFoundComponent } from './modules/general/not-found/not-found.component';
import { HomeComponent } from './modules/general/home/home.component';
import { ProfilePagesComponent } from './modules/general/profile-pages/profile-pages.component';
import { GameComponent } from './modules/general/game/game.component';
import { MatchmakingComponent } from './modules/general/matchmaking/matchmaking.component';
import { ProfileOtherComponent } from './modules/general/profile-other/profile-other.component';

const routes: Routes = [
  { path: '', component: LoginComponent, },
  {
    path: 'login',
    loadChildren: () => import('./modules/general/login/login.module')
      .then(mod => mod.LoginModule)
  },
  {
    path: 'home', component: HomeComponent
  },
  {
    path: 'profile', component: ProfilePagesComponent
  },
  {
    path: 'profile-other/:id', component: ProfileOtherComponent
  },
  {
    path: 'game', component: GameComponent
  },
  {
    path: 'machtmaking', component: MatchmakingComponent
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
