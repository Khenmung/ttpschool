import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../../_services/token-storage.service';
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
  SelectedApplicationName = '';
  SelectedBatchName = '';
  LoginUserDetails = [];
  constructor(
    private route: Router,
    private tokenStorage: TokenStorageService
  ) {
  }
  ngOnInit(): void {

    this.LoginUserDetails = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetails === undefined)
      this.loggedIn = false;
    else {
      this.loggedIn = true;
      this.userName = this.LoginUserDetails[0]["userName"];    
      var PermittedApplications = this.tokenStorage.getPermittedApplications();
      debugger;
      if (PermittedApplications.length == 0) {
        this.route.navigate(["/auth/selectplan"]);
      }
      else {
        this.SelectedBatchName = this.tokenStorage.getSelectedBatchName();
        var SelectedApplicationId = this.tokenStorage.getSelectedAPPId();
        this.SelectedApplicationName = '';
        var apps = PermittedApplications.filter(f => f.applicationId == SelectedApplicationId)

        if (apps.length > 0) {
          this.SelectedApplicationName = apps[0].applicationName;
        }
      }
    }

  }

  changepassword() {
    this.route.navigate(["/auth/changepassword"]);
  }
  gotoLogin() {
    this.route.navigate(["/auth/login"]);
  }
  createlogin() {
    this.route.navigate(["/auth/register"]);
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
