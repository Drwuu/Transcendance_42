import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Data } from '../login/entities/Data.entities';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(
    public appService: AppService,
    public router: Router,
    ) {
      try {
        this.init_refresh();
        this.appService.socket_game.emit("refuse");
      } catch (error) {
      }
      this.data = this.appService.data;
      this.stop_reload = 0;
    }
  public list_friend: Data = new Data(false, 0, 0, 0, "", "", "", "", "", 0, 0);
  data: Data;
  listItems: Array<Data> = []
  listHystory: Array<any> = []
  stop_reload: number;
  show_profil='false';
  selec_normal="selected";
  selec_hard="";
  selec_random="selected";
  selec_friend="";
  diff_selected=1;
  map_selected=1;
  show_map=1;

  get_invited: boolean=false;
  invited_name="";

  go_spectate(id:number){
    this.appService.socket_game.emit("spectate", id);
  }

chose_map(side:number){
  if (side == -1){
    if (this.map_selected == 1)
        this.map_selected = 3;
    else
      this.map_selected--;
  }
  else{
    if (this.map_selected == 3)
        this.map_selected = 1;
    else
      this.map_selected++;
  }
  this.show_map = this.map_selected;
}

  select_dif(id: number)
  {
    if (id === 1)
    {
      this.diff_selected = id;
      this.selec_normal = "selected";
      this.selec_hard = "";
    }
    else if(id === 2)
    {
      this.diff_selected = id;
      this.selec_normal = "";
      this.selec_hard = "selected";
    }
  }

ngOnInit(): void {
  try {
    this.appService.set_game_state(true);
    this.appService.reinit_matchmaking();
    this.appService.socket_game.on("found", () => {this.found()});
    this.appService.socket_game.on("recvInvite", (payload: any) => {this.recv_invite(payload)});
  } catch (error) {
  }
}

found(){
    this.appService.socket_game.disconnect();
    this.appService.set_game_state(true);
    this.router.navigate(['/game']);
}

answer(rep:number){
    if (rep === 1)
      this.appService.socket_game.emit("accept");
    else if (rep === 2)
      this.appService.socket_game.emit("refuse");
    this.get_invited = false;
  }

recv_invite(login:string){
  this.invited_name = login;
  this.get_invited = true;
}

init_invite(obj: any){
  var game :any = {
    id: this.data.id,
    diff: this.diff_selected,
    map: this.map_selected,
    targetId: obj.id,
    login: this.appService.data.login
  }
  this.appService.socket_game.emit("invite", game);
}

  ngOnDestroy(): void{
    this.stop_reload = 1;
    if (this.get_invited === true){
      this.appService.socket_game.emit("refuse");
    }
  }

async init_refresh()
{

    if (this.appService.data.authStatus !== "Accepted"){
      this.router.navigate(['/login']);
      return;
    }


  this.getData();
  this.getFriendListe();
  this.getHistoryListe();
  this.data = this.appService.data;
  this.show_profil="true";
}

async GetDataFriend(LINK_API: string)
{
  while(true)
  {
    if (this.stop_reload === 1){
      break ;
    }
    this.listItems = await this.appService.postData(LINK_API + "/profile/get_friend_list", {});
    await this.appService.delay(5000);
  }
  return this.listItems;
}

async getData(){
	await this.appService.GetDataRefresh(this.appService.LINK_API);
}

async getFriendListe(){
  await this.GetDataFriend(this.appService.LINK_API);
}

async getHistoryListe(){
    this.listHystory = await this.appService.postData(this.appService.LINK_API + "/profile/match_history", {});
}

start_matchmaking(){
    var game :any = {
      id: this.data.id,
      diff: this.diff_selected,
      map : this.map_selected
    }
    this.appService.set_game(game);
    this.router.navigate(['/machtmaking']);
}

Send_msg_Friendlist(user: any){
  this.appService.socket.emit("openConv" , {targetId: user.id});
}

  dis:string="false";
  Remove_Friendlist(id: number){
    this.dis="true";
    this.appService.postData(this.appService.LINK_API + "/profile/remove_friend", {targetId: id});
  }

  go_profile(id:number){
    this.router.navigate(["/profile-other/" + id]);
  }
}
