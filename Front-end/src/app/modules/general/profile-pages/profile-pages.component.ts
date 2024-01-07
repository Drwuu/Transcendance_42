import { Component, OnInit, OnDestroy } from '@angular/core';
import { Data } from '../login/entities/Data.entities';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-pages',
  templateUrl: './profile-pages.component.html',
  styleUrls: ['./profile-pages.component.scss']
})
export class ProfilePagesComponent implements OnInit, OnDestroy {

  constructor(public router: Router,
    public appService: AppService) {
    this.stop_reload = 0;
    this.init_refresh();
    this.appService.socket_game.emit("refuse");
    this.data = this.appService.data;
    if (this.data.authStatus === "Accepted" && this.data.requires2FA === true){
      this.show_DbAuth = 'true';
      this.show_DbAuth_Activated = "true";
    }
  }

  data: Data;
  stop_reload: number;
  show_login='false';
  show_file='false';
  show_DbAuth='false';
	show_DbAuth_Activated="false";
  file_validator='true';
  username: string = '';
  Code_Auth_recv: string = '';
  Input_Auth_User: string = '';
  show_error ='false';
  Auth_valid: boolean = false;
  file?: File;
  img: string = '';
  show_profil='false';

  ngOnInit(): void {
  }

  ngOnDestroy(): void{
    this.stop_reload = 1;
  }

  async init_refresh()
  {
    if (this.appService.data.authStatus !== "Accepted"){
      await this.appService.GetDataRefresh(this.appService.LINK_API);
      if (this.appService.data.authStatus !== "Accepted"){
        this.router.navigate(['/login']);
        return ;
      }
    }
    this.getHistoryListe();
    this.data = this.appService.data;
    this.show_profil="true";
  }

  Db_Auth_Deactivate(){
    try {
      this.appService.postData(this.appService.LINK_API + "/profile/deactivate_2fa", {})
    } catch (error) {

    }
    this.show_DbAuth_Activated = "true";
    this.show_DbAuth = 'false';
  }

  Db_Auth_process_cancel(){
    this.show_DbAuth = 'false';
  }

  async SendStringAuth(){
    var code: any;
    try {
      code = (await this.appService.postData(this.appService.LINK_API + "/profile/validate_2fa", {token: this.Input_Auth_User, Date:Date.now()})).code
    } catch (error) {
    }
    if (code === true)
    {
      this.show_DbAuth_Activated = "true";
      this.show_DbAuth = 'true';
    }
    else{
      this.show_error = 'true';
    }
  }

  async RecvStringAuth(){
    var code: any;
    try {
      this.Code_Auth_recv = (await this.appService.postData(this.appService.LINK_API + "/profile/activate_2fa", {})).Code_Auth_recv;
    } catch (error) {
    }
  }

  async Db_Auth_states()
  {
    if (this.show_DbAuth == 'false'){
      this.show_DbAuth = 'true';
      this.RecvStringAuth();
      return;
    }
    this.show_DbAuth = 'false';
  }

  onFileSelected(event: any){
    this.file = event.target.files[0];
  }

  async sendFile(){
    if (this.file) {
      let formData = new FormData();
      formData.append("avatar", this.file);

        await fetch(`${this.appService.LINK_API}/profile/set_avatar`, {
          method: "POST",
          credentials: 'include',
          body: formData,
        })
        this.appService.avatar_date = Date.now();
      }
      this.show_file = 'false';
  }
  async ResetFile() {
    await fetch(`${this.appService.LINK_API}/profile/nuke_avatar`, {
      method: "POST",
      credentials: 'include'
    })
    this.appService.avatar_date = Date.now();
    this.show_file = 'false';
 }

  ProcessImgChange(){
    if (this.show_file == 'false'){
      this.show_file = 'true';
      return;
    }
    this.show_file = 'false';

  }

  async getHistoryListe(){
    while(true)
    {
      if (this.stop_reload === 1){
        break ;
      }
      this.listHistory = await this.appService.postData(this.appService.LINK_API + "/profile/match_history", {});
      await this.appService.delay(5000);
    }
    return this.listHistory;
  }

  async ProcessLogchange(){
    if (this.show_login == 'false'){
      this.show_login = 'true';
      return;
    }
    if (this.username.length >= 10 || this.username.length == 0){
      this.file_validator = 'false';
      return;
    }
    let res = await this.appService.postData(this.appService.LINK_API + "/profile/set_login", {newLogin: this.username});

    if (!res.succes) {
      this.file_validator = 'false';
    } else {
      this.show_login = 'false';
      this.file_validator = 'true';
      this.appService.data.login = this.username;
    }
  }

  GetImageUrl() {
    return this.data.imageUrl + "?_ts=" + this.appService.avatar_date;
  }

  listHistory: Array<any> = []
}
