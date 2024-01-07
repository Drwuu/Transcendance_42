import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Data } from '../../../login/entities/Data.entities';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(
    public appService: AppService,
    public router: Router
    ) { this.data = this.appService.data; }

  data: Data;
  ngOnInit(): void {
  }

  GoProfile()
  {
    this.router.navigate(['/profile']);
  }

  GetImageUrl() {
    return this.data.imageUrl + "?_ts=" + this.appService.avatar_date;
  }

}
