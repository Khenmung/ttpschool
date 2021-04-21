import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  //@Output() openLeftMenu1:new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }
  open(){
    
  }
}
