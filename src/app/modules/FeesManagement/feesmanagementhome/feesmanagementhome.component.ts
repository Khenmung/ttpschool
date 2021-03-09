import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feesmanagementhome',
  templateUrl: './feesmanagementhome.component.html',
  styleUrls: ['./feesmanagementhome.component.scss']
})
export class FeesmanagementhomeComponent implements OnInit {
  openSideBar =true;
  constructor() { }

  ngOnInit(): void {
  }
  sideBarToggler(){
    this.openSideBar =!this.openSideBar;
  }
}
