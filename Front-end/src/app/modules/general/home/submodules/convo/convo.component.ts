import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-convo',
  templateUrl: './convo.component.html',
  styleUrls: ['./convo.component.scss']
})
export class ConvoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @ContentChild(TemplateRef)
    template!: TemplateRef<any>;

  @Input()
    items: Array<any> = [];

}
