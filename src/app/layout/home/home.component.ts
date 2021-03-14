import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MediaChange, MediaObserver } from '@angular/flex-layout'


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  mediaSub: Subscription;
  deviceXs: boolean;
  mode: string;
  contentcls:string;
  openSideBar = true;
  constructor(private mediaObserver: MediaObserver) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
      if (this.deviceXs) {
        this.openSideBar = false;
        this.mode = "over";
        this.contentcls ='top80';        
      }
      else
      {
        this.mode = "side";
        this.contentcls ="top70";
      }
    })
  }
  ngOnDestroy() {
    this.mediaSub.unsubscribe();
  }
  sideBarToggler() {
    this.openSideBar = !this.openSideBar;
    if(this.openSideBar==true && this.deviceXs==false)
      this.contentcls ="top70";
      else if(this.openSideBar==false && this.deviceXs==false)
      this.contentcls ="top80";
      else
      this.contentcls ="top80";
  }
}
