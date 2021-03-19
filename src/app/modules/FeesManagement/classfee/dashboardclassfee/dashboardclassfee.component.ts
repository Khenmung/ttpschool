import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';

@Component({
  selector: 'app-dashboardclassfee',
  templateUrl: './dashboardclassfee.component.html',
  styleUrls: ['./dashboardclassfee.component.scss']
})
export class DashboardclassfeeComponent implements OnInit {
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  FeeNames = [];
  Classes = [];
  Batches = [];
  Locations = [];
  ELEMENT_DATA: Element[];
  dataSource: MatTableDataSource<Element>;
  allMasterData = [];
  searchForm = new FormGroup({
    ClassId: new FormControl(0),
    FeeNameId: new FormControl(0),
    Batch: new FormControl(0),
  });
  classFeeData = {
    ClassFeeId: 0,
    FeeNameId: 0,
    ClassId: 0,
    Amount: 0,
    Batch: 0,
    Active: 0,
    LocationId: 0
  };
  constructor(private dataservice: NaomitsuService,
    private alert: AlertService) { }

  ngOnInit(): void {
    this.GetMasterData();
    this.GetClassFee();


  }

  //displayedColumns = ['position', 'name', 'weight', 'symbol'];
  displayedColumns = ['SlNo', 'FeeName', 'Amount', 'Batch', 'Active', 'LocationId', 'Action'];
  updateActive() {

  }
  updateAlbum() {

  }
  getoldvalue() {

  }
  UpdateOrSave(row) {
    //this.duplicate = false;
    let checkFilterString = "Active eq 1 " +
      " and FeeNameId eq " + row.FeeNameId +
      " and ClassId eq " + row.ClassId +
      " and Batch eq " + row.Batch +
      " and LocationId eq " + row.LocationId
    if (row.ClassFeeId > 0)
      checkFilterString += " and ClassFeeId ne " + row.ClassFeeId;

    let list: List = new List();
    list.fields = ["ClassFeeId"];
    list.PageName = "ClassFees";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          //    this.duplicate = true;
          this.alert.error("Record already exists!", this.options);
        }
        else {
          this.classFeeData.Active = row.Active==true?1:0;
          this.classFeeData.Amount = row.Amount.toFixed(2);
          this.classFeeData.Batch = row.Batch;
          this.classFeeData.ClassFeeId = row.ClassFeeId;
          this.classFeeData.ClassId = row.ClassId;
          this.classFeeData.FeeNameId = row.FeeNameId;
          this.classFeeData.LocationId = row.LocationId;
          if (this.classFeeData.ClassFeeId == 0)
            this.insert();
          else
            this.update();
        }
      });
  }

  insert() {

    debugger;
    this.dataservice.postPatch('ClassFees', this.classFeeData, 0, 'post')
      .subscribe(
        (data: any) => {

          this.alert.success("Data saved successfully", this.options);
          //this.router.navigate(['/pages']);
        });

  }
  update() {

    this.dataservice.postPatch('ClassFees', this.classFeeData, this.classFeeData.ClassFeeId, 'patch')
      .subscribe(
        (data: any) => {

          this.alert.success("Data updated successfully", this.options);
          //this.router.navigate(['/pages']);
        });

  }
  GetClassFee() {
    if (this.searchForm.get("ClassId").value == 0)
      return;
    let filterstr = "Active eq 1 ";
    if (this.searchForm.get("ClassId").value > 0)
      filterstr += " and ClassId eq " + this.searchForm.get("ClassId").value;
    if (this.searchForm.get("FeeNameId").value > 0)
      filterstr += " and FeeNameId eq " + this.searchForm.get("FeeNameId").value;
    if (this.searchForm.get("Batch").value > 0)
      filterstr += " and Batch eq " + this.searchForm.get("Batch").value;

    let list: List = new List();
    list.fields = ["ClassFeeId", "FeeNameId", "ClassId", "Amount", "Batch", "Active", "LocationId"];
    list.PageName = "ClassFees";
    list.filter = [filterstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;

        if (data.value.length > 0) {

          if (this.searchForm.get("FeeNameId").value == 0) {
            this.ELEMENT_DATA = this.FeeNames.map((mainFeeName, indx) => {
              let existing = data.value.filter(fromdb => fromdb.FeeNameId == mainFeeName.MasterDataId)
              if (existing.length > 0) {
                existing[0].SlNo = indx + 1;
                existing[0].Active = existing[0].Active == 1 ? true : false;
                existing[0].FeeName = this.FeeNames.filter(item => item.MasterDataId == existing[0].FeeNameId)[0].MasterDataName;
                existing[0].Action = false;
                return existing[0];
              }
              else
                return {
                  "SlNo": indx + 1,
                  "ClassFeeId": 0,
                  "FeeNameId": mainFeeName.MasterDataId,
                  "ClassId": this.searchForm.get("ClassId").value,
                  "FeeName": mainFeeName.MasterDataName,
                  "Amount": 0,
                  "Batch": this.Batches[0].MasterDataId,
                  "Active": false,
                  "LocationId": this.Locations[0].MasterDataId,
                  "Action": false
                }
            })
          }
          else {
            this.ELEMENT_DATA = data.value.map((item, indx) => {
              return {
                "SlNo": indx + 1,
                "ClassFeeId": item.ClassFeeId,
                "FeeNameId": item.FeeNameId,
                "ClassId": item.ClassId,
                "FeeName": item.MasterDataName, //this.FeeNames.filter(cls => cls.MasterDataId == item.FeeNameId)[0].MasterDataName,
                "Amount": 0,
                "Batch": item.Batch,
                "Active": item.Active == 1 ? true : false,
                "LocationId": item.LocationId,
                "Action": false
              }
            })
          }
        }
        else {
          if (this.searchForm.get("FeeNameId").value == 0) {
            this.ELEMENT_DATA = this.FeeNames.map((item, indx) => {
              return {
                "SlNo": indx + 1,
                "ClassFeeId": 0,
                "FeeNameId": item.MasterDataId,
                "ClassId": this.searchForm.get("ClassId").value,
                "FeeName": this.FeeNames.filter(item => item.MasterDataId == this.searchForm.get("FeeNameId").value)[0].MasterDataName,
                "Amount": 0,
                "Batch": this.Batches[0].MasterDataId,
                "Active": false,
                "LocationId": this.Locations[0].MasterDataId,
                "Action": false
              }
            });
          }
          else
          {
            this.ELEMENT_DATA=[];
            this.alert.info("No record found!",this.options);
          }
        }
        this.dataSource = new MatTableDataSource<Element>(this.ELEMENT_DATA);

      });
  }
  enableAction(row) {
    row.Action = true;
    console.log('from change', row);
  }
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
        this.FeeNames = this.getDropDownData(globalconstants.FEENAMES);
        this.Classes = this.getDropDownData(globalconstants.CLASSES);
        this.Batches = this.getDropDownData(globalconstants.BATCH);
        this.Locations = this.getDropDownData(globalconstants.LOCATION);
        //this.classfeeForm.patchValue({ "LocationId": this.Locations[0].MasterDataId });
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
export interface Element {
  ClassFeeId: number;
  FeeNameId: number;
  ClassId: number;
  Amount: number;
  Batch: number;
  Active: boolean;
  LocationId: number;
}
