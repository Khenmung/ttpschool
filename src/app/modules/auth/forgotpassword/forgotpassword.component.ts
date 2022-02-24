import { Component, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { AuthService } from 'src/app/_services/auth.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss']
})
export class ForgotpasswordComponent implements OnInit {
  loading = false;
  loginUserDetail = [];
  forgotpwdForm: FormGroup;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  mediaSub: Subscription;
  deviceXs: boolean;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  constructor(private authService: AuthService,
    private route: Router,
    private mediaObserver: MediaObserver,
    private fb: FormBuilder,
    private tokenService: TokenStorageService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
    });

    this.loginUserDetail = this.tokenService.getUserDetail();
    if (this.loginUserDetail == null)
      this.route.navigate(['/auth/login']);
    else {
      this.forgotpwdForm = this.fb.group({
        email: ['', [Validators.required]]
      });
    }
  }
  gotohome() {
    this.route.navigate(['/dashboard']);
  }
  get f() {
    return this.forgotpwdForm.controls;
  }
  onSubmit(): void {
    var email = this.forgotpwdForm.get("email").value;    
    var payload = {
      'Email': email
    }
    
    this.authService.CallAPI(payload,'ForgotPassword').subscribe(
      (data: any) => {
        ////console.log(data);
        this.isSuccessful = true;
        this.alert.success("Email sent to your register email address.", this.optionsNoAutoClose);        
      },
      err => {
        if (err.error) {
          var modelState = err.error.errors;
          this.errorMessage = '';
          //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
          for (var key in modelState) {
            if (modelState.hasOwnProperty(key)) {
              this.errorMessage += (this.errorMessage == "" ? "" : this.errorMessage + "<br/>") + modelState[key];
              //errors.push(modelState[key]);//list of error messages in an array
            }
          }

          this.isSignUpFailed = true;
          //console.log(err.error)
        }
      }
    );
  }
}
