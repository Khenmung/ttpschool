import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { NaomitsuService } from '../../databaseService';
import { List } from '../../interface';
import { SharedataService } from '../../sharedata.service'
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() deviceXs: boolean;
  @Output() toggleSideBarForme: EventEmitter<any> = new EventEmitter();
  loading: false;
  userName: string = '';
  loggedIn: boolean;
  constructor(
    private route: Router,
    private tokenStorage: TokenStorageService   
  ) {
  }
  ngOnInit(): void {

    this.userName = this.tokenStorage.getUser();
    if (this.userName === undefined || this.userName === null || this.userName == '')
      this.loggedIn = false;
    else
      this.loggedIn = true;
  }

  changepassword() {
    this.route.navigate(["/auth/changepassword"]);
  }
  gotoLogin() {
    this.route.navigate(["/auth/login"]);
  }
  createlogin() {
    this.route.navigate(["/auth/createlogin"]);
  }
  addUser() {
    this.route.navigate(["/auth/signup"]);
  }
  logout() {
    //debugger;
    this.tokenStorage.signOut();
    this.route.navigate(['/auth/login']);
  }
  contactus() {
    this.route.navigate(["/home/addmessage"]);
  }
  home() {
    this.route.navigate(["/home/"]);
  }
  // newsNEvents() {
  //   this.route.navigate(['/home/about/' + this.NewsNEventPageId]);
  // }
  goto(page) {
    this.route.navigate(['/' + page]);
  }

}
