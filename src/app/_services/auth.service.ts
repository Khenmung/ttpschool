import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { globalconstants } from '../shared/globalconstant';
import { TokenStorageService } from './token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map } from 'rxjs/operators';
import { SharedataService } from '../shared/sharedata.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService implements OnInit {
  //userInfo = new BehaviorSubject(null);
  jwtHelper = new JwtHelperService();
  httpOptions:{headers:{"Content-Type":"application/json"}};
  AUTH_API: string = '';//'http://localhost:8070/';
  constructor(private http: HttpClient,
    private shareddata:SharedataService,
    private token:TokenStorageService) {
    this.AUTH_API = globalconstants.apiUrl;
    this.loadUserInfo();
  }

ngOnInit(): void {
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
  

}
  login(myusername: string, mypassword: string): Observable<any> {
    let val = {
      "email":  myusername,      
      "password": mypassword
    }
    if (val && val.email && val.password) {
     
      return this.http.post(this.AUTH_API + '/api/AuthManagement/login',val).pipe(
        map((data: any) => {
          if (!data) {
            return false;
          }
          localStorage.setItem('access_token', data.token);
          localStorage.setItem('refresh_token', data.refreshToken);
          var decodedUser = this.jwtHelper.decodeToken(data.token);
          console.log('decodedUser',decodedUser)
          localStorage.setItem('expiration', decodedUser.exp);
          localStorage.setItem('userInfo',JSON.stringify(decodedUser));
          return true;
        })
      );
    }
    return of(false);
    //return this.http.post(this.AUTH_API + '/api/AuthManagement/login', val);

  }

  register(userDetail): Observable<any> {
    return this.http.post(this.AUTH_API + '/api/AuthManagement/Register',userDetail
    , this.httpOptions);
  }
  RefreshToken(tokenrequest): Observable<any> {
    return this.http.post(this.AUTH_API + '/api/AuthManagement/RefreshToken',tokenrequest
    , this.httpOptions);
  }
  changePassword(confirmPassword: string, OldPassword: string, password: string): Observable<any> {
    return this.http.post(this.AUTH_API + '/api/Account/ChangePassword', {
      OldPassword: OldPassword,
      NewPassword: password,
      ConfirmPassword: confirmPassword      
    }, this.httpOptions);
  }
  loadUserInfo() {
    let userdata; 
    this.shareddata.CurrentUserInfo.subscribe(s=>userdata=s);
    if (!userdata) {

      const access_token = localStorage.getItem('access_token');
      if (access_token) {
        userdata = this.jwtHelper.decodeToken(access_token);
       this.shareddata.ChangeUserInfo(userdata);
       }
    }
  }
  callRefershToken(payload){
    return this.http.post(this.AUTH_API + "/api/AuthManagement/RefreshToken",payload);
  }
}
