import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { globalconstants } from '../../globalconstant';
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
  logoPath ='';
  loggedIn: boolean;
  OrganizationName ='';
  SelectedApplicationName = '';
  SelectedBatchName = '';
  LoginUserDetails = [];
  constructor(
    private route: Router,
    private tokenStorage: TokenStorageService
  ) {
  }
  ngOnInit(): void {
debugger;
    this.LoginUserDetails = this.tokenStorage.getUserDetail();
    if (this.LoginUserDetails.length==0)
    {
      this.loggedIn = false;
      this.logoPath = "assets/images/newttplogo.png"
    }     
    else {
      this.loggedIn = true;
      this.userName = localStorage.getItem('username');    
      this.logoPath = this.LoginUserDetails[0].logoPath;
      if(this.logoPath ==undefined)
      {
        this.logoPath = "assets/images/newttplogo.png"
      }
      var PermittedApplications = this.tokenStorage.getPermittedApplications();
      debugger;
      // if (PermittedApplications.length == 0) {
      //   this.route.navigate(["/auth/selectplan"]);
      // }
      // else {
        this.OrganizationName = this.LoginUserDetails[0].org
        var SelectedApplicationId = this.tokenStorage.getSelectedAPPId();
        this.SelectedApplicationName = '';
        var apps = PermittedApplications.filter(f => f.applicationId == SelectedApplicationId)

        if (apps.length > 0) {        
          
          this.SelectedBatchName = this.tokenStorage.getSelectedBatchName();
          this.SelectedApplicationName = apps[0].applicationName + (this.SelectedBatchName ==''?'':' - ' + this.SelectedBatchName)
        }
      //}
    }

  }

  changepassword() {
    this.route.navigate(["/auth/changepassword"]);
  }
  gotoLogin() {
    this.route.navigate(["/auth/login"]);
  }
  createlogin() {
    this.route.navigate(["/auth/signup"]);
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
