import { Component, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/_services/user.service';
import {SharedataService} from '../../../shared/sharedata.service';
@Component({
  selector: 'app-home',
  templateUrl: './authhome.component.html',
  styleUrls: ['./authhome.component.scss']
})
export class AuthHomeComponent implements OnInit {
  content?: string;
  mediaSub:Subscription;
  deviceXs:boolean;
  constructor(private userService: UserService,
    private mediaObserver:MediaObserver) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
      console.log("auth",this.deviceXs);
    });  
  }
}