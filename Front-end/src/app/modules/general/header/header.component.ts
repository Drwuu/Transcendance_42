import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(public appService: AppService,public router: Router) { }

  ngOnInit(): void {
  }

  Process_log_out()
  {
    this.appService.socket.close();
    this.appService.socket_game.close();
    document.location.href = "/login";
  }
}
