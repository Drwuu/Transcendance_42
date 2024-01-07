import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { ListeConvo, TabMsg } from './class/Chat.entities';
import { Router} from '@angular/router';
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  providers: [NgbDropdownConfig]
})
export class FooterComponent implements OnInit, OnDestroy {

  constructor(public router: Router,
    public appService: AppService,
    config: NgbDropdownConfig)
    {
      config.placement = 'top-start';
      config.autoClose = false;
    }

    msg_to_send="";
    name_room="";
    ask_pswd='false';
    type="public";
    ask_pass="no";
    key_room="";
    convo_id=0;
    list_id=0;
    show_btn_list='true';
    name_room_private="";
    not_exist="false";

  Convo: any;

  convMap: Map<number, any> = new Map<number, any>();
  listMap: Map<number, any> = new Map<number, any>();
  ListConvo: Array<ListeConvo> = [
    {
      name:"P_World_General",
      roomId: -10,
      type:"",
      key:"",
      tabmsg: []
    }
  ];

  list_to_join: Array<ListeConvo> = []
  zbla="true";
  ngOnInit(): void {
    this.appService.set_game_state(false);
      if(this.appService.get_footer() !== 0)
        this.reinit_var();
      this.Convo = this.ListConvo[0];
      try {
        this.init_refresh();
        this.appService.set_game_state(true);
        this.appService.socket.on("disconnect", () => {this.zbla = "false";})
        this.appService.socket.on("message", (payload: any) => {this.recv_msg(payload)});
        this.appService.socket.on("newRoom", (payload: any) => {this.new_room(payload)});
        this.appService.socket.on("roomJoined", (payload: any) => {this.joined_room(payload)});
        this.appService.socket.on("joinRoomError", (payload: any) => {this.check_error(payload)});
        this.appService.socket.on("roomLeaved", (payload: any) => {this.leaved_room(payload)});
        this.appService.socket.on("messageError", (payload: any) => {this.RoomError(payload)});
        this.appService.socket.on("roomError", (payload: any) => {this.RoomError(payload)});
        this.appService.socket.on("roomDeleted", (payload: any) => {this.roomDeleted(payload)});
        this.appService.socket.on("inviteGame", (payload: any) => {this.inviteGame(payload)});
      } catch (error) {
      }
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
      try {
        this.appService.socket.emit("reattach");
      } catch (error) {
      }
    }

    ngOnDestroy(): void{
      this.appService.set_service(this.ListConvo, this.list_to_join, this.convo_id, this.list_id);
    }

    reinit_var(){
      let obj = this.appService.get_service();
      obj.LC_id = this.convo_id;
      obj.Ltj_id = this.list_id;
      obj.LC = this.ListConvo;
      obj.LtJ = this.list_to_join;
    }


    inviteGame(ret: any){
      this.appService.socket_game.emit("letInvite", ret);
    }

    roomDeleted(ret: any){

      let i = 0;
      let saved :ListeConvo;
      this.id_leave = ret.roomId;
      while(i < this.ListConvo.length){
        if (this.ListConvo[i].roomId === this.id_leave)
        {
          this.ListConvo.splice(i, 1);
          this.convMap.delete(this.id_leave);
          this.list_id--;
          this.Convo = this.ListConvo[0];
          break;
        }
        i++;
      }
    }

    id_leave:number = 0;
    leaved_room(ret: any)
    {
        let i = 0;
        this.id_leave = ret.roomId;
        while(i < this.ListConvo.length){
          if (this.ListConvo[i].roomId === this.id_leave)
          {
            if (ret.isPublic === true){
              this.new_room(this.ListConvo[i]);
            }
            this.ListConvo.splice(i, 1);
            this.convMap.delete(this.id_leave);
            this.convo_id--;
            this.Convo = this.ListConvo[0];
            break;
          }
          i++;
        }
    }

    RoomError(Room: any)
    {
      this.emit_admin_msg(Room.targetId, Room.message);
    }

    new_room(Room: any)
    {
      this.list_to_join.push(new ListeConvo( Room.name,  Room.roomId, "", "", []));
      this.listMap.set( Room.roomId, this.list_to_join[this.convo_id]);
      this.list_id++;
    }

