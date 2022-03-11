import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss']
})
export class ResetpasswordComponent implements OnInit {
  loading = false;
  loginUserDetail = [];
  resetpwdForm: FormGroup;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  // mediaSub: Subscription;
  // deviceXs: boolean;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  Code='';
  UserId='';
  constructor(private authService: AuthService,
    private route: Router,
    private aroute:ActivatedRoute,
    private fb: FormBuilder,
    private tokenService: TokenStorageService,
  ) { }

  ngOnInit(): void {
    this.aroute.queryParamMap.subscribe(param=>{
      this.Code = param.get("code");
      this.UserId = param.get("userid");
    })
    // this.loginUserDetail = this.tokenService.getUserDetail();
    // if (this.loginUserDetail == null)
    //   this.route.navigate(['/auth/login']);
    // else {
      this.resetpwdForm = this.fb.group({
        ConfirmPassword: ['', [Validators.required, Validators.minLength(6)]],        
        NewPassword: ['', [Validators.required, Validators.minLength(6)]]
      });
    //}
  }
  gotohome() {
    this.route.navigate(['/dashboard']);
  }
  get f() {
    return this.resetpwdForm.controls;
  }
  onSubmit(): void {
    var ConfirmPassword = this.resetpwdForm.get("ConfirmPassword").value;
    var NewPassword = this.resetpwdForm.get("NewPassword").value;
    var payload = {
      'UserId': this.UserId,
      'Code': this.Code,
      'NewPassword': NewPassword,
      'ConfirmPassword': ConfirmPassword
    }
    debugger;
    this.authService.CallAPI(payload,'ResetPassword').subscribe(
      (data: any) => {
        ////console.log(data);
        this.isSuccessful = true;
        //this.contentservice.openSnackBar("Password reset.", this.optionsAutoClose);
        this.tokenService.signOut();
        //this.route.navigate(['/auth/login']);
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
