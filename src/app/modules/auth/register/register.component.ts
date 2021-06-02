import { Component, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { AuthService } from '../../../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
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
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  mediaSub: Subscription;
  deviceXs: boolean;
  RegistrationForm: FormGroup;
  ApplicationRoleUserData = {
    ApplicationRoleUserId: 0,
    Active: 1,
    UserId: 0,
    RoleId: 0,
    ApplicationId: 0,
    CreatedDate: new Date(),
    UpdatedDate: new Date(),
    CreatedBy: 0,
    UpdatedBy: 0
  };
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private alert: AlertService,
    private route: Router,
    private dataservice: NaomitsuService,
    private mediaObserver: MediaObserver
  ) { }

  ngOnInit(): void {
    this.RegistrationForm = this.fb.group({
      UserName: ['', Validators.required],
      ContactNo: ['', Validators.required],
      OrganisationName: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      ConfirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    })
    this.mediaSub = this.mediaObserver.media$.subscribe((result: MediaChange) => {
      this.deviceXs = result.mqAlias === "xs" ? true : false;
      //console.log("authlogin",this.deviceXs);
    }); 
  }
  gotohome() {
    this.route.navigate(['/home']);
  }
  gotologin() {
    this.route.navigate(['/auth/login']);
  }
  PageLoad(){
   
  }

  AddAppUsers() {
    var today = new Date();

    let list: List = new List();
    list.fields = ["EmailAddress"];
    list.PageName = "AppUsers";
    list.filter = ["EmailAddress eq '" + this.RegistrationForm.get("Email").value + "' and Active eq 1"];
    let AppUsersData = {
      EmailAddress: this.RegistrationForm.get("Email").value,
      ContactNo: this.RegistrationForm.get("ContactNo").value,
      UserName: this.RegistrationForm.get("UserName").value,
      CreatedDate: today,
      ValidFrom: today,
      ValidTo: today,// new Date(today.setDate(today.getMonth() + 1)),
      Active: 1
    }
    debugger;
    this.dataservice.postPatch('AppUsers', AppUsersData, 0, 'post')
      .subscribe(
        (appuser: any) => {
          let UserId = appuser.ApplicationUserId;
          let list: List = new List();
          list.fields = ["MasterDataId"];
          list.PageName = "MasterDatas";
          list.filter = ["MasterDataName eq '" + globalconstants.MasterDefinitions[0].application[0].ORGANIZATION + "' and ParentId eq 0"];
          //fetching id of top organisation id
          this.dataservice.get(list).subscribe((orgid: any) => {
            //console.log('organisation fetch value', data);
            if (orgid.value.length > 0) {
              let mastertoUpdate = {
                MasterDataName: this.RegistrationForm.get("OrganisationName").value,
                ParentId: orgid.value[0].MasterDataId,
                CreatedDate: new Date(),
                Active: 1
              }
              //insert Organisation name to master data.
              this.dataservice.postPatch('MasterDatas', mastertoUpdate, 0, 'post').subscribe((org: any) => {
                //  console.log('return from org insert', org)
                if (org != null) {

                  //updating OrgId to user table.
                  AppUsersData["OrgId"] = org.MasterDataId;

                  this.dataservice.postPatch('AppUsers', AppUsersData, UserId, 'patch').subscribe((data: any) => {
                    console.log('permi', globalconstants.PERMISSIONTYPES);
                    this.ApplicationRoleUserData.Active = 1;
                    this.ApplicationRoleUserData.ApplicationId = +org.MasterDataId;
                    this.ApplicationRoleUserData.RoleId = +globalconstants.PERMISSIONTYPES.filter(p=>p.type=="full")[0].val;
                    this.ApplicationRoleUserData.UserId = +appuser.ApplicationUserId;
                    this.ApplicationRoleUserData.CreatedDate = new Date();
                    this.ApplicationRoleUserData.UpdatedDate = new Date();
                    this.ApplicationRoleUserData.CreatedBy = +appuser.ApplicationUserId;
                    this.ApplicationRoleUserData.UpdatedBy = +appuser.ApplicationUserId;

                    this.dataservice.postPatch('ApplicationRoleUsers', this.ApplicationRoleUserData, 0, 'post')
                      .subscribe(
                        (data: any) => {
                          this.alert.success("Congratulations! Your registration is successful.", this.optionsNoAutoClose);
                          this.isSuccessful = true;
                          this.isSignUpFailed = false;
                        });
                  }, (error) => {
                    console.log('updating appusers error', error);

                  })
                }
              })
            }
            else
              this.alert.error("Registration issue. Please try again.", this.optionsNoAutoClose);
            //this.alert.success("Data saved successfully", this.optionsAutoClose);
            //this.router.navigate(['/home/pages']);

          });
        })

  }
  get f() { return this.RegistrationForm.controls; }

  onSave(): void {
    this.errorMessage = '';
    const { ConfirmPassword, Email, Password, OrganisationName } = this.RegistrationForm.value;
    debugger;
    this.authService.register(ConfirmPassword, Email, Password).subscribe(
      data => {
        console.log('register data', data);
        this.AddAppUsers()
        // this.isSuccessful = true;
        // this.isSignUpFailed = false;
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