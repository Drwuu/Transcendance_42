import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @ContentChild(TemplateRef)
    template!: TemplateRef<any>;

  @Input()
    items: Array<any> = [];
}
