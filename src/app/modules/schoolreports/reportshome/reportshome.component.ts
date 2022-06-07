import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reportshome',
  templateUrl: './reportshome.component.html',
  styleUrls: ['./reportshome.component.scss']
})
export class reportshomeComponent implements OnInit { PageLoading=true;
  openSideBar =true;
  constructor() { }

  ngOnInit(): void {
  }
  sideBarToggler(){
    this.openSideBar =!this.openSideBar;
  }
}
