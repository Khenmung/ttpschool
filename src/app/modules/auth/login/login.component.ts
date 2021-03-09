import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(private authService: AuthService, 
    private tokenStorage: TokenStorageService,
    private route:Router) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      //console.log('a',this.tokenStorage.getToken())
      this.isLoggedIn = true;
      //this.username = this.tokenStorage.getUser();
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
        this.route.navigate(['/']);
        //this.reloadPage();
      },
      err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
        //console.log(this.errorMessage);
      }
    );
  }
  gotohome(){
    this.route.navigate(['/']);
  }
  reloadPage(): void {
    window.location.reload();
  }
}