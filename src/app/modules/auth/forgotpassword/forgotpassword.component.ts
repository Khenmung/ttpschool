import { Component, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { AuthService } from 'src/app/_services/auth.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss']
})
export class ForgotpasswordComponent implements OnInit { PageLoading=true;
  loading = false;
  loginUserDetail = [];
  forgotpwdForm: UntypedFormGroup;
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
    private fb: UntypedFormBuilder,
    private tokenService: TokenStorageService,
    private contentservice: ContentService
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
    this.loading=true;
    this.authService.CallAPI(payload,'ForgotPassword').subscribe(
      (data: any) => {
        ////console.log(data);
        this.loading=false;this.PageLoading=false;
        this.isSuccessful = true;
        this.contentservice.openSnackBar("Email sent to your register email address.",globalconstants.ActionText,globalconstants.BlueBackground);        
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
