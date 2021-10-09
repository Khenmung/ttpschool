import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MediaChange, MediaObserver } from '@angular/flex-layout'
import { ChangeDetectorRef } from '@angular/core';
import { NaomitsuService } from '../../databaseService';
import { SharedataService } from '../../sharedata.service';
import { List } from '../../interface';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  mediaSub: Subscription;
  deviceXs: boolean;
  mode = 'side';
  contentcls: string;
  sidebarcls: string;
  openSideBar = true;
  MenuData = [];
  NewsNEventPageId = 0;
  constructor(private mediaObserver: MediaObserver,
    // private ref: ChangeDetectorRef,
    // private databaseservice: NaomitsuService,
    // private shareddata: SharedataService
    ) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.asObservable().subscribe((result) => {
      //console.log('result',result);
      this.deviceXs = result[0].mqAlias === "xs" ? true : false;
      if (this.deviceXs) {
        this.openSideBar = false;
        this.mode =  "over";
        this.contentcls = 'DeviceXs';
        //this.sidebarcls = 'sidebartop110width100'
      }
      else {
        if (!this.openSideBar)
          this.openSideBar = true;
        this.mode = "side";
        this.contentcls = "NotDeviceXs";
        //this.sidebarcls = "sidebartop65width100";
      }
      //this.ref.detectChanges();
      //console.log('contentcls', this.contentcls);
    })
    //this.GetMenuData();

  }
  ngOnDestroy() {
    this.mediaSub.unsubscribe();
  }
  DownFromMenu(value) {
    //console.log('from menu',value);
    if (this.deviceXs)
      this.openSideBar = !this.openSideBar;
  }
  sideBarToggler() {
    //debugger;
    this.openSideBar = !this.openSideBar;
    //console.log('this.deviceXs in toggle',this.deviceXs)
    if (!this.openSideBar && this.deviceXs)
      this.contentcls = "DeviceXs";
    else if (this.openSideBar && this.deviceXs)
      this.contentcls = 'OpenAndDeviceXs';
    else
      this.contentcls = "NotDeviceXs";
    //this.ref.detectChanges();

  }
}
