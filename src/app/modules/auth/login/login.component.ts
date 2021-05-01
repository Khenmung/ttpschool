import { Component, Input, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
//import { globalconstants } from 'src/app/shared/globalconstant';
import { AuthService } from 'src/app/_services/auth.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
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
  username:string='';
  mediaSub:Subscription;
  deviceXs:boolean;
  
  constructor(private authService: AuthService, 
    private tokenStorage: TokenStorageService,
    private route:Router,
    private mediaObserver:MediaObserver ) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
      console.log("authlogin",this.deviceXs);
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
        console.log("login data",data);
        this.tokenStorage.saveToken(data.access_token);
        this.tokenStorage.saveUser(data.userName);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.username = this.tokenStorage.getUser();   
        this.route.navigate(['/home']);
        //this.reloadPage();
      },
      err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );
  }
  gotohome(){
    this.route.navigate(['/home']);
  }
  reloadPage(): void {
    window.location.reload();
  }
}