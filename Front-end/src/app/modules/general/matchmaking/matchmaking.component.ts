import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { io } from 'socket.io-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-matchmaking',
  templateUrl: './matchmaking.component.html',
  styleUrls: ['./matchmaking.component.scss']
})
export class MatchmakingComponent implements OnInit {

  constructor(public appService: AppService,public router: Router) {}

  game :any = [
  {
    id: 0,
    map: "",
    diff: 0,
  }]

  end_game(){
	  this.appService.set_endGame();
    try {
      this.appService.socket_game.disconnect(true);
    } catch (error) {
      console.log("Your are not connected.");
    }
	  this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    if (this.appService.start_game !== true){
      this.router.navigate(['/home']);
      return ;
    }
    try {
      this.init_refresh();
      this.game = this.appService.get_game();
		  this.appService.socket_game.on("disconnectInMatchmaking", () => {this.end_game()});
    	this.appService.socket_game.on("found", () => {this.found()});
    	this.appService.socket_game.emit("search", this.game);
	 } catch (error) {
     console.warn(`matchmaking.component.ts::ngOnInit: ${error}`);
	 }
  }

  ngOnDestroy(): void{
    this.appService.end_game = false;
  }

  Process_cancel(){
    this.appService.socket_game.emit("cancel", this.game);
    this.router.navigate(['/home']);
  }

  found(){
    this.appService.socket_game.disconnect(true);
    this.router.navigate(['/game'], {replaceUrl: true});
  }

  async init_refresh()
  {
    if (this.appService.data.authStatus !== "Accepted"){
      await this.appService.GetDataRefresh(this.appService.LINK_API);
      if (this.appService.data.authStatus !== "Accepted"){
        this.router.navigate(['/login']);
        return;
      }
    }
  }
}
