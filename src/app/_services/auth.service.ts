import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { globalconstants } from '../shared/globalconstant';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {
  httpOptions:{};
  AUTH_API: string = '';//'http://localhost:8070/';
  constructor(private http: HttpClient,
    private token:TokenStorageService) {
    this.AUTH_API = globalconstants.apiUrl;
  }

ngOnInit(): void {
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
  

}
  login(myusername: string, mypassword: string): Observable<any> {
    //return this.http.post(this.AUTH_API + '/Token', {
    const formdata: FormData = new FormData();
    let val = "grant_type=password&username=" + myusername + "&password=" + mypassword

    return this.http.post(this.AUTH_API + '/token', val, this.httpOptions);
  }

  register(confirmPassword: string, email: string, password: string): Observable<any> {
    return this.http.post(this.AUTH_API + '/api/Account/Register', {
      //  return this.http.post('/api/Account/Register', {
      ConfirmPassword: confirmPassword,
      Email: email,
      Password: password
    }, this.httpOptions);
  }
  changePassword(confirmPassword: string, OldPassword: string, password: string): Observable<any> {
    this.httpOptions = {
      headers: new HttpHeaders({ 'Accept': 'application/json; odata=verbose',
                                 'Content-Type': 'application/json',
                                 'Authorization': 'Bearer ' + this.token.getToken()})
    };
    console.log(this.httpOptions);
    return this.http.post(this.AUTH_API + '/api/Account/ChangePassword', {
      OldPassword: OldPassword,
      NewPassword: password,
      ConfirmPassword: confirmPassword      
    }, this.httpOptions);
  }
}