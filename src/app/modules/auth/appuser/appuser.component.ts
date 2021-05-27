import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';

@Component({
  selector: 'app-appuser',
  templateUrl: './appuser.component.html',
  styleUrls: ['./appuser.component.scss']
})
export class AppuserComponent implements OnInit {
  breakpoint=0;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SaveDisable = false;
  ApplicationUserId = 0;
  allMasterData = [];
  AppUsers = [];
  AppUsersForm: FormGroup;
  AppUsersData = {
    ApplicationUserId: 0,
    UserName: '',
    EmailAddress: 0,
    Address: 0,
    ContactNo: '',
    ValidFrom: Date,
    ValidTo: Date,
    Remarks:'',
    CreatedDate:new Date(),
    UpdatedDate:new Date(),
    CreatedBy:0,
    UpdatedBy:0,    
    Active: 1,
  }
  constructor(private dataservice: NaomitsuService,
    private aRoute: ActivatedRoute,
    private alert: AlertService,
    private nav: Router,
    private fb: FormBuilder,
    private shareddata: SharedataService) { }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 3;
    //console.log('breakpoint',this.breakpoint);
    var date = new Date();
    this.AppUsersForm = this.fb.group({      
      ApplicationUserId: [0],
      UserName: ['', [Validators.required]],
      EmailAddress: ['', [Validators.required]],
      Address: [''],
      ContactNo: ['', [Validators.required]],
      ValidFrom:[new Date()],
      ValidTo: [date.setDate(date.getDate() + globalconstants.TrialPeriod)],    
      Remarks:[''],
      Active: [1],
    });
  }
  PageLoad() {
    debugger;
    //this.GetAppUsers();
  }
  get f() { return this.AppUsersForm.controls }

  
  GetAppUsers() {

    let list: List = new List();
    list.fields = ["*"];
    list.PageName = "AppUsers";
    list.filter = ["Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.AppUsers =[...data.value];
        }
        else
          this.alert.error("Problem fetching app users", this.optionsNoAutoClose);
      });

  }
  
  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 3;
  }
  back() {
    this.nav.navigate(['/admin/dashboardstudent']);
  }
  UpdateOrSave() {
    debugger;
    let ErrorMessage = '';

    // if (this.AppUsersForm.get("ContactNo").value == 0) {
    //   ErrorMessage += "Please select contact.<br>";
    // }
    if (this.AppUsersForm.get("UserName").value == 0) {
      ErrorMessage += "User name is required.<br>";
    }
    if (this.AppUsersForm.get("EmailAddress").value == 0) {
      ErrorMessage += "Please select Section.<br>";
    }
    // if (this.AppUsersForm.get("Address").value == 0) {
    //   ErrorMessage += "Please select Address.<br>";
    // }
    // if (this.AppUsersForm.get("ValidFrom").value == 0) {
    //   ErrorMessage += "ValidFrom is required.<br>";
    // }
    // if (this.AppUsersForm.get("ValidTo").value == 0) {
    //   ErrorMessage += "Valid To is required.<br>";
    // }
    if (ErrorMessage.length > 0) {
      this.alert.error(ErrorMessage, this.optionsNoAutoClose);
      return;
    }
    else {
      this.AppUsersData.Active = 1;
      this.AppUsersData.UserName = this.AppUsersForm.get("UserName").value;
      this.AppUsersData.EmailAddress = this.AppUsersForm.get("EmailAddress").value;
      this.AppUsersData.Address = this.AppUsersForm.get("Address").value;
      this.AppUsersData.ContactNo = this.AppUsersForm.get("ContactNo").value;
      this.AppUsersData.ValidFrom = this.AppUsersForm.get("ValidFrom").value;
      this.AppUsersData.ValidTo = this.AppUsersForm.get("ValidTo").value;
      this.AppUsersData.Remarks = this.AppUsersForm.get("Remarks").value;
      this.AppUsersData.CreatedBy =0;
      this.AppUsersData.UpdatedBy =0;
      this.AppUsersData.ApplicationUserId = this.ApplicationUserId;

      if (this.ApplicationUserId == 0)
        this.insert();
      else {
        this.update();
      }
    }
  }

  insert() {

    debugger;
    this.dataservice.postPatch('AppUsers', this.AppUsersData, 0, 'post')
      .subscribe(
        (data: any) => {
          
          this.alert.success("Data saved successfully", this.optionsAutoClose);
          //this.router.navigate(['/home/pages']);
        });

  }
  update() {

    this.dataservice.postPatch('AppUsers', this.AppUsersData, this.ApplicationUserId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully", this.optionsAutoClose);
          //this.router.navigate(['/home/pages']);
        });
  }
  getDropDownData(dropdowntype) {
    let Id = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })[0].MasterDataId;
    return this.allMasterData.filter((item, index) => {
      return item.ParentId == Id
    });
  }
}
