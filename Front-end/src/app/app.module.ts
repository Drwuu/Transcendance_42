import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './modules/general/home/home.component';
import { NotFoundComponent } from './modules/general/not-found/not-found.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './modules/general/header/header.component';
import { FooterComponent } from './modules/general/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { FriendsComponent } from './modules/general/home/submodules/friends/friends.component';
import { ProfileComponent } from './modules/general/home/submodules/profile-card/profile.component';
import { ChatsComponent } from './modules/general/home/submodules/chats/chats.component';
import { ProfilePagesComponent } from './modules/general/profile-pages/profile-pages.component';
import { HistoryComponent } from './modules/general/home/submodules/history/history.component';
import { QRCodeModule } from 'angular2-qrcode';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConvoComponent } from './modules/general/home/submodules/convo/convo.component';
import { GameComponent } from './modules/general/game/game.component';
import { ChanListComponent } from './modules/general/home/submodules/chan-list/chan-list.component';
import { MatchmakingComponent } from './modules/general/matchmaking/matchmaking.component';
import { ProfileOtherComponent } from './modules/general/profile-other/profile-other.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotFoundComponent,
    HeaderComponent,
    FooterComponent,
    FriendsComponent,
    ProfileComponent,
    ChatsComponent,
    ProfilePagesComponent,
    HistoryComponent,
    ConvoComponent,
    GameComponent,
    ChanListComponent,
    MatchmakingComponent,
    ProfileOtherComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    QRCodeModule,
    NgbModule,
    NoopAnimationsModule,
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
