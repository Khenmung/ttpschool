import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { AuthService } from '../../../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit { PageLoading=true;
  loading = false;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  form: any = {
    ConfirmPassword: null,
    Email: null,
    Password: null
  };
  CustomerPlan = [];
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  mediaSub: Subscription;
  deviceXs: boolean;
  RegistrationForm: UntypedFormGroup;
  ApplicationRoleUserData = {
    ApplicationRoleUserId: 0,
    Active: 1,
    UserId: 0,
    RoleId: 0,
    PlanId: 0,
    ApplicationId: 0,
    CreatedDate: new Date(),
    UpdatedDate: new Date(),
    CreatedBy: 0,
    UpdatedBy: 0
  };
  constructor(private servicework: SwUpdate,
    private shareddata: SharedataService,
    private authService: AuthService,
    private fb: UntypedFormBuilder,
    private contentservice: ContentService,
    private route: Router,
    private dataservice: NaomitsuService,
    private mediaObserver: MediaObserver
  ) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    this.RegistrationForm = this.fb.group({
      UserName: ['', Validators.required],
      ContactNo: ['', Validators.required],
      OrganizationName: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      ConfirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    })
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
      ////console.log("authlogin",this.deviceXs);
    });
    this.shareddata.CurrentCustomerPlan.subscribe(p => this.CustomerPlan = p);
  }
  gotohome() {
    this.route.navigate(['/dashboard']);
  }
  gotologin() {
    this.route.navigate(['/auth/login']);
  }
  PageLoad() {

  }
  selectplan(){
    this.route.navigate(["/auth/selectplan"]);
  }
  AddAppUsers() {
    let orgToUpdate = {
      OrganizationName: this.RegistrationForm.get("OrganizationName").value,
      Active: 1
    }
    this.dataservice.postPatch('Organizations', orgToUpdate, 0, 'post')
      .subscribe(
        (organization: any) => {
          var today = new Date();
          let list: List = new List();
          list.fields = ["EmailAddress"];
          list.PageName = "AppUsers";
          list.filter = ["EmailAddress eq '" + this.RegistrationForm.get("Email").value + "' and Active eq 1"];
          let AppUsersData = {
            EmailAddress: this.RegistrationForm.get("Email").value,
            ContactNo: this.RegistrationForm.get("ContactNo").value,
            UserName: this.RegistrationForm.get("UserName").value,
            OrgId: organization.OrganizationId,
            CreatedDate: today,
            ValidFrom: today,
            ValidTo: today,// new Date(today.setDate(today.getMonth() + 1)),
            Active: 1
          }
          //debugger;
          this.dataservice.postPatch('AppUsers', AppUsersData, 0, 'post')
            .subscribe(
              (appuser: any) => {
                this.contentservice.openSnackBar("Congratulations! Your registration is successful.",globalconstants.ActionText,globalconstants.RedBackground);
                this.isSuccessful = true;
                this.isSignUpFailed = false;
              }, (error) => {
                //console.log('creating user error', error);

              });
        }, (error) => {
          //console.log('creating organization error', error);

        })

  }
  get f() { return this.RegistrationForm.controls; }

  onSave(): void {
    debugger;
    this.loading=true;
    this.errorMessage = '';
    const { UserName, ConfirmPassword, Email, Password, OrganizationName, ContactNo } = this.RegistrationForm.value;
    if(this.contentservice.checkSpecialChar(UserName))
    {
      this.loading=false;this.PageLoading=false;
      this.contentservice.openSnackBar("user name should not contains space or special characters.",globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    
    //debugger;
    var userDetail = {
      ConfirmPassword: ConfirmPassword,
      Email: Email,
      Password: Password,
      Username: UserName,
      OrganizationName: OrganizationName,
      ContactNo: ContactNo,
      RoleName:'Admin'
    }
    this.authService.CallAPI(userDetail,'Register').subscribe(
      data => {
        //this.AddAppUsers()
        this.contentservice.openSnackBar("Congratulations! Your registration is successful.",  globalconstants.ActionText,globalconstants.BlueBackground);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.loading=false;this.PageLoading=false;
      },
      err => {
        var modelState;
        if (err.error.ModelState != null)
          modelState = JSON.parse(JSON.stringify(err.error.ModelState));
        else if (err.error != null)
          modelState = JSON.parse(JSON.stringify(err.error));
        else
          modelState = JSON.parse(JSON.stringify(err));

        //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
        for (var key in modelState) {
          if (modelState.hasOwnProperty(key) && key.toLowerCase() == 'errors') {
            for(var key1 in modelState[key])
            this.errorMessage += (this.errorMessage == "" ? "" : this.errorMessage + "<br/>") + modelState[key][key1];
            //errors.push(modelState[key]);//list of error messages in an array
          }
        }
        this.contentservice.openSnackBar(this.errorMessage,globalconstants.ActionText,globalconstants.RedBackground);
        this.isSignUpFailed = true;
        this.loading=false;this.PageLoading=false;
        //console.log(err.error)
      }
    );
  }
}