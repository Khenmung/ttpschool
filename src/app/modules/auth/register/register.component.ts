import { Component, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: any = {
    ConfirmPassword: null,
    Email: null,
    Password: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  mediaSub:Subscription;
  deviceXs:boolean;
  constructor(private authService: AuthService,
              private route:Router,
              private mediaObserver:MediaObserver) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
      //console.log("authlogin",this.deviceXs);
    });
  }
  gotohome(){
    this.route.navigate(['/home']);
  }
  gotologin(){
    this.route.navigate(['/auth/login']);
  }
  onSubmit(): void {
    const { ConfirmPassword, Email, Password } = this.form;
debugger;
    this.authService.register(ConfirmPassword, Email, Password).subscribe(
      data => {
        //console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      err => {
        
        var modelState = err.error.ModelState;
                      //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
                        for (var key in modelState) {
                            if (modelState.hasOwnProperty(key)) {
                                this.errorMessage += (this.errorMessage == "" ? "" : this.errorMessage + "<br/>") + modelState[key];
                                //errors.push(modelState[key]);//list of error messages in an array
                            }
                        }

        this.isSignUpFailed = true;
        console.log(err.error)
      }
    );
  }
}