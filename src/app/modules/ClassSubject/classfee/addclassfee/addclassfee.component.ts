import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AlertService } from '../../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';

@Component({
  selector: 'app-addclassfee',
  templateUrl: './addclassfee.component.html',
  styleUrls: ['./addclassfee.component.scss']
})
export class AddclassfeeComponent implements OnInit {
 loading=false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  duplicate = false;
  Id = 0;
  FeeNames = [];
  Classes = [];
  Batches = [];
  allMasterData = [];
  Locations = [];
  classfeeForm = new FormGroup({
    ClassFeeId: new FormControl(0),
    FeeNameId: new FormControl(0, [Validators.required]),
    ClassId: new FormControl(0, [Validators.required]),
    Amount: new FormControl(0, [Validators.required]),
    //Batch: new FormControl(0, [Validators.required]),
    Active: new FormControl(true, [Validators.required]),
    LocationId: new FormControl(0)
  });
  classFeeData = {
    ClassFeeId: 0,
    FeeNameId: 0,
    ClassId: 0,
    Amount: 0,
    BatchId: 0,
    OrgId:0,
    Active: 0,
    LocationId: 0
  };
  SelectedBatchId=0;
  loginUserDetail=[];
  constructor(private dataservice: NaomitsuService,
    private alert: AlertService,
    private tokenService:TokenStorageService,
    private shareddata:SharedataService
    ) { }

  ngOnInit(): void {
    //this.shareddata.CurrentSelectedBatchId.subscribe(b=>this.SelectedBatchId=b);
    this.SelectedBatchId = +this.tokenService.getSelectedBatchId();
      
    this.shareddata.CurrentBatch.subscribe(b=>this.Batches=b);
    this.loginUserDetail = this.tokenService.getUserDetail();
    this.GetMasterData();
  }
  get f() { return this.classfeeForm.controls }
  GetMasterData() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.allMasterData = [...data.value];
        this.FeeNames = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].FEENAME);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASS);
        this.Locations = this.getDropDownData(globalconstants.MasterDefinitions[0].applications[0].LOCATION);
        this.classfeeForm.patchValue({ "LocationId": this.Locations[0].MasterDataId });
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
  save() {
    var orgIDFilter = ' and OrgId eq ' +  this.loginUserDetail[0]["orgId"];
    this.duplicate = false;
    let checkFilterString = "Active eq 1 " +
      " and FeeNameId eq " + this.classfeeForm.get("FeeNameId").value +
      " and ClassId eq " + this.classfeeForm.get("ClassId").value +
      " and Batch eq " + this.SelectedBatchId +
    " and LocationId eq " + this.classfeeForm.get("LocationId").value

    let list: List = new List();
    list.fields = ["ClassFeeId"];
    list.PageName = "ClassFees";
    list.filter = [checkFilterString + orgIDFilter];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.duplicate = true;
          this.alert.error("Record already exists!", this.options);         
        }
        else
        {
          this.insert();
        }
      });

  }
  
  insert() {
    //this.checkDuplicate();
    this.classFeeData.Active = 1;
    this.classFeeData.Amount = this.classfeeForm.get("Amount").value;
    this.classFeeData.BatchId = this.SelectedBatchId;
    this.classFeeData.OrgId = this.loginUserDetail[0]["orgId"];
    this.classFeeData.ClassFeeId = this.classfeeForm.get("FeeNameId").value;
    this.classFeeData.ClassId = this.classfeeForm.get("ClassId").value;
    this.classFeeData.FeeNameId = this.classfeeForm.get("FeeNameId").value;
    this.classFeeData.LocationId = this.classfeeForm.get("LocationId").value;
    debugger;
    this.dataservice.postPatch('ClassFees', this.classFeeData, 0, 'post')
      .subscribe(
        (data: any) => {

          this.alert.success("Data saved successfully", this.options);
          //this.router.navigate(['/home/pages']);
        });

  }
  update() {
    this.classFeeData.Active = 1;
    this.classFeeData.Amount = this.classfeeForm.get("Amount").value;
    this.classFeeData.BatchId = this.SelectedBatchId;
    this.classFeeData.OrgId = this.loginUserDetail[0]["orgId"];
    this.classFeeData.ClassFeeId = this.classfeeForm.get("ClassFeeId").value;
    this.classFeeData.ClassId = this.classfeeForm.get("ClassId").value;
    this.classFeeData.FeeNameId = this.classfeeForm.get("FeeNameId").value;
    this.classFeeData.LocationId = this.classfeeForm.get("LocationId").value;

    this.dataservice.postPatch('ClassFees', this.classfeeForm.value, this.Id, 'patch')
      .subscribe(
        (data: any) => {

          this.alert.success("Data updated successfully", this.options);
          //this.router.navigate(['/home/pages']);
        });

  }

}
