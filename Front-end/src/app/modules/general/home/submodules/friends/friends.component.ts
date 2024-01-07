import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';
import { Data } from '../../../login/entities/Data.entities';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})

export class FriendsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @ContentChild(TemplateRef)
    template!: TemplateRef<any>;

  @Input()
    items: Array<Data> = [];
}
