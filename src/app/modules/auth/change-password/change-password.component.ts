import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  form: any = {
    ConfirmPassword: null,
    OldPassword: null,
    NewPassword: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService,
    private route: Router) { }

  ngOnInit(): void {
  }
  gotohome() {
    this.route.navigate(['/']);
  }
  onSubmit(): void {
    const { ConfirmPassword, OldPassword, NewPassword } = this.form;
    debugger;
    this.authService.changePassword(ConfirmPassword, OldPassword, NewPassword).subscribe(
      data => {
        //console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      err => {
        if (err.error) {
          var modelState = err.error.ModelState;
          this.errorMessage = '';
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
      }
    );
  }
}