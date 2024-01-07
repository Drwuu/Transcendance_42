import { Injectable } from '@angular/core';
import { Data } from './modules/general/login/entities/Data.entities';
import { io } from 'socket.io-client';
import { ListeConvo } from './modules/general/footer/class/Chat.entities';

@Injectable({
  providedIn: 'root',
})
export class AppService {

  public data: Data = new Data(false, 0, 0, 0, "", "", "", "", "", 0, 0);
  constructor() {
  }
  res: any;
  LINK_API="/back";
  // LINK_API="https://localhost:3000";

  avatar_date: any = Date.now();
  socket: any;
  socket_game: any = undefined;

  async postData(url = '', data = {}){
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        "Content-type": "application/json"
      }
    });
    const res = await response.json();
    return res;
  }

  start_game:boolean=false;

  set_game_state(bool:boolean){
    this.start_game = bool;
  }

  get_game_state():boolean{
    return this.start_game;
  }

  init_footer=0;
  end_game:boolean = false;
  reinit_matchmaking(){
    if(this.end_game === true) {
      if (!this.socket_game) {
        this.socket_game = io(this.LINK_API + "/matchmaking", { withCredentials: true });
      } else if (this.socket_game.disconnected) {
        this.socket_game.connect();
      }
	}
    this.end_game = false;
    this.set_game_state(true);
  }

  get_footer():number{
    return this.init_footer;
  }
  set_footer(){
    this.init_footer++;
  }

  set_endGame(){
    this.end_game = true;
  }

  init_socket(){
    this.socket = io(this.LINK_API + "/chat", { withCredentials: true });
    if (!this.socket_game) {
      console.debug("IO init_socket 0");
      this.socket_game = io(this.LINK_API + "/matchmaking", { withCredentials: true });
    } else if (this.socket_game.disconnected) {
      console.debug("IO init_socket 1");
      this.socket_game.connect();
    }
  }

  add_friend(id:number){
    try {
      this.postData(this.LINK_API + "/profile/add_friend", {targetId: id});
    } catch (error) {
      console.warn("Error from fetch in app.service : add_friend");
    }
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async GetData(LINK_API: string)
  {
    while(true)
    {
      await this.delay(2000);
      try {
        this.data = await this.postData(LINK_API + "/login/is_auth", {});
      } catch (error) {
        console.warn("Error from fetch in app.service : Get_data");
      }
      if (this.data.authStatus === "Refused" || this.data.authStatus === "Accepted" || this.data.authStatus === "WaitingFor2FA"){
        break;
      }
    }
    // this.data.loose = 0;
    // this.data.win = 10;
    // this.data.rank = "beginer";
    // this.data.level = 5;
  }

  async GetDataRefresh(LINK_API: string)
  {
    try {
      this.data = await this.postData(LINK_API + "/login/is_auth", {});
    } catch (error) {
      console.warn("Error from fetch in app.service : GetDataRefresh");
    }

  }


  game: any;

  set_game(game :any){
    this.game = game
  }

  get_game(): any{
    return this.game;
  }

  convo_id=0;
  list_id=0;
  ListConvo: Array<ListeConvo> = [{
    name:"P_World_General",
    roomId: -10,
    type:"",
    key:"",
    tabmsg: []
  }];
  list_to_join: Array<ListeConvo> = [];
  get_service():any{
    let obj: any =[{
      LC_id:this.convo_id,
      Ltj_id:this.list_id,
      LC:this.ListConvo,
      LtJ:this.list_to_join
    }]
    return obj;
  }

  set_service(LC:Array<ListeConvo> , LtJ:Array<ListeConvo>, conv_id:number, list_id:number){
    this.convo_id = conv_id;
    this.list_id = list_id;
    this.ListConvo = LC;
    this.list_to_join = LtJ;
  }

}