    joined_room(Room: any): boolean
    {
      if (this.check_if_exist(Room.roomId) === true)
      {
        return true;
      }
      this.need_key="";
      this.key_room_enter="";
      this.bad_key="";
      this.not_exist="false";
      var check = 0;
      var i = 0;
      while(i < this.list_to_join.length){
        if (this.list_to_join[i].roomId === Room.roomId)
        {
          check = 1;
          break;
        }
        i++;
      }
      if (this.convo_id === 0)
      {
        this.convMap.clear();
        this.ListConvo.pop();
        this.ListConvo.push(new ListeConvo(Room.name, Room.roomId, "" , "" , []));
        this.convMap.set( Room.roomId, this.ListConvo[this.convo_id]);
        this.Convo = this.ListConvo[0];
        if (check == 1){
          this.list_to_join.splice(i, 1);
          this.listMap.delete(Room.roomId);
        }
        this.convo_id++;
        return true;
      }
      else if(check == 1){
        this.ListConvo.push(new ListeConvo(Room.name, Room.roomId, "" , "" , []));
        this.convMap.set( Room.roomId, this.ListConvo[this.convo_id]);
        this.list_to_join.splice(i, 1);
        this.listMap.delete(Room.roomId);
        this.convo_id++;
      }
      else{
        this.ListConvo.push(new ListeConvo( Room.name,  Room.roomId, "", "", []));
        this.convMap.set( Room.roomId, this.ListConvo[this.convo_id]);
        this.convo_id++;
      }
      return true;
    }

    check_if_exist(RoomId: number): boolean{
      return this.convMap.has(RoomId);
    }

    recv_msg(msg: any){
      if (this.check_if_exist(msg.where) === false){
        this.joined_room({roomId:msg.where, name:msg.login, type:"", key:""}); ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      }
      let current = this.convMap.get(msg.where);
      current.tabmsg.push(new TabMsg(msg.message, "other", msg.login, msg.senderId));
    }

    reset_form(){
      this.name_room="";
      this.key_room="";
      this.type="public";
      this.ask_pass="no";
    }

    ask_create_room(){
      if (this.name_room.length >= 16
        || this.name_room.indexOf(" ") !== -1
        || this.name_room.indexOf(".") !== -1
        || this.name_room.indexOf("/") !== -1
        || this.name_room.indexOf("\\") !== -1
        || this.name_room.indexOf("-") !== -1
        || this.name_room.indexOf("*") !== -1){
        this.show_er_room="true";
        this.reset_form();
        return;
      }else if (this.name_room.length === 0){
        this.show_er_room="noname";
        this.reset_form();
        return;
      }

      const Room: any = {
        name: this.name_room,
        password: this.key_room,
        type: this.type,
      }
      this.appService.socket.emit("createRoom", Room);
      this.reset_form();
      this.show_chat = "true";
      this.show_btn='true';
      this.show_btn_list='true';
      this.show_er_room="false";
    }

    emit_msg(idChan: number, msg:string){
      var i = 0;
      while(i < this.ListConvo.length){
        if (this.ListConvo[i].roomId === idChan)
        {
          this.ListConvo[i].tabmsg.push(new TabMsg(msg, "me", "", 0));
          return;
        }
        i++;
      }
      this.emit_admin_msg(idChan, msg);
    }

    emit_admin_msg(idChan: number, msg:string){
      var i = 0;
      while(i < this.ListConvo.length){
        if (this.ListConvo[i].roomId === idChan)
        {
          this.ListConvo[i].tabmsg.push(new TabMsg(msg, "", "", 0));
          return;
        }
        i++;
      }
    }

    check_valide_id(cmd: string, id:number):boolean{
      const val=Number(cmd)?true:false
        if (val === false || cmd[0] === '-'){
          this.emit_admin_msg(id, "Invalid Argument, id Must be a valide personne id.");
          this.msg_to_send = "";
          return false;
        }
      this.msg_to_send = "";
      return true;
    }

