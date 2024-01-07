import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(public appService: AppService,public router: Router) {
    this.init_refresh();
    this.appService.socket_game.emit("refuse");
  }

  ngOnInit(): void {
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
