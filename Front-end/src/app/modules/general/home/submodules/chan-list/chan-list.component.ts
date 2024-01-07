import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-chan-list',
  templateUrl: './chan-list.component.html',
  styleUrls: ['./chan-list.component.scss']
})
export class ChanListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @ContentChild(TemplateRef)
  template!: TemplateRef<any>;

  @Input()
    items: Array<any> = [];

}
