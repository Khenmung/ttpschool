import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
//import { EventEmitter } from 'events';
//import { filter } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class userComponent implements OnInit {
loading=false;
  @Input("UserId") UserId:number;
@Output() UserIdOutput=new EventEmitter();

title ='';
  breakpoint = 0;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SaveDisable = false;
  //ApplicationUserId = 0;
  allMasterData = [];
  AppUsers = [];
  Departments=[];
  Locations=[];
  AppUsersForm: FormGroup;
  AppUsersData = {
    ApplicationUserId: 0,
    UserName: '',
    EmailAddress: 0,
    Address: 0,
    ContactNo: '',
    ValidFrom: Date,
    ValidTo: Date,
    OrgId: 0,
    DepartmentId: 0,
    LocationId: 0,
    ManagerId: 0,
    Remarks: '',
    CreatedDate: new Date(),
    UpdatedDate: new Date(),
    CreatedBy: 0,
    UpdatedBy: 0,
    Active: 1,
  }
  selectedIndex = 0;
  constructor(private dataservice: NaomitsuService,
    private aRoute: ActivatedRoute,
    private alert: AlertService,
    private nav: Router,
    private fb: FormBuilder,
    private sharedData: SharedataService) { }

  ngOnInit(): void {
    
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 3;
    //console.log('breakpoint',this.breakpoint);
    this.title=this.UserId>0?'Update Detail':'Add User';
    var date = new Date();
    var validto = date.setDate(date.getDate() + globalconstants.TrialPeriod);
    this.AppUsersForm = this.fb.group({
      ApplicationUserId: [0],
      UserName: ['', [Validators.required]],
      EmailAddress: ['', [Validators.required]],
      Address: [''],
      ContactNo: ['', [Validators.required]],
      ValidFrom: [new Date()],
      ValidTo: [validto],
      OrgId: [0],
      DepartmentId: [null],
      LocationId: [null],
      ManagerId: [null],
      Remarks: [''],
      Active: [1],
    });
    this.sharedData.CurrentLocation.subscribe(d => this.Locations = d);
    this.sharedData.CurrentDepartment.subscribe(d => this.Departments = d);

    this.GetAppUsers();
  }
  PageLoad() {
    //debugger;
    //this.GetAppUsers();
  }
  get f() { return this.AppUsersForm.controls }


  GetAppUsers() {

    var filterstr = '';
    if (this.UserId > 0) {
      filterstr = ' and ApplicationUserId eq ' + this.UserId;
    }
    else
      return;

    let list: List = new List();
    list.fields = ["*"];
    list.PageName = "AppUsers";
    list.filter = ["Active eq 1" + filterstr];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.AppUsers = [...data.value];
          this.AppUsers.forEach(item => {
            this.AppUsersForm.patchValue({
              ApplicationUserId: item.ApplicationUserId,
              UserName: item.UserName,
              EmailAddress: item.EmailAddress,
              Address: item.Address,
              ContactNo: item.ContactNo,
              ValidFrom: item.ValidFrom,
              ValidTo: item.ValidTo,
              OrgId: item.OrgId,
              DepartmentId: item.DepartmentId,
              LocationId: item.LocationId,
              ManagerId: item.ManagerId,
              Remarks: item.Remarks,
              Active: item.Active
            })
          });
        }
        else
          this.alert.error("Problem fetching app users", this.optionsNoAutoClose);
      });

  }
  checkDuplicate(value) {
    var today = new Date();

    let list: List = new List();
    list.fields = ["ApplicationUserId"];
    list.PageName = "AppUsers";
    list.filter = ["EmailAddress eq '" + value + "' and Active eq 1"];

    this.dataservice.get(list)
      .subscribe(
        (data: any) => {
               if(data.value.length>0)
               {
                 this.AppUsersForm.get("Email").setErrors({'duplicate':true})
               }                     
        })
  }
  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 3;
  }
  back() {
    this.UserIdOutput.emit(0);
    
    //this.nav.navigate(['/admin/dashboardstudent']);
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
      if (this.UserId == 0)
        this.AppUsersData.OrgId = null;//this.AppUsersForm.get("OrgId").value;
      else
        this.AppUsersData.OrgId = this.AppUsersForm.get("OrgId").value;
      
        this.AppUsersData.DepartmentId = this.AppUsersForm.get("DepartmentId").value;
      this.AppUsersData.LocationId = this.AppUsersForm.get("LocationId").value;
      this.AppUsersData.ManagerId = this.AppUsersForm.get("ManagerId").value;
      this.AppUsersData.Remarks = this.AppUsersForm.get("Remarks").value;
      this.AppUsersData.CreatedBy = 0;
      this.AppUsersData.UpdatedBy = 0;
      this.AppUsersData.ApplicationUserId = this.UserId;
      debugger;
      if (this.UserId == 0)
        this.insert();
      else {
        this.update();
      }
      
    }
  }
  tabChanged($event) {

  }
  insert() {

    debugger;
    this.dataservice.postPatch('AppUsers', this.AppUsersData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.UserIdOutput.emit(0);
          this.alert.success("Data saved successfully", this.optionsAutoClose);
          //this.router.navigate(['/home/pages']);
      
        });

  }
  update() {

    this.dataservice.postPatch('AppUsers', this.AppUsersData, this.UserId, 'patch')
      .subscribe(
        (data: any) => {
          this.UserIdOutput.emit(0);
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
