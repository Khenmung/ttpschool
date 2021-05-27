import { Component, Input, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';
//import { globalconstants } from '../../../shared/globalconstant';
import { AuthService } from '../../../_services/auth.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
// import { AuthService } from '../_services/auth.service';
// import { TokenStorageService } from '../_services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  username: string = '';
  mediaSub: Subscription;
  deviceXs: boolean;

  constructor(private authService: AuthService,
    private dataservice: NaomitsuService,
    private tokenStorage: TokenStorageService,
    private route: Router,
    private alert:AlertService,
    private mediaObserver: MediaObserver) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
      //console.log("authlogin",this.deviceXs);
    });
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.route.navigate(['/index.html']);
    }
  }

  onSubmit(): void {

    const { username, password } = this.form;

    this.authService.login(username, password).subscribe(

      data => {
        debugger;
        //console.log("login data",data);
        this.tokenStorage.saveToken(data.access_token);
        this.tokenStorage.saveUser(data.userName);
        this.GetApplicationRoleUser(data.userName)

      },
      err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );
  }
  GetApplicationRoleUser(email) {

    let list: List = new List();
    list.fields = [
      'UserName',
      'ApplicationUserId',
      'Email',
      'OrgId',
      'ManagerId',
      'ApplicationRoleUsers/ApplicationId',
      'ApplicationRoleUsers/RoleId',
      'Active'];

    list.PageName = "AppUsers";
    list.lookupFields = ["ApplicationRoleUsers"];
    list.filter = ["Active eq 1 and Email eq '" + email + "'"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          console.log('userdetail', data.value);
          let userDetail = data.value.map(element => {
            return {
              username: element.UserName,
              email: element.Email,
              OrgId:element.OrgId,
              ManagerId:element.ManagerId,
              ApplicationRoleUsers: element.ApplicationRoleUsers
            }
          })
          this.tokenStorage.saveUserdetail(userDetail);
        }
        else {
            this.alert.warn("Login sucessful but application is not yet assigned to you.");
        }
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.username = this.tokenStorage.getUser();
        //this.route.navigate(['/home']);
        //this.ApplicationRoleUserList = [...data.value];
      })
  }
  gotohome() {
    this.route.navigate(['/home']);
  }
  reloadPage(): void {
    window.location.reload();
  }
}