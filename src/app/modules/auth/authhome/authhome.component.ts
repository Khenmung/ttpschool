import { Component, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { UserService } from '../../../_services/user.service';
import { SharedataService } from '../../../shared/sharedata.service';
import { List } from 'src/app/shared/interface';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
@Component({
  selector: 'app-home',
  templateUrl: './authhome.component.html',
  styleUrls: ['./authhome.component.scss']
})
export class AuthHomeComponent implements OnInit { PageLoading=true;
  content?: string;
  mediaSub: Subscription;
  deviceXs: boolean;

  constructor(
    private userService: UserService,
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private mediaObserver: MediaObserver) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.asObservable().subscribe((result: MediaChange[]) => {
      this.deviceXs = result[0].mqAlias === "xs" ? true : false;
      ////console.log("auth",this.deviceXs);
    });
  }
  
}