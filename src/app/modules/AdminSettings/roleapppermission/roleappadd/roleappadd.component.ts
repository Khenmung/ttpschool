import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-roleappAdd',
  templateUrl: './roleappAdd.component.html',
  styleUrls: ['./roleappAdd.component.scss']
})
export class roleappAddComponent implements OnInit {
  @Output() OutAppRoleId = new EventEmitter();
  @Output() CallParentPageFunction = new EventEmitter();
  @Input("AppRoleId") AppRoleId: number;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  loading =false;
  allMasterData = [];
  AppRoles = [];
  Roles = [];
  Applications = [];
  Permissions=[];
  //Users = [];
  AppRoleData = {
    PermissionId: 0,
    ApplicationId:0,
    RoleId: 0,
    ApplicationRoleId: 0,
    OrgId: 0,
    DepartmentId:0,
    LocationId:0,
    CreatedDate:new Date(),
    CreatedBy:0,
    UpdatedDate:new Date(),
    UpdatedBy:0,
    Active: 1
  };
  UserDetail = [];
  constructor(
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService,
    private fb: FormBuilder,
    private tokenstorage: TokenStorageService
  ) {

  }

  AppRoleForm = this.fb.group({
    ApplicationRoleId: [0],
    PermissionId:[0, Validators.required],
    ApplicationId: [0, Validators.required],
    RoleId: [0, Validators.required],
    Active: [1, Validators.required],
  })

  ngOnInit(): void {
      
  }
  PageLoad(){
    debugger;
    this.loading =true;
    this.UserDetail = this.tokenstorage.getUserDetail();
    if (this.UserDetail == null) {
      this.route.navigate(['auth/login']);
      //return;
    }
    // this.shareddata.GetApplication().subscribe((data:any)=>{
    //   this.Applications = data.value.map(item=>{
    //     return item;
    //   });
    // });
    this.shareddata.CurrentApplication.subscribe(a => this.Applications = a);
    this.shareddata.CurrentRoles.subscribe(r => this.Roles = r);
    //this.shareddata.CurrentApplication.subscribe(a=>this.Applications = a);
    this.Permissions = globalconstants.PERMISSIONTYPES;
    this.GetAppRole();
  }

  back() {
      this.OutAppRoleId.emit(0);
  }
  get f() {
    return this.AppRoleForm.controls;
  }

  GetAppRole() {

    let list: List = new List();
    list.fields = ["ApplicationRoleId", "ApplicationId","RoleId","PermissionId","Active"];
    list.PageName = "ApplicationRoles";
    list.filter = ["Active eq 1 and ApplicationRoleId eq " + this.AppRoleId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
      //  console.log('roleuser', data);
        data.value.forEach(element => {
          this.AppRoleForm.patchValue({
            ApplicationRoleId: element.ApplicationRoleId,
            PermissionId: element.PermissionId,
            RoleId: element.RoleId,
            ApplicationId:element.ApplicationId,
            Active: element.Active
          })
        });          
        });
        this.loading =false;
  }

  UpdateOrSave() {

    if(this.AppRoleForm.get("ApplicationId").value ==0)
    {
      this.alert.error("Please select application.", this.optionsNoAutoClose);
      return;
    }
    if(this.AppRoleForm.get("RoleId").value ==0)
    {
      this.alert.error("Please select role", this.optionsNoAutoClose);
      return;
    }
    if(this.AppRoleForm.get("PermissionId").value ==0)
    {
      this.alert.error("Please select permission", this.optionsNoAutoClose);
      return;
    }
    
    let checkFilterString = "Active eq 1 " +
      " and RoleId eq " + this.AppRoleForm.get("RoleId").value +
      " and ApplicationId eq " + this.AppRoleForm.get("ApplicationId").value+
      " and OrgId eq " + this.UserDetail[0]["orgId"];

    if (this.AppRoleData.ApplicationRoleId > 0)
      checkFilterString += " and ApplicationRoleId ne " + this.AppRoleData.ApplicationRoleId;

    let list: List = new List();
    list.fields = ["ApplicationRoleId"];
    list.PageName = "ApplicationRoles";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          //console.log(this.UserDetail);
          this.AppRoleData.Active = this.AppRoleForm.get("Active").value==true?1:0;
          this.AppRoleData.ApplicationRoleId = this.AppRoleForm.get("ApplicationRoleId").value;
          this.AppRoleData.ApplicationId = this.AppRoleForm.get("ApplicationId").value;
          this.AppRoleData.RoleId = this.AppRoleForm.get("RoleId").value;
          this.AppRoleData.PermissionId = this.AppRoleForm.get("PermissionId").value;
          this.AppRoleData.OrgId = this.UserDetail[0]["orgId"];
          this.AppRoleData.DepartmentId=0;
          this.AppRoleData.LocationId=0;
          this.AppRoleData.CreatedDate=new Date();
          this.AppRoleData.CreatedBy=this.UserDetail[0].userId;
          this.AppRoleData.UpdatedDate=new Date();
          this.AppRoleData.UpdatedBy=this.UserDetail[0].userId;
          console.log('data',this.AppRoleData);
          if (this.AppRoleData.ApplicationRoleId == 0) {
            this.insert();
          }
          else {
            this.update();
          }
          this.OutAppRoleId.emit(0);
          this.CallParentPageFunction.emit();
        }        
      });
  }

  insert() {

    debugger;
    this.dataservice.postPatch('ApplicationRoles', this.AppRoleData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {

    this.dataservice.postPatch('ApplicationRoles', this.AppRoleData, this.AppRoleData.ApplicationRoleId, 'patch')
      .subscribe(
        (data: any) => {
          this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
}