    chek_cmd(id:number, msg :string):boolean{
      var cmd = msg.split(" ");
      if (cmd[0] === "/id"){
        if (cmd.length !== 1){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd>");
          return true;
        }
        let ret :string = "id room is " + id;
        this.emit_admin_msg(id, ret);
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/profile"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
        this.router.navigate(["/profile-other/" + cmd[1]]);
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/pwd"){
        if (cmd.length != 2){
          this.emit_admin_msg(id, "Invalid Number of Argument, Is must be <cmd> <password>.");
          return true;
        }
        let obj:any = {roomId: id, password: cmd[1]};
        this.appService.socket.emit("setRoomPassword" , obj);
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/pwd_unset"){
        if (cmd.length != 1){
          this.emit_admin_msg(id, "Invalid Number of Argument, Is must be <cmd>.");
          return true;
        }
        let obj:any = {roomId: id};
        this.appService.socket.emit("setRoomPassword" , obj);
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/leave"){
        if (cmd.length !== 1){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd>");
          return true;
        }
        let ret : any = {roomId: id};
        if (id > 0){
          this.emit_admin_msg(id, "Invalid Argument, you can leave only groupe channel.");
          return true;
        }
        this.appService.socket.emit("leaveRoom", ret);
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/add_admin"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
        let targetid:number = Number(cmd[1]);
        this.appService.socket.emit("setAdmin", {roomId: id, targetId: targetid, action: true});
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/del_admin"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
        let targetid:number = Number(cmd[1]);
        this.appService.socket.emit("setAdmin", {roomId: id, targetId: targetid, action: false});
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/block"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
        let targetid:number = Number(cmd[1]);
        this.appService.socket.emit("blockUser", {targetId: targetid});
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/unblock"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
        let targetid:number = Number(cmd[1]);
        this.appService.socket.emit("unblockUser", {targetId: targetid});
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/del_admin"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
          let targetid:number = Number(cmd[1]);
        this.appService.socket.emit("setAdmin", {roomId: id, targetId: targetid, action: false});
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/friend"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
        var id:number = Number(cmd[1]);
        this.appService.add_friend(id);
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/mute"){
        if (cmd.length !== 3){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> <time>");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
        if (this.check_valide_id(cmd[2], id) === false)
          return true;
          let v = Number(cmd[1]);
          let vc = Number(cmd[2]);
        this.appService.socket.emit("setMute", {roomId: id, duration:vc, targetId:v});
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/unmute"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
        let v = Number(cmd[1]);
        this.appService.socket.emit("setMute", {roomId: id, duration:0, targetId:v});
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/ban"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
        let targetid:number = Number(cmd[1]);
        this.appService.socket.emit("setBan", {roomId: id, targetId: targetid, action: true});
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/unban"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
        let targetid:number = Number(cmd[1]);
        this.appService.socket.emit("setBan", {roomId: id, targetId: targetid, action: false});
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/kick"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
          let targetid:number = Number(cmd[1]);
        this.appService.socket.emit("kickUser", {roomId: id, targetId: targetid});
        this.msg_to_send = "";
      }
      else if (cmd[0] === "/game"){
        if (cmd.length !== 2){
          this.emit_admin_msg(id, "Invalid Number of Argument. Is must be <cmd> <id> ");
          return true;
        }
        if (this.check_valide_id(cmd[1], id) === false)
          return true;
        let targetid:number = Number(cmd[1]);
        let game:any = {
          diff: 1,
          map: 1,
          targetId: targetid,
          roomId: id,
          login: this.appService.data.login
        }
        this.appService.socket_game.emit("invite", game);
        this.msg_to_send = "";
      }
      else
        return false;
      return true;
    }

    send_msg(id: number){

      const msg: any = {
        message: this.msg_to_send,
        targetId: id
      }
      if (this.msg_to_send.length === 0)
        return ;
      if (this.msg_to_send[0] == "/"){
        if (this.chek_cmd(id, this.msg_to_send) === true){
          return ;
        }
      }
      this.emit_msg(id, this.msg_to_send);
      this.appService.socket.emit("message", msg);
      this.msg_to_send = "";
    }

    list_private: Array<ListeConvo> = []

    set_chan(Room :any, Index: number)
    {
      var i = 0;

      while(i < this.ListConvo.length){
        if (this.ListConvo[i].roomId === Room.roomId)
        {
          this.Convo = this.ListConvo[i];
          break;
        }
        i++;
      }
    }

    bad_key="false";
    remove_chan_wait(Room: any, Id: number)
    {
      this.ask_for = Id;
      this.appService.socket.emit("joinRoom" , Room);
    }

    send_key_room(){
      var i = 0;
      var Room :any;
      while(i < this.list_to_join.length){
        if (this.list_to_join[i].roomId === this.ask_for)
        {
          Room = this.list_to_join[i];
          Room.password = this.key_room_enter;
          this.appService.socket.emit("joinRoom" , Room);
          this.key_room_enter="";
          break;
        }
        i++;
      }
    }

    /*case ChatResult.Ok:
case ChatResult.NotRegistered:
case ChatResult.TargetNotFound:
case ChatResult.InvalidValue:
case ChatResult.AlreadyInRoom:
case ChatResult.PasswordRequired:
case ChatResult.WrongPassword:
case ChatResult.NotInRoom:
case ChatResult.TargetNotInRoom:
case ChatResult.NotAdmin:
case ChatResult.Blocked:
case ChatResult.Muted:
case ChatResult.Banned:
case ChatResult.LastAdmin:*/

    er="";
    check_error(Room: any)
      {
          if (Room.error === "PasswordRequired"){
            this.need_key="true";
            this.key_room_enter="";
          }
          else if (Room.error === "WrongPassword" ){
            this.bad_key="true";
            this.need_key="true";
            this.key_room_enter="";
          }
          else if (Room.error === "TargetNotFound"){
            this.not_exist="true";
          }
          else if (Room.error === "Banned"){
            this.not_exist="true";
            this.er="true";
          }
      }

    find_private_room(){
      var Room : any;
      var id :number = Number(this.name_room_private);
      Room = {roomId: id, toFind : true};
      this.appService.socket.emit("joinRoom" , Room);
      this.ask_for = id;
      this.not_exist="false";
      this.er="false";
      this.name_room_private="";
      return ;
    }

    // Fonction de swap states
    selec_private="";
    selec_public="selected";
    selec_no="selected";
    selec_yes="";
    show_chat="true";
    show_btn='true';
    show_er_room="fasle";
    create_or_join="";
    key_room_enter="";
    need_key="";
    ask_for=0;

    selec_type(selec: number)
    {
      if (selec == 1){
        this.type="public";
        this.selec_public="selected";
        this.selec_private="";
      }
      else{
        this.type="private";
        this.selec_private="selected";
        this.selec_public="";
      }
    }


    selec_pwsd(selec: number)
    {
      if (selec == 1){
      this.ask_pass="public";
      this.ask_pswd = 'no';
      this.selec_no = "selected"
      this.selec_yes = ""
    }
    else
    {
      this.ask_pass="private";
      this.ask_pswd = 'yes';
      this.selec_yes = "selected"
      this.selec_no = ""
    }
  }

  Show_help()
  {
    this.selec_type(1);
    this.selec_pwsd(1);
    this.bad_key="";
    this.show_chat = "false";
    this.show_er_room="fasle";
    this.show_btn='false';
    this.create_or_join="help";
    this.key_room_enter="";
    this.key_room="";
    this.not_exist="false";
    this.er="false";
    this.name_room_private="";
  }

  Show_create_room(){
    this.bad_key="";
    this.show_chat = "false";
    this.show_er_room="fasle";
    this.show_btn='false';
    this.create_or_join="create";
    this.key_room_enter="";
    this.key_room="";
    this.not_exist="false";
    this.er="false";
    this.name_room_private="";
  }

  create_room_cancel(){
    this.selec_type(1);
    this.selec_pwsd(1);
    this.bad_key="";
    this.show_chat = "true";
    this.show_btn='true';
    this.key_room_enter="";
    this.key_room="";
    this.not_exist="false";
    this.er="false";
    this.name_room_private="";
  }

  reset_chat(){
    this.selec_type(1);
    this.selec_pwsd(1);
    this.bad_key="";
    this.show_chat = "true";
    this.show_btn='true';
    this.key_room_enter="";
    this.key_room="";
    this.not_exist="false";
    this.name_room_private="";
  }

  Show_join_room(){
    this.selec_type(1);
    this.selec_pwsd(1);
    this.bad_key="";
    this.show_chat = "false";
    this.show_er_room="fasle";
    this.show_btn='false';
    this.create_or_join="join";
    this.key_room_enter="";
    this.key_room="";
    this.not_exist="false";
    this.name_room_private="";
  }
}
