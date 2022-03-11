import { Component, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AuthService } from '../../../_services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  loading = false;
  loginUserDetail = [];
  changepwdForm: FormGroup;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  mediaSub: Subscription;
  deviceXs: boolean;
  SelectedApplicationName='';
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  constructor(
    private authService: AuthService,
    private route: Router,
    private mediaObserver: MediaObserver,
    private fb: FormBuilder,
    private tokenService: TokenStorageService,
    private contentservice: ContentService
  ) { }

  ngOnInit(): void {
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
    });

    this.loginUserDetail = this.tokenService.getUserDetail();

    if (this.loginUserDetail.length == 0)
      this.route.navigate(['/auth/login']);
    else {
      //this.SelectedApplicationName = this.tokenService.gets
      this.changepwdForm = this.fb.group({
        ConfirmPassword: ['', [Validators.required, Validators.minLength(6)]],
        OldPassword: ['', [Validators.required, Validators.minLength(6)]],
        NewPassword: ['', [Validators.required, Validators.minLength(6)]]
      });
    }
  }
  gotohome() {
    this.route.navigate(['/dashboard']);
  }
  get f() {
    return this.changepwdForm.controls;
  }
  onSubmit(): void {
    var ConfirmPassword = this.changepwdForm.get("ConfirmPassword").value;
    var OldPassword = this.changepwdForm.get("OldPassword").value;
    var NewPassword = this.changepwdForm.get("NewPassword").value;
    var payload = {
      'UserId': this.loginUserDetail[0]["userId"],
      'OldPassword': OldPassword,
      'NewPassword': NewPassword,
      'ConfirmPassword': ConfirmPassword
    }
    debugger;
    this.authService.CallAPI(payload,'ChangePassword').subscribe(
      (data: any) => {
        ////console.log(data);
        this.isSuccessful = true;
        this.contentservice.openSnackBar("Password changed.",globalconstants.ActionText,globalconstants.BlueBackground);
        this.tokenService.signOut();
        this.route.navigate(['/auth/login']);
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