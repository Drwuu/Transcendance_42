import { Component, OnInit, OnDestroy} from '@angular/core';
import { Data } from '../login/entities/Data.entities';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profile-other',
  templateUrl: './profile-other.component.html',
  styleUrls: ['./profile-other.component.scss']
})
export class ProfileOtherComponent implements OnInit, OnDestroy {

  constructor(public router: Router,
    private routActiv: ActivatedRoute,
    public appService: AppService,) {
      this.id_need = this.routActiv.snapshot.paramMap.get('id');
      this.stop_reload = 0;
      this.init_refresh();
      this.appService.socket_game.emit("refuse");
    }

  listHistory: Array<any> = []
  data: Data = new Data(false, 0, 0, 0, "", "", "", "", "", 0, 0);;
  stop_reload: number = 0;
  show_login='false';
  img: string = '';
  show_profil='fasle';
  id_need:any;
  ngOnInit(): void {
  }

  ngOnDestroy(): void{
    this.stop_reload = 1;
  }

  async init_refresh()
  {
    if (this.appService.data.authStatus !== "Accepted"){
      try{
        await this.appService.GetDataRefresh(this.appService.LINK_API);
      }catch (error :any) {
        if (error.ok === true){
        }
      }
      if (this.appService.data.authStatus !== "Accepted"){
        this.router.navigate(['/login']);
        return ;
      }
    }
    try {
      this.getUser();
      this.getHistoryListe();
    } catch (error) {
    }
    this.show_profil="true";
  }

  async getUser(){
    while(true)
    {
      if (this.stop_reload === 1){
        break ;
      }
    try{
      this.data = await this.appService.postData(this.appService.LINK_API + "/profile/get_user_info", {targetId: this.id_need});
      if (this.data.id === 0){
        this.router.navigate(['/404']);
      }
      }catch (error :any) {
        if (error.ok === true){
          console.warn("bad requete get_user_id");
        }
      }
      await this.appService.delay(5000);
    }
    return this.data;
  }

  async getHistoryListe(){
    while(true)
    {
      if (this.stop_reload === 1){
        break ;
      }
      try {
        this.listHistory = await this.appService.postData(this.appService.LINK_API + "/profile/match_history/" + this.id_need);
      } catch (error :any) {
        if (error.ok === true){
          console.warn("bad fetch requete (listhystory)");
        }
      }
      await this.appService.delay(5000);
    }
    return this.listHistory;
  }

  GetImageUrl() {
    return this.data.imageUrl + "?_ts=" + this.appService.avatar_date;
  }

}
